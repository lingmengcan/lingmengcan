import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node-executor';
import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult, TransformNodeConfig } from '../workflow.types';

/**
 * 转换节点执行器
 */
@Injectable()
export class TransformNodeExecutor extends BaseNodeExecutor {
  /**
   * 执行转换节点
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    const config = this.getNodeConfig<TransformNodeConfig>(node);
    const { transformation, transformationType = 'json' } = config;

    this.logNodeConfig(node, context, `类型=${transformationType}`);

    return this.safeExecute(node, context, async () => {
      let result = context.getInputs();

      if (transformation) {
        try {
          // 执行数据转换逻辑
          result = this.applyTransformation(transformation, context);

          context.logExecution(
            node.id,
            node.type,
            `数据转换完成`,
            undefined,
            undefined,
            { input: context.getInputs(), output: result }
          );
        } catch (error) {
          context.logExecution(
            node.id,
            node.type,
            `数据转换失败: ${error.message}`,
            undefined,
            error.message
          );
          throw new Error(`数据转换失败: ${error.message}`);
        }
      }

      return this.createResult('transform', {
        transformationType,
        input: context.getInputs(),
        output: result,
        transformation,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * 应用数据转换
   */
  private applyTransformation(transformation: string, context: WorkflowContext): any {
    try {
      const func = new Function('data', 'context', transformation);
      return func(context.getInputs(), context);
    } catch (error) {
      throw new Error(`转换函数执行失败: ${error.message}`);
    }
  }
}