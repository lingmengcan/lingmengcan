import { Injectable } from '@nestjs/common';
import { WorkflowContext } from './workflow-context';
import { LlmService } from '@/modules/model/llm.service';
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
    const config = node.data?.config || {};
    
    // 兼容新旧两种配置方式
    // 新方式: config.inputs 数组
    // 旧方式: config.variableName + config.inputType
    
    let processedInput: Record<string, any> = {};
    const outputs: Record<string, any> = {};
    
    if (config.inputs && Array.isArray(config.inputs) && config.inputs.length > 0) {
      // 新方式: 使用 inputs 数组定义
      for (const inputDef of config.inputs) {
        const name = inputDef.name || 'input';
        const type = inputDef.type || 'text';
        
        // 从 inputs 中获取对应的值
        let value = inputs?.[name];
        
        // 如果 inputs 是简单值且只有一个输入定义，直接使用
        if (value === undefined && config.inputs.length === 1 && typeof inputs !== 'object') {
          value = inputs;
        }
        
        // 类型转换
        if (value !== undefined) {
          switch (type) {
            case 'number':
              processedInput[name] = Number(value);
              break;
            case 'boolean':
              processedInput[name] = Boolean(value);
              break;
            case 'json':
            case 'object':
            case 'array':
              processedInput[name] = typeof value === 'string' ? JSON.parse(value) : value;
              break;
            default:
              processedInput[name] = value;
          }
          // 设置到outputs供下游节点引用
          outputs[name] = processedInput[name];
        }
      }
    } else {
      // 旧方式: 使用 variableName + inputType
      const variableName = config.variableName || 'input';
      const inputType = config.inputType || 'text';

      if (typeof inputs === 'object' && inputs !== null) {
        processedInput = inputs;
      } else if (inputType === 'text' && typeof inputs === 'string') {
        processedInput = { [variableName]: inputs };
      } else if (inputType === 'number' && typeof inputs === 'number') {
        processedInput = { [variableName]: inputs };
      } else if (inputType === 'boolean' && typeof inputs === 'boolean') {
        processedInput = { [variableName]: inputs };
      } else {
        processedInput = { [variableName]: inputs };
      }
      
      // 设置outputs
      outputs[variableName] = processedInput[variableName];
    }
    
    // 将开始节点的输出注册到context中
    Object.entries(outputs).forEach(([key, value]) => {
      context.setNodeOutput(node.id, key, value);
    });

    return {
      type: 'start',
      data: processedInput,
      outputs,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 执行结束节点
   */
  private executeEndNode(node: WorkflowNode, context: WorkflowContext): NodeExecutionResult {
    const config = node.data?.config || {};
    const nodeResults = context.getNodeResults();
    
    // 获取最后一个非结束节点的结果
    let lastResult: any = context.getInputs();
    
    for (const [, result] of nodeResults) {
      if (result.type !== 'end') {
        lastResult = result;
      }
    }

    // 构建最终输出
    let finalOutput: any = lastResult;
    
    // 如果配置了 outputs，按照配置收集输出
    // 结束节点的outputs使用source字段指定数据来源
    if (config.outputs && Array.isArray(config.outputs) && config.outputs.length > 0) {
      const collectedOutputs: Record<string, any> = {};
      
      for (const outputDef of config.outputs as Array<{ name: string; source?: string }>) {
        const name = outputDef.name;
        const source = outputDef.source;
        
        if (source) {
          // 从指定来源获取值
          const value = context.getVariableValue(source);
          if (value !== undefined) {
            collectedOutputs[name] = value;
          }
        }
      }
      
      if (Object.keys(collectedOutputs).length > 0) {
        finalOutput = collectedOutputs;
      }
    } else {
      // 默认行为：提取最后节点的输出
      if (lastResult && lastResult.type === 'llm' && lastResult.data) {
        const llmData = lastResult.data;
        finalOutput = {
          output: llmData.output || '',
          reasoning_content: llmData.reasoning_content || '',
        };
      } else if (lastResult && lastResult.data) {
        finalOutput = lastResult.data;
      }
    }

    return {
      type: 'end',
      data: finalOutput,
      timestamp: new Date().toISOString(),
    };
  }
}