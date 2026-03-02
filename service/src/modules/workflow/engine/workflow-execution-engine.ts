import { Injectable, Logger } from '@nestjs/common';
import { WorkflowNodeExecutor } from './workflow-node-executor';
import { WorkflowContext } from './workflow-context';
import { WorkflowNode, WorkflowEdge, ParallelNodeConfig } from './workflow.types';
import { ParallelNodeExecutor } from './nodes/parallel-node-executor';

/**
 * 工作流执行引擎
 * 负责工作流的整体执行逻辑和流程控制
 */
@Injectable()
export class WorkflowExecutionEngine {
  private readonly logger = new Logger(WorkflowExecutionEngine.name);

  constructor(
    private readonly nodeExecutor: WorkflowNodeExecutor,
    private readonly parallelNodeExecutor: ParallelNodeExecutor,
  ) {}

  /**
   * 执行工作流
   */
  async execute(workflow: any, inputs: any): Promise<any> {
    const config = workflow.config;
    const { nodes, edges, variables } = config;

    if (!nodes || nodes.length === 0) {
      throw new Error('工作流配置无效：没有节点');
    }

    // 构建节点映射和边映射
    const nodeMap = this.buildNodeMap(nodes);
    const edgeMap = this.buildEdgeMap(edges);

    // 找到开始节点
    const startNode = nodes.find((node) => node.type === 'start');
    if (!startNode) {
      throw new Error('工作流配置无效：没有开始节点');
    }

    // 创建执行上下文
    const context = new WorkflowContext(inputs, variables);

    // 执行工作流
    const result = await this.executeNode(startNode, context, nodeMap, edgeMap);

    return {
      result,
      executionLog: context.getExecutionLog(),
      variables: context.getVariables(),
    };
  }

  /**
   * 流式执行工作流中的LLM节点
   * 先按拓扑顺序执行 LLM 节点之前的所有前置节点，再对 LLM 节点做流式执行
   */
  async *executeStream(workflow: any, inputs: any): AsyncGenerator<string> {
    const config = workflow.config;
    const { nodes, edges, variables } = config;
    if (!nodes || nodes.length === 0) {
      throw new Error('工作流配置无效：没有节点');
    }

    // 构建节点映射和边映射
    const nodeMap = this.buildNodeMap(nodes);
    const edgeMap = this.buildEdgeMap(edges || []);

    // 找到开始节点
    const startNode = nodes.find((n: any) => n.type === 'start');
    if (!startNode) {
      throw new Error('工作流配置无效：没有开始节点');
    }

    // 找到 LLM 节点
    const llmNode = nodes.find((n: any) => n.type === 'llm');
    if (!llmNode) {
      throw new Error('当前仅支持对包含 LLM 节点的工作流进行流式执行');
    }

    // 创建执行上下文
    const context = new WorkflowContext(inputs, variables);

    // 按拓扑顺序收集 LLM 节点之前的所有前置节点
    const preNodes = this.collectPreNodes(startNode.id, llmNode.id, edgeMap);

    // 依次执行所有前置节点（包括 start 节点）
    for (const preNodeId of preNodes) {
      const preNode = nodeMap.get(preNodeId);
      if (preNode) {
        const result = await this.nodeExecutor.execute(preNode, context);
        context.setNodeResult(preNode.id, result);
      }
    }

    // 现在 context 中已经有了所有前置节点的输出，使用 LLM 节点执行器的流式方法
    yield* this.nodeExecutor.executeStreamLLM(llmNode, context);
  }

  /**
   * 按 BFS 收集从 startId 到 targetId 之间的所有前置节点（不包含 targetId）
   */
  private collectPreNodes(
    startId: string,
    targetId: string,
    edgeMap: Map<string, string[]>,
  ): string[] {
    const visited = new Set<string>();
    const order: string[] = [];
    const queue: string[] = [startId];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      if (nodeId === targetId) continue; // 不执行目标 LLM 节点
      visited.add(nodeId);
      order.push(nodeId);

      const nextIds = edgeMap.get(nodeId) || [];
      for (const nextId of nextIds) {
        if (!visited.has(nextId)) {
          queue.push(nextId);
        }
      }
    }

    return order;
  }

  /**
   * 构建节点映射
   */
  private buildNodeMap(nodes: WorkflowNode[]): Map<string, WorkflowNode> {
    const nodeMap = new Map<string, WorkflowNode>();
    nodes.forEach((node) => {
      nodeMap.set(node.id, node);
    });
    return nodeMap;
  }

  /**
   * 构建边映射（邻接表）
   */
  private buildEdgeMap(edges: WorkflowEdge[]): Map<string, string[]> {
    const edgeMap = new Map<string, string[]>();
    edges.forEach((edge) => {
      if (!edgeMap.has(edge.source)) {
        edgeMap.set(edge.source, []);
      }
      edgeMap.get(edge.source)!.push(edge.target);
    });
    return edgeMap;
  }

  /**
   * 执行单个节点
   */
  private async executeNode(
    node: WorkflowNode,
    context: WorkflowContext,
    nodeMap: Map<string, WorkflowNode>,
    edgeMap: Map<string, string[]>,
  ): Promise<any> {
    // 记录节点开始执行
    context.logExecution(node.id, node.type, `开始执行节点: ${node.data?.label || node.type}`);

    try {
      // 执行节点
      const result = await this.nodeExecutor.execute(node, context);

      // 保存节点执行结果
      context.setNodeResult(node.id, result);

      // 记录成功日志
      context.logExecution(node.id, node.type, `节点执行成功: ${node.data?.label || node.type}`, result);

      // 执行后续节点
      return await this.executeNextNodes(node, result, context, nodeMap, edgeMap);
    } catch (error) {
      // 记录错误日志
      context.logExecution(node.id, node.type, `节点执行失败: ${error.message}`, undefined, error.message);
      throw error;
    }
  }

  /**
   * 执行后续节点
   */
  private async executeNextNodes(
    currentNode: WorkflowNode,
    currentResult: any,
    context: WorkflowContext,
    nodeMap: Map<string, WorkflowNode>,
    edgeMap: Map<string, string[]>,
  ): Promise<any> {
    const nextNodeIds = edgeMap.get(currentNode.id) || [];

    if (nextNodeIds.length === 0) {
      return currentResult;
    }

    // 根据节点类型决定执行策略
    switch (currentNode.type) {
      case 'condition':
        return await this.handleConditionNode(currentResult, nextNodeIds, context, nodeMap, edgeMap);
      case 'loop':
        return await this.handleLoopNode(currentNode, currentResult, context, nodeMap, edgeMap);
      case 'parallel':
        return await this.handleParallelNode(currentNode, currentResult, nextNodeIds, context, nodeMap, edgeMap);
      default:
        // 普通节点：执行第一个后续节点
        const nextNode = nodeMap.get(nextNodeIds[0]);
        if (nextNode) {
          return await this.executeNode(nextNode, context, nodeMap, edgeMap);
        }
        return currentResult;
    }
  }

  /**
   * 处理条件节点的后续执行
   */
  private async handleConditionNode(
    result: any,
    nextNodeIds: string[],
    context: WorkflowContext,
    nodeMap: Map<string, WorkflowNode>,
    edgeMap: Map<string, string[]>,
  ): Promise<any> {
    const conditionResult = result.data?.conditionResult;
    const nextNodeId = conditionResult ? nextNodeIds[0] : nextNodeIds[1];

    if (nextNodeId) {
      const nextNode = nodeMap.get(nextNodeId);
      if (nextNode) {
        return await this.executeNode(nextNode, context, nodeMap, edgeMap);
      }
    }
    return result;
  }

  /**
   * 处理循环节点的后续执行
   */
  private async handleLoopNode(
    loopNode: WorkflowNode,
    result: any,
    context: WorkflowContext,
    nodeMap: Map<string, WorkflowNode>,
    edgeMap: Map<string, string[]>,
  ): Promise<any> {
    if (result.data?.shouldContinue) {
      // 继续循环
      return await this.executeNode(loopNode, context, nodeMap, edgeMap);
    } else {
      // 退出循环，执行后续节点
      const nextNodeIds = edgeMap.get(loopNode.id) || [];
      if (nextNodeIds.length > 0) {
        const nextNode = nodeMap.get(nextNodeIds[0]);
        if (nextNode) {
          return await this.executeNode(nextNode, context, nodeMap, edgeMap);
        }
      }
    }
    return result;
  }

  /**
   * 处理并行节点的后续执行
   * 支持 strategy(all/any/race)、timeout、errorHandling(fail-fast/continue/ignore)
   */
  private async handleParallelNode(
    currentNode: WorkflowNode,
    currentResult: any,
    nextNodeIds: string[],
    context: WorkflowContext,
    nodeMap: Map<string, WorkflowNode>,
    edgeMap: Map<string, string[]>,
  ): Promise<any> {
    const config = (currentNode.data?.config || {}) as ParallelNodeConfig;
    const {
      strategy = 'all',
      timeout = 60,
      errorHandling = 'fail-fast',
    } = config;

    const timeoutMs = timeout * 1000;
    const branchResults: Array<{
      branchId: string;
      nodeId: string;
      status: 'completed' | 'failed' | 'timeout';
      result: any;
      error?: string;
      duration: number;
      timestamp: string;
    }> = [];

    // 为每个分支创建一个带超时的执行 Promise
    const branchPromises = nextNodeIds.map((nextNodeId, index) => {
      const nextNode = nodeMap.get(nextNodeId);
      if (!nextNode) {
        return Promise.resolve({
          branchId: `branch_${index + 1}`,
          nodeId: nextNodeId,
          status: 'failed' as const,
          result: null,
          error: `节点 ${nextNodeId} 不存在`,
          duration: 0,
          timestamp: new Date().toISOString(),
        });
      }

      const startTime = Date.now();

      // 分支执行 Promise
      const executionPromise = this.executeNode(nextNode, context, nodeMap, edgeMap)
        .then((result) => ({
          branchId: `branch_${index + 1}`,
          nodeId: nextNodeId,
          status: 'completed' as const,
          result,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        }))
        .catch((error) => ({
          branchId: `branch_${index + 1}`,
          nodeId: nextNodeId,
          status: 'failed' as const,
          result: null,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        }));

      // 超时 Promise
      const timeoutPromise = new Promise<typeof branchResults[0]>((resolve) =>
        setTimeout(() => {
          resolve({
            branchId: `branch_${index + 1}`,
            nodeId: nextNodeId,
            status: 'timeout' as const,
            result: null,
            error: `分支执行超时 (${timeout}s)`,
            duration: timeoutMs,
            timestamp: new Date().toISOString(),
          });
        }, timeoutMs),
      );

      return Promise.race([executionPromise, timeoutPromise]);
    });

    // 根据策略执行
    try {
      switch (strategy) {
        case 'race': {
          // 返回最先完成的分支结果
          const firstResult = await Promise.race(branchPromises);
          branchResults.push(firstResult);
          break;
        }

        case 'any': {
          // 等待任一成功完成
          const results = await Promise.allSettled(branchPromises);
          for (const r of results) {
            const val = r.status === 'fulfilled' ? r.value : {
              branchId: 'unknown',
              nodeId: 'unknown',
              status: 'failed' as const,
              result: null,
              error: (r as PromiseRejectedResult).reason?.message || 'Unknown error',
              duration: 0,
              timestamp: new Date().toISOString(),
            };
            branchResults.push(val);
          }
          break;
        }

        case 'all':
        default: {
          // 等待所有分支完成
          if (errorHandling === 'fail-fast') {
            // fail-fast: 任一失败则立即抛出
            const results = await Promise.all(branchPromises);
            branchResults.push(...results);

            const failedBranch = branchResults.find((b) => b.status === 'failed');
            if (failedBranch) {
              throw new Error(`并行分支 ${failedBranch.branchId} 执行失败: ${failedBranch.error}`);
            }
          } else {
            // continue/ignore: 收集所有结果，不中断
            const results = await Promise.allSettled(branchPromises);
            for (const r of results) {
              if (r.status === 'fulfilled') {
                branchResults.push(r.value);
              } else {
                branchResults.push({
                  branchId: 'unknown',
                  nodeId: 'unknown',
                  status: 'failed',
                  result: null,
                  error: r.reason?.message || 'Unknown error',
                  duration: 0,
                  timestamp: new Date().toISOString(),
                });
              }
            }
          }
          break;
        }
      }
    } catch (error) {
      if (errorHandling === 'fail-fast') {
        throw error;
      }
      this.logger.warn(`并行执行部分失败: ${error instanceof Error ? error.message : error}`);
    }

    // 调用 ParallelNodeExecutor 合并结果
    const mergedNodeResult = this.parallelNodeExecutor.mergeResults(
      currentNode,
      context,
      branchResults,
    );

    // 更新节点结果
    context.setNodeResult(currentNode.id, mergedNodeResult);

    return mergedNodeResult;
  }
}
