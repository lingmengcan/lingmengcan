import { Injectable } from '@nestjs/common';
import { WorkflowContext } from './workflow-context';
import { LlmService } from '@/services/llm.service';
import { 
  WorkflowNode, 
  NodeExecutionResult, 
  LLMRequest, 
  LLMResponse,
  ConditionConfig,
  LLMNodeConfig,
  HttpNodeConfig,
  LoopNodeConfig,
  ParallelNodeConfig,
  TransformNodeConfig,
  DatabaseNodeConfig
} from './workflow.types';
import { LLMNodeExecutor } from './nodes/llm-node-executor';
import { ConditionNodeExecutor } from './nodes/condition-node-executor';
import { HttpNodeExecutor } from './nodes/http-node-executor';
import { LoopNodeExecutor } from './nodes/loop-node-executor';
import { ParallelNodeExecutor } from './nodes/parallel-node-executor';
import { TransformNodeExecutor } from './nodes/transform-node-executor';
import { DatabaseNodeExecutor } from './nodes/database-node-executor';

/**
 * 工作流节点执行器
 * 负责分发和执行不同类型的节点
 */
@Injectable()
export class WorkflowNodeExecutor {
  constructor(
    private readonly llmService: LlmService,
    private readonly llmNodeExecutor: LLMNodeExecutor,
    private readonly conditionNodeExecutor: ConditionNodeExecutor,
    private readonly httpNodeExecutor: HttpNodeExecutor,
    private readonly loopNodeExecutor: LoopNodeExecutor,
    private readonly parallelNodeExecutor: ParallelNodeExecutor,
    private readonly transformNodeExecutor: TransformNodeExecutor,
    private readonly databaseNodeExecutor: DatabaseNodeExecutor,
  ) {}

  /**
   * 执行节点
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    switch (node.type) {
      case 'start':
        return this.executeStartNode(node, context);
      case 'end':
        return this.executeEndNode(node, context);
      case 'llm':
        return this.llmNodeExecutor.execute(node, context);
      case 'condition':
        return this.conditionNodeExecutor.execute(node, context);
      case 'http':
        return this.httpNodeExecutor.execute(node, context);
      case 'loop':
        return this.loopNodeExecutor.execute(node, context);
      case 'parallel':
        return this.parallelNodeExecutor.execute(node, context);
      case 'transform':
        return this.transformNodeExecutor.execute(node, context);
      case 'database':
        return this.databaseNodeExecutor.execute(node, context);
      default:
        throw new Error(`不支持的节点类型: ${node.type}`);
    }
  }

  /**
   * 流式执行LLM节点
   */
  async *executeStreamLLM(node: WorkflowNode, context: WorkflowContext): AsyncGenerator<string> {
    if (node.type !== 'llm') {
      throw new Error('只有LLM节点支持流式执行');
    }

    for await (const chunk of this.llmNodeExecutor.executeStream(node, context)) {
      yield chunk;
    }
  }

  /**
   * 执行开始节点
   */
  private executeStartNode(node: WorkflowNode, context: WorkflowContext): NodeExecutionResult {
    const inputs = context.getInputs();
    const variableName = node.data?.config?.variableName || 'input';
    const inputType = node.data?.config?.inputType || 'text';

    let processedInput = inputs;

    if (inputType === 'text' && typeof inputs === 'string') {
      processedInput = { [variableName]: inputs };
    } else if (inputType === 'number' && typeof inputs === 'number') {
      processedInput = { [variableName]: inputs };
    } else if (inputType === 'boolean' && typeof inputs === 'boolean') {
      processedInput = { [variableName]: inputs };
    }

    return {
      type: 'start',
      data: processedInput,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 执行结束节点
   */
  private executeEndNode(node: WorkflowNode, context: WorkflowContext): NodeExecutionResult {
    // 获取最后一个非结束节点的结果
    let lastResult = context.getInputs();
    const nodeResults = context.getNodeResults();
    
    for (const [nodeId, result] of nodeResults) {
      if (result.type !== 'end') {
        lastResult = result;
      }
    }

    // 如果最后一个结果是LLM节点，提取其输出
    let finalOutput = lastResult;
    if (lastResult && lastResult.type === 'llm' && lastResult.data) {
      const llmData = lastResult.data;
      finalOutput = {
        output: llmData.output || '',
        reasoning_content: llmData.reasoning_content || '',
      };
    }

    return {
      type: 'end',
      data: finalOutput,
      timestamp: new Date().toISOString(),
    };
  }
}