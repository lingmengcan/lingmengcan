import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult } from '../workflow.types';

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
  protected createResult(type: string, data: any): NodeExecutionResult {
    return {
      type,
      data,
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
      return result;
    } catch (error) {
      this.logNodeError(node, context, error);
      throw error;
    }
  }
}