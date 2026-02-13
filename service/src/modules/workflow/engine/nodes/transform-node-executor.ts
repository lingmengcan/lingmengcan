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
    const { 
      transformType = 'mapping',
      rules = [],
      filterCondition,
      inputFormat = 'json',
      outputFormat = 'json',
      customScript,
      errorHandling = 'skip',
      inputs,
      outputs
    } = config;

    // 解析输入变量
    const resolvedInputs = this.resolveInputs(node, context);
    const inputData = resolvedInputs.input || context.getInputs();

    this.logNodeConfig(node, context, `类型=${transformType}`);

    return this.safeExecute(node, context, async () => {
      let result: any = inputData;

      try {
        switch (transformType) {
          case 'mapping':
            result = this.applyMappingRules(inputData, rules, context);
            break;

          case 'filter':
            result = this.applyFilter(inputData, filterCondition, context);
            break;

          case 'format':
            result = this.convertFormat(inputData, inputFormat, outputFormat);
            break;

          case 'script':
            result = this.executeCustomScript(inputData, customScript, context);
            break;

          case 'extract':
            result = this.extractData(inputData, rules);
            break;

          case 'merge':
            result = this.mergeData(resolvedInputs);
            break;

          default:
            result = inputData;
        }

        context.logExecution(
          node.id,
          node.type,
          `数据转换完成: ${transformType}`,
          undefined,
          undefined,
          { input: inputData, output: result }
        );
      } catch (error) {
        if (errorHandling === 'fail') {
          throw error;
        } else if (errorHandling === 'default') {
          result = inputData; // 使用原始数据作为默认值
        }
        // skip: 跳过错误，result保持之前的值

        context.logExecution(
          node.id,
          node.type,
          `数据转换错误(${errorHandling}): ${error.message}`,
          undefined,
          error.message
        );
      }

      // 构建输出
      const outputValues: Record<string, any> = {
        output: result
      };

      const nodeOutputs = this.buildOutputs(outputs, outputValues);

      return this.createResult('transform', {
        transformType,
        input: inputData,
        output: result,
        timestamp: new Date().toISOString(),
      }, nodeOutputs);
    });
  }

  /**
   * 应用字段映射规则
   */
  private applyMappingRules(data: any, rules: any[], context: WorkflowContext): any {
    if (!rules || rules.length === 0) return data;

    const result: Record<string, any> = {};
    
    for (const rule of rules) {
      const { sourceField, targetField, transform, defaultValue } = rule;
      
      let value = this.getNestedValue(data, sourceField);
      
      if (value === undefined && defaultValue !== undefined) {
        value = defaultValue;
      }

      if (value !== undefined) {
        value = this.applyTransformFunction(value, transform);
        this.setNestedValue(result, targetField, value);
      }
    }

    return result;
  }

  /**
   * 应用过滤条件
   */
  private applyFilter(data: any, condition: string, context: WorkflowContext): any {
    if (!condition) return data;

    if (Array.isArray(data)) {
      return data.filter((item, index) => {
        // 设置临时变量用于条件评估
        context.setVariable('$item', item);
        context.setVariable('$index', index);
        const resolvedCondition = context.replaceVariables(condition);
        try {
          // eslint-disable-next-line no-eval
          return eval(resolvedCondition);
        } catch {
          return true;
        }
      });
    }

    return data;
  }

  /**
   * 格式转换
   */
  private convertFormat(data: any, inputFormat: string, outputFormat: string): any {
    // 简化的格式转换逻辑
    if (inputFormat === outputFormat) return data;

    // JSON -> 其他格式
    if (outputFormat === 'text') {
      return JSON.stringify(data, null, 2);
    }

    // 其他格式 -> JSON
    if (inputFormat === 'text' && outputFormat === 'json') {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }

    return data;
  }

  /**
   * 执行自定义脚本
   */
  private executeCustomScript(data: any, script: string, context: WorkflowContext): any {
    if (!script) return data;

    try {
      const func = new Function('input', 'context', script);
      return func(data, context);
    } catch (error) {
      throw new Error(`自定义脚本执行失败: ${error.message}`);
    }
  }

  /**
   * 数据提取
   */
  private extractData(data: any, rules: any[]): any {
    if (!rules || rules.length === 0) return data;

    const result: Record<string, any> = {};
    
    for (const rule of rules) {
      const { sourceField, targetField } = rule;
      const value = this.getNestedValue(data, sourceField);
      if (value !== undefined) {
        result[targetField || sourceField] = value;
      }
    }

    return result;
  }

  /**
   * 数据合并
   */
  private mergeData(inputs: Record<string, any>): any {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(inputs)) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * 获取嵌套属性值
   */
  private getNestedValue(obj: any, path: string): any {
    if (!path) return obj;
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  /**
   * 设置嵌套属性值
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    const last = parts.pop()!;
    const target = parts.reduce((o, p) => {
      if (!o[p]) o[p] = {};
      return o[p];
    }, obj);
    target[last] = value;
  }

  /**
   * 应用转换函数
   */
  private applyTransformFunction(value: any, transform: string): any {
    switch (transform) {
      case 'copy':
        return value;
      case 'toString':
        return String(value);
      case 'toNumber':
        return Number(value);
      case 'toBoolean':
        return Boolean(value);
      case 'toArray':
        return Array.isArray(value) ? value : [value];
      case 'toJSON':
        return typeof value === 'string' ? JSON.parse(value) : value;
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      case 'trim':
        return String(value).trim();
      case 'split':
        return String(value).split(',');
      case 'join':
        return Array.isArray(value) ? value.join(',') : value;
      default:
        return value;
    }
  }
}