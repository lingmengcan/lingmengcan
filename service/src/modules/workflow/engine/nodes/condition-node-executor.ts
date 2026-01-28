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
    const inputs = config.inputs || [];

    // 解析输入变量
    const resolvedInputs = this.resolveInputs(node, context);

    this.logNodeConfig(node, context, `${conditions.length} 个条件`);

    return this.safeExecute(node, context, async () => {
      let conditionResult = conditions.length === 0 ? false : true;
      const conditionResults: any[] = [];

      for (let i = 0; i < conditions.length; i++) {
        const condition = conditions[i];
        const { variable, operator, value, logicalOperator } = condition;
        
        // 解析变量值 - 支持 {{变量名}} 格式
        let variableValue: any;
        if (variable) {
          const varName = variable.replace(/\{\{|\}\}/g, '').trim();
          // 首先从解析的inputs中查找
          if (resolvedInputs[varName] !== undefined) {
            variableValue = resolvedInputs[varName];
          } else {
            variableValue = context.getVariableValue(varName);
          }
        }

        // 应用高级选项
        if (advancedOptions.trimWhitespace && typeof variableValue === 'string') {
          variableValue = variableValue.trim();
        }

        // 解析比较值中的变量引用
        let resolvedValue = value;
        if (typeof value === 'string' && value.includes('{{')) {
          resolvedValue = context.replaceVariables(value);
        }

        const result = this.evaluateCondition(
          variableValue,
          operator,
          resolvedValue,
          advancedOptions.caseSensitive
        );

        conditionResults.push({
          variable,
          operator,
          value: resolvedValue,
          variableValue,
          result,
          logicalOperator,
        });

        // 根据逻辑操作符组合结果
        if (i === 0) {
          conditionResult = result;
        } else if (logicalOperator === 'AND') {
          conditionResult = conditionResult && result;
        } else if (logicalOperator === 'OR') {
          conditionResult = conditionResult || result;
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

      // 构建输出
      const outputValues: Record<string, any> = {
        result: conditionResult,
        branch: conditionResult ? 'true' : 'false'
      };

      return this.createResult('condition', {
        conditions,
        conditionResults,
        conditionResult,
        timestamp: new Date().toISOString(),
      }, outputValues);
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
        return Number(variableValue) > Number(value);
      case '<':
        return Number(variableValue) < Number(value);
      case '>=':
        return Number(variableValue) >= Number(value);
      case '<=':
        return Number(variableValue) <= Number(value);
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