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
    const { 
      strategy = 'all',
      timeout = 60,
      errorHandling = 'fail-fast',
      mergeStrategy = 'collect',
      inputs,
      outputs
    } = config;

    // 解析输入变量
    const resolvedInputs = this.resolveInputs(node, context);

    this.logNodeConfig(node, context, `策略=${strategy}, 超时=${timeout}s`);

    return this.safeExecute(node, context, async () => {
      // TODO: 实际的并行执行逻辑应该在工作流引擎层面处理
      // 这里模拟并行执行结果
      const branchResults: any[] = [];
      
      // 模拟并行执行
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 模拟多个分支的结果
      const mockBranchCount = 3;
      for (let i = 0; i < mockBranchCount; i++) {
        branchResults.push({
          branchId: `branch_${i + 1}`,
          status: 'completed',
          result: `并行分支 ${i + 1} 执行结果`,
          timestamp: new Date().toISOString(),
        });
      }

      // 根据合并策略处理结果
      let mergedResult: any;
      switch (mergeStrategy) {
        case 'collect':
          mergedResult = branchResults.map(b => b.result);
          break;
        case 'merge':
          mergedResult = branchResults.reduce((acc, b) => {
            if (typeof b.result === 'object') {
              return { ...acc, ...b.result };
            }
            return acc;
          }, {});
          break;
        case 'first':
          mergedResult = branchResults[0]?.result;
          break;
        case 'last':
          mergedResult = branchResults[branchResults.length - 1]?.result;
          break;
        default:
          mergedResult = branchResults;
      }

      context.logExecution(
        node.id,
        node.type,
        `并行执行完成: ${branchResults.length} 个分支`,
        undefined,
        undefined,
        { branchResults, mergedResult }
      );

      // 构建输出
      const outputValues: Record<string, any> = {
        output: mergedResult
      };

      const nodeOutputs = this.buildOutputs(outputs, outputValues);

      return this.createResult('parallel', {
        strategy,
        timeout,
        errorHandling,
        mergeStrategy,
        branchResults,
        mergedResult,
        timestamp: new Date().toISOString(),
      }, nodeOutputs);
    });
  }
}