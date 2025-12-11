import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node-executor';
import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult, ParallelNodeConfig } from '../workflow.types';

/**
 * 并行节点执行器
 */
@Injectable()
export class ParallelNodeExecutor extends BaseNodeExecutor {
  /**
   * 执行并行节点
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    const config = this.getNodeConfig<ParallelNodeConfig>(node);
    const { parallelCount = 2, parallelType = 'fixed' } = config;

    this.logNodeConfig(node, context, `类型=${parallelType}, 并行数=${parallelCount}`);

    return this.safeExecute(node, context, async () => {
      // 模拟并行执行
      await new Promise((resolve) => setTimeout(resolve, 300));

      const results = Array(parallelCount)
        .fill(null)
        .map((_, index) => ({
          id: `parallel_${index + 1}`,
          status: 'completed',
          result: `并行任务 ${index + 1} 完成`,
          timestamp: new Date().toISOString(),
        }));

      context.logExecution(
        node.id,
        node.type,
        `并行执行完成: ${results.length} 个任务`,
        undefined,
        undefined,
        { results }
      );

      return this.createResult('parallel', {
        parallelType,
        parallelCount,
        results,
        timestamp: new Date().toISOString(),
      });
    });
  }
}