import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node-executor';
import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult, ConditionConfig, ConditionNodeConfig } from '../workflow.types';

/**
 * 条件节点执行器
 */
@Injectable()
export class ConditionNodeExecutor extends BaseNodeExecutor {
  /**
   * 执行条件节点
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    const config = this.getNodeConfig<ConditionNodeConfig>(node);
    const conditions = config.conditions || [];
    const advancedOptions = config.advancedOptions || {};

    this.logNodeConfig(node, context, `${conditions.length} 个条件`);

    return this.safeExecute(node, context, async () => {
      let conditionResult = false;
      const conditionResults = [];

      for (const condition of conditions) {
        const { variable, operator, value, logicalOperator } = condition;
        let variableValue = context.getVariableValue(variable);

        // 应用高级选项
        if (advancedOptions.trimWhitespace && typeof variableValue === 'string') {
          variableValue = variableValue.trim();
        }

        const result = this.evaluateCondition(
          variableValue,
          operator,
          value,
          advancedOptions.caseSensitive
        );

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

      if (advancedOptions.enableLogging) {
        context.logExecution(
          node.id,
          node.type,
          `条件评估结果: ${conditionResult}`,
          undefined,
          undefined,
          { conditionResults }
        );
      }

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
  private evaluateCondition(variableValue: any, operator: string, value: any, caseSensitive = false): boolean {
    switch (operator) {
      case '==': {
        if (!caseSensitive && typeof variableValue === 'string' && typeof value === 'string') {
          return variableValue.toLowerCase() === value.toLowerCase();
        }
        return variableValue == value;
      }
      case '!=': {
        if (!caseSensitive && typeof variableValue === 'string' && typeof value === 'string') {
          return variableValue.toLowerCase() !== value.toLowerCase();
        }
        return variableValue != value;
      }
      case '>':
        return variableValue > value;
      case '<':
        return variableValue < value;
      case '>=':
        return variableValue >= value;
      case '<=':
        return variableValue <= value;
      case 'contains': {
        const varStr = String(variableValue);
        const valStr = String(value);
        if (!caseSensitive) {
          return varStr.toLowerCase().includes(valStr.toLowerCase());
        }
        return varStr.includes(valStr);
      }
      case 'startsWith': {
        const varStr = String(variableValue);
        const valStr = String(value);
        if (!caseSensitive) {
          return varStr.toLowerCase().startsWith(valStr.toLowerCase());
        }
        return varStr.startsWith(valStr);
      }
      case 'endsWith': {
        const varStr = String(variableValue);
        const valStr = String(value);
        if (!caseSensitive) {
          return varStr.toLowerCase().endsWith(valStr.toLowerCase());
        }
        return varStr.endsWith(valStr);
      }
      case 'isEmpty':
        return !variableValue || String(variableValue).trim() === '';
      case 'isNotEmpty':
        return variableValue && String(variableValue).trim() !== '';
      case 'isTrue':
        return variableValue === true || variableValue === 'true' || variableValue === 1;
      case 'isFalse':
        return variableValue === false || variableValue === 'false' || variableValue === 0;
      case 'matches':
        try {
          const flags = caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(value, flags);
          return regex.test(String(variableValue));
        } catch (e) {
          return false;
        }
      default:
        return false;
    }
  }
}