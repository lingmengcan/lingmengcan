import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node-executor';
import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult, LoopNodeConfig } from '../workflow.types';

/**
 * 循环节点执行器
 */
@Injectable()
export class LoopNodeExecutor extends BaseNodeExecutor {
  /**
   * 执行循环节点
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    const config = this.getNodeConfig<LoopNodeConfig>(node);
    const { maxIterations = 10, condition, loopType, variableName } = config;

    this.logNodeConfig(node, context, `类型=${loopType || 'count'}, 最大迭代=${maxIterations}`);

    return this.safeExecute(node, context, async () => {
      const currentIteration = context.getVariable(`${node.id}_iteration`) || 0;
      const newIteration = currentIteration + 1;

      let shouldContinue = false;
      if (loopType === 'count') {
        shouldContinue = newIteration < maxIterations;
      } else if (loopType === 'condition') {
        shouldContinue = this.evaluateCondition(condition, context);
      } else {
        // 默认按次数循环
        shouldContinue = newIteration < maxIterations;
      }

      context.setVariable(`${node.id}_iteration`, newIteration);

      context.logExecution(
        node.id,
        node.type,
        `循环状态: 当前迭代=${newIteration}, 是否继续=${shouldContinue}`,
        undefined,
        undefined,
        { iteration: newIteration, shouldContinue }
      );

      return this.createResult('loop', {
        loopType: loopType || 'count',
        maxIterations,
        condition,
        variableName,
        iteration: newIteration,
        shouldContinue,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * 评估循环条件
   */
  private evaluateCondition(condition: string, context: WorkflowContext): boolean {
    if (!condition) return false;
    
    try {
      // 替换变量
      let expression = condition;
      const variables = context.getVariables();
      Object.keys(variables).forEach((key) => {
        expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), JSON.stringify(variables[key]));
      });

      // 简单的表达式求值（仅用于演示，生产环境应使用更安全的解析器）
      return eval(expression);
    } catch (error) {
      return false;
    }
  }
}