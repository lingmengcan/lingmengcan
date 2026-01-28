import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult, NodeInputVariable, NodeOutputVariable } from '../workflow.types';

/**
 * 节点执行器基类
 * 提供通用的节点执行逻辑和工具方法
 */
export abstract class BaseNodeExecutor {
  /**
   * 执行节点的抽象方法
   */
  abstract execute(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult>;

  /**
   * 记录节点配置信息
   */
  protected logNodeConfig(node: WorkflowNode, context: WorkflowContext, configDescription: string): void {
    context.logExecution(
      node.id,
      node.type,
      `${node.type}节点配置: ${configDescription}`,
      undefined,
      undefined,
      { config: node.data?.config }
    );
  }

  /**
   * 记录节点执行结果
   */
  protected logNodeResult(
    node: WorkflowNode, 
    context: WorkflowContext, 
    message: string, 
    result?: any
  ): void {
    context.logExecution(
      node.id,
      node.type,
      message,
      result
    );
  }

  /**
   * 记录节点执行错误
   */
  protected logNodeError(
    node: WorkflowNode, 
    context: WorkflowContext, 
    error: Error
  ): void {
    context.logExecution(
      node.id,
      node.type,
      `${node.type}节点执行失败: ${error.message}`,
      undefined,
      error.message
    );
  }

  /**
   * 获取节点配置
   */
  protected getNodeConfig<T = any>(node: WorkflowNode): T {
    return (node.data?.config || {}) as T;
  }

  /**
   * 创建节点执行结果
   */
  protected createResult(type: string, data: any, outputs?: Record<string, any>): NodeExecutionResult {
    return {
      type,
      data,
      outputs,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 安全执行节点逻辑
   */
  protected async safeExecute(
    node: WorkflowNode,
    context: WorkflowContext,
    executeLogic: () => Promise<NodeExecutionResult>
  ): Promise<NodeExecutionResult> {
    try {
      const result = await executeLogic();
      this.logNodeResult(node, context, `${node.type}节点执行成功`, result);
      
      // 自动将outputs注册到context中
      if (result.outputs) {
        Object.entries(result.outputs).forEach(([key, value]) => {
          context.setNodeOutput(node.id, key, value);
        });
      }
      
      return result;
    } catch (error) {
      this.logNodeError(node, context, error);
      throw error;
    }
  }

  /**
   * 解析节点输入变量 - 从上游节点获取数据
   */
  protected resolveInputs(node: WorkflowNode, context: WorkflowContext): Record<string, any> {
    const config = this.getNodeConfig(node);
    const inputs = config.inputs as NodeInputVariable[] || [];
    const resolved: Record<string, any> = {};

    for (const input of inputs) {
      if (input.source) {
        // 格式: "nodeId.variableName"
        const [sourceNodeId, sourceVarName] = input.source.split('.');
        resolved[input.name] = context.getNodeOutput(sourceNodeId, sourceVarName);
      } else {
        // 尝试从全局inputs获取
        resolved[input.name] = context.getVariableValue(input.name);
      }
    }

    return resolved;
  }

  /**
   * 构建输出变量映射
   */
  protected buildOutputs(
    outputDefs: NodeOutputVariable[] | undefined,
    values: Record<string, any>
  ): Record<string, any> {
    const outputs: Record<string, any> = {};
    
    if (!outputDefs) {
      return values;
    }

    for (const output of outputDefs) {
      if (values[output.name] !== undefined) {
        outputs[output.name] = this.convertType(values[output.name], output.type);
      }
    }

    return outputs;
  }

  /**
   * 类型转换辅助方法
   */
  protected convertType(value: any, type: string): any {
    if (value === null || value === undefined) return value;

    switch (type) {
      case 'text':
        return String(value);
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'json':
      case 'object':
        return typeof value === 'string' ? JSON.parse(value) : value;
      case 'array':
        return Array.isArray(value) ? value : [value];
      default:
        return value;
    }
  }
}