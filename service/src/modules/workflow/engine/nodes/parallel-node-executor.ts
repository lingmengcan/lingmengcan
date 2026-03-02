import { Injectable, Logger } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node-executor';
import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult, ParallelNodeConfig } from '../workflow.types';

/**
 * 并行分支执行结果
 */
interface BranchResult {
  branchId: string;
  nodeId: string;
  status: 'completed' | 'failed' | 'timeout';
  result: any;
  error?: string;
  duration: number;
  timestamp: string;
}

/**
 * 并行节点执行器
 *
 * 该执行器负责解析并行配置并返回配置信息。
 * 实际的分支并行调度由 WorkflowExecutionEngine.handleParallelNode() 完成。
 * 引擎在所有分支完成后，调用 mergeResults() 合并结果。
 */
@Injectable()
export class ParallelNodeExecutor extends BaseNodeExecutor {
  private readonly logger = new Logger(ParallelNodeExecutor.name);

  /**
   * 执行并行节点 — 返回并行配置，实际分支由引擎调度
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    const config = this.getNodeConfig<ParallelNodeConfig>(node);
    const {
      strategy = 'all',
      timeout = 60,
      errorHandling = 'fail-fast',
      mergeStrategy = 'collect',
    } = config;

    // 解析输入变量
    this.resolveInputs(node, context);

    this.logNodeConfig(node, context, `策略=${strategy}, 超时=${timeout}s, 错误处理=${errorHandling}`);

    // 返回并行配置，由引擎层读取后进行分支调度
    return this.createResult('parallel', {
      strategy,
      timeout,
      errorHandling,
      mergeStrategy,
      // 标记为待引擎调度
      pendingExecution: true,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 合并并行分支的执行结果
   * 由引擎层在所有分支执行完成后调用
   */
  mergeResults(
    node: WorkflowNode,
    context: WorkflowContext,
    branchResults: BranchResult[],
  ): NodeExecutionResult {
    const config = this.getNodeConfig<ParallelNodeConfig>(node);
    const {
      strategy = 'all',
      timeout = 60,
      errorHandling = 'fail-fast',
      mergeStrategy = 'collect',
      outputs,
    } = config;

    const completedBranches = branchResults.filter((b) => b.status === 'completed');
    const failedBranches = branchResults.filter((b) => b.status === 'failed');
    const timedOutBranches = branchResults.filter((b) => b.status === 'timeout');

    this.logger.log(
      `并行合并: ${completedBranches.length} 成功, ${failedBranches.length} 失败, ${timedOutBranches.length} 超时`,
    );

    // 根据合并策略处理结果
    let mergedResult: any;
    const successResults = completedBranches.map((b) => b.result);

    switch (mergeStrategy) {
      case 'collect':
        mergedResult = successResults;
        break;
      case 'merge':
        mergedResult = successResults.reduce((acc, r) => {
          if (r && typeof r === 'object' && !Array.isArray(r)) {
            // 提取节点执行结果中的 data
            const data = r.data ?? r;
            return { ...acc, ...data };
          }
          return acc;
        }, {});
        break;
      case 'first':
        mergedResult = successResults[0] ?? null;
        break;
      case 'last':
        mergedResult = successResults[successResults.length - 1] ?? null;
        break;
      default:
        mergedResult = successResults;
    }

    context.logExecution(
      node.id,
      node.type,
      `并行执行完成: ${branchResults.length} 个分支 (${completedBranches.length} 成功, ${failedBranches.length} 失败)`,
      undefined,
      failedBranches.length > 0 ? failedBranches.map((b) => b.error).join('; ') : undefined,
      { branchResults, mergedResult },
    );

    // 构建输出
    const outputValues: Record<string, any> = {
      output: mergedResult,
      results: successResults,
      branches: branchResults,
      failedCount: failedBranches.length,
      successCount: completedBranches.length,
    };

    const nodeOutputs = this.buildOutputs(outputs, outputValues);

    // 自动注册 outputs 到 context
    if (nodeOutputs) {
      Object.entries(nodeOutputs).forEach(([key, value]) => {
        context.setNodeOutput(node.id, key, value);
      });
    }

    return this.createResult('parallel', {
      strategy,
      timeout,
      errorHandling,
      mergeStrategy,
      branchResults,
      mergedResult,
      totalBranches: branchResults.length,
      successCount: completedBranches.length,
      failedCount: failedBranches.length,
      timedOutCount: timedOutBranches.length,
      timestamp: new Date().toISOString(),
    }, nodeOutputs);
  }
}