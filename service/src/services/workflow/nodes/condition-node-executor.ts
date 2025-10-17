import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node-executor';
import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult, ConditionConfig } from '../workflow.types';

/**
 * 条件节点执行器
 */
@Injectable()
export class ConditionNodeExecutor extends BaseNodeExecutor {
  /**
   * 执行条件节点
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    const config = this.getNodeConfig(node);
    const conditions = config.conditions || [];

    this.logNodeConfig(node, context, `${conditions.length} 个条件`);

    return this.safeExecute(node, context, async () => {
      let conditionResult = false;
      const conditionResults = [];

      for (const condition of conditions) {
        const { variable, operator, value, logicalOperator } = condition;
        const variableValue = context.getVariableValue(variable);

        const result = this.evaluateCondition(variableValue, operator, value);

        conditionResults.push({
          variable,
          operator,
          value,
          variableValue,
          result,
          logicalOperator,
        });

        if (logicalOperator === 'AND') {
          conditionResult = conditionResult && result;
        } else if (logicalOperator === 'OR') {
          conditionResult = conditionResult || result;
        } else {
          conditionResult = result;
        }
      }

      context.logExecution(
        node.id,
        node.type,
        `条件评估结果: ${conditionResult}`,
        undefined,
        undefined,
        { conditionResults }
      );

      return this.createResult('condition', {
        conditions,
        conditionResults,
        conditionResult,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * 评估单个条件
   */
  private evaluateCondition(variableValue: any, operator: string, value: any): boolean {
    switch (operator) {
      case '==':
        return variableValue == value;
      case '!=':
        return variableValue != value;
      case '>':
        return variableValue > value;
      case '<':
        return variableValue < value;
      case '>=':
        return variableValue >= value;
      case '<=':
        return variableValue <= value;
      case 'contains':
        return String(variableValue).includes(String(value));
      case 'startsWith':
        return String(variableValue).startsWith(String(value));
      case 'endsWith':
        return String(variableValue).endsWith(String(value));
      default:
        return false;
    }
  }
}