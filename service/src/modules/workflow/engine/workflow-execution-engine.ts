import { Injectable } from '@nestjs/common';
import { WorkflowNodeExecutor } from './workflow-node-executor';
import { WorkflowContext } from './workflow-context';
import { WorkflowNode, WorkflowEdge } from './workflow.types';
import { LlmService } from '@/modules/model/llm.service';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { initChatModel } from 'langchain';

/**
 * 工作流执行引擎
 * 负责工作流的整体执行逻辑和流程控制
 */
@Injectable()
export class WorkflowExecutionEngine {
  constructor(
    private readonly nodeExecutor: WorkflowNodeExecutor,
    private readonly llmService: LlmService,
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
   */
  async *executeStream(workflow: any, inputs: any): AsyncGenerator<string> {
    const { nodes } = workflow.config || {};
    if (!nodes || nodes.length === 0) {
      throw new Error('工作流配置无效：没有节点');
    }

    // 找到开始节点，处理输入
    const startNode = nodes.find((n: any) => n.type === 'start');
    let processedInputs = inputs;
    
    if (startNode) {
      const startConfig = startNode.data?.config || {};
      // 兼容新旧两种配置方式
      if (startConfig.inputs && Array.isArray(startConfig.inputs) && startConfig.inputs.length > 0) {
        // 新方式: 使用 inputs 数组
        processedInputs = {};
        for (const inputDef of startConfig.inputs) {
          const name = inputDef.name || 'input';
          let value = inputs?.[name];
          // 如果只有一个输入定义且inputs是简单值
          if (value === undefined && startConfig.inputs.length === 1 && typeof inputs !== 'object') {
            value = inputs;
          }
          if (value !== undefined) {
            processedInputs[name] = value;
          }
        }
      } else if (startConfig.variableName) {
        // 旧方式: 使用 variableName
        const variableName = startConfig.variableName || 'input';
        if (typeof inputs !== 'object') {
          processedInputs = { [variableName]: inputs };
        }
      }
    }

    const llmNode = nodes.find((n: any) => n.type === 'llm');
    if (!llmNode) {
      throw new Error('当前仅支持对包含 LLM 节点的工作流进行流式执行');
    }

    const config = llmNode.data?.config || {};
    const { model, temperature, maxTokens, topP, systemPrompt, userPrompt, variableName } = config;

    // 构建用户输入 - 兼容新旧两种方式
    let inputData: any;
    
    // 新方式：从 inputs 数组获取
    if (config.inputs && Array.isArray(config.inputs) && config.inputs.length > 0) {
      const firstInput = config.inputs[0];
      if (firstInput.source) {
        // 如果有source，从处理后的inputs中获取
        const [, varName] = firstInput.source.split('.');
        inputData = processedInputs?.[varName] ?? processedInputs;
      } else {
        inputData = processedInputs?.[firstInput.name] ?? processedInputs;
      }
    } else {
      // 旧方式：使用 variableName
      inputData = processedInputs?.[variableName || 'input'] ?? processedInputs;
    }
    
    const userContent = userPrompt
      ? this.replaceVariables(userPrompt, { inputs: processedInputs, variables: {}, nodeResults: new Map() })
      : String(inputData ?? '');

    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userContent });

    const requestData = {
      model: model || 'lingmengcan',
      messages,
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 4096,
      top_p: topP ?? 1,
    };

    yield* this.callLLMAPIStream(requestData);
  }

  /**
   * 调用LLM API（流式）
   */
  private async *callLLMAPIStream(requestData: any): AsyncGenerator<string> {
    const { model: modelName, messages, temperature, max_tokens, top_p } = requestData || {};

    const model = await this.llmService.findByModelName(modelName);
    if (!model) {
      throw new Error(`模型未找到: ${modelName}`);
    }

    // 创建模型实例
    const llm = await initChatModel(model.modelName, {
      modelProvider: model.apiType,
      temperature,
      topP: top_p,
      maxTokens: max_tokens,
      streaming: true,
      apiKey: model.apiKey,
      configuration: {
        baseURL: model.baseUrl,
      },
    });

    const promptMessages = (messages as Array<{ role: string; content: string }>).map((m) => {
      if (m.role === 'system') return SystemMessagePromptTemplate.fromTemplate(m.content);
      if (m.role === 'user') return HumanMessagePromptTemplate.fromTemplate(m.content);
      return HumanMessagePromptTemplate.fromTemplate(m.content);
    });

    const prompt = ChatPromptTemplate.fromMessages(promptMessages);
    const chain = prompt.pipe(llm);

    let reasoning_content = '';
    let full_content = '';
    let sentCleanLength = 0;
    let thinkTagComplete = false;

    for await (const chunk of await chain.stream({})) {
      const content =
        chunk && typeof chunk === 'object' && 'content' in (chunk as any) ? (chunk as any).content || '' : '';
      full_content += content;

      const thinkMatch = full_content.match(/<think>([\s\S]*?)<\/think>/);
      if (thinkMatch && !thinkTagComplete) {
        reasoning_content = thinkMatch[1].trim();
        thinkTagComplete = true;
        full_content = full_content.replace(/<think>[\s\S]*?<\/think>/g, '');
        sentCleanLength = 0;
      }

      if (!thinkTagComplete && full_content.includes('<think>')) {
        continue;
      }

      const newClean = full_content.substring(sentCleanLength);
      sentCleanLength = full_content.length;
      if (newClean) {
        yield JSON.stringify({ content: newClean, reasoning_content }) + '\n';
      }
    }

    const finalThinkMatch = full_content.match(/<think>([\s\S]*?)<\/think>/);
    if (finalThinkMatch) {
      reasoning_content = finalThinkMatch[1].trim();
    }

    yield JSON.stringify({ content: '', reasoning_content }) + '\n';
  }

  /**
   * 替换提示词中的变量引用
   */
  private replaceVariables(template: string, context: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, variablePath) => {
      const trimmedPath = variablePath.trim();
      const value = this.getVariableValue(trimmedPath, context);
      return value !== null && value !== undefined ? String(value) : match;
    });
  }

  /**
   * 获取变量值
   */
  private getVariableValue(variable: string, context: any): any {
    if (context.inputs && context.inputs[variable] !== undefined) {
      return context.inputs[variable];
    }
    if (context.variables && context.variables[variable] !== undefined) {
      return context.variables[variable];
    }
    if (context.nodeResults && context.nodeResults.has(variable)) {
      return context.nodeResults.get(variable);
    }
    return undefined;
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
        return await this.handleParallelNode(nextNodeIds, context, nodeMap, edgeMap);
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
   */
  private async handleParallelNode(
    nextNodeIds: string[],
    context: WorkflowContext,
    nodeMap: Map<string, WorkflowNode>,
    edgeMap: Map<string, string[]>,
  ): Promise<any> {
    // 并行执行所有后续节点
    const parallelResults = await Promise.all(
      nextNodeIds.map(async (nextNodeId) => {
        const nextNode = nodeMap.get(nextNodeId);
        return nextNode ? await this.executeNode(nextNode, context, nodeMap, edgeMap) : null;
      }),
    );
    return parallelResults.filter((r) => r !== null);
  }
}
