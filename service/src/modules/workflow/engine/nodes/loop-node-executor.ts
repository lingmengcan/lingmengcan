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
    const { 
      loopType = 'foreach',
      iterateVariable,
      startIndex = 0,
      endIndex = 10,
      step = 1,
      condition,
      maxIterations = 100, 
      breakCondition,
      aggregation = 'collect',
      inputs,
      outputs
    } = config;

    // 解析输入变量
    const resolvedInputs = this.resolveInputs(node, context);

    this.logNodeConfig(node, context, `类型=${loopType}, 最大迭代=${maxIterations}`);

    return this.safeExecute(node, context, async () => {
      const results: any[] = [];
      let currentIndex = 0;
      let shouldContinue = true;
      let iterableData: any[] = [];

      // 根据循环类型确定迭代数据
      if (loopType === 'foreach') {
        // 从输入获取要遍历的数组
        if (iterateVariable) {
          const varValue = context.getVariableValue(iterateVariable.replace(/\{\{|\}\}/g, '').trim());
          iterableData = Array.isArray(varValue) ? varValue : [];
        } else {
          // 尝试从inputs中获取数组
          iterableData = resolvedInputs.items || resolvedInputs.input || [];
          if (!Array.isArray(iterableData)) {
            iterableData = [iterableData];
          }
        }
      }

      // 执行循环
      while (shouldContinue && currentIndex < maxIterations) {
        let currentItem: any;
        
        switch (loopType) {
          case 'foreach':
            if (currentIndex >= iterableData.length) {
              shouldContinue = false;
              break;
            }
            currentItem = iterableData[currentIndex];
            break;

          case 'for':
            const currentValue = startIndex + currentIndex * step;
            if (currentValue >= endIndex) {
              shouldContinue = false;
              break;
            }
            currentItem = currentValue;
            break;

          case 'while':
            if (condition) {
              shouldContinue = this.evaluateCondition(condition, context);
              if (!shouldContinue) break;
            }
            currentItem = currentIndex;
            break;
        }

        if (!shouldContinue) break;

        // 检查中断条件
        if (breakCondition) {
          const shouldBreak = this.evaluateCondition(breakCondition, context);
          if (shouldBreak) {
            shouldContinue = false;
            break;
          }
        }

        // 设置当前迭代变量
        context.setVariable(`${node.id}_index`, currentIndex);
        context.setVariable(`${node.id}_item`, currentItem);

        results.push(currentItem);
        currentIndex++;
      }

      // 聚合结果
      let aggregatedResult: any;
      switch (aggregation) {
        case 'collect':
          aggregatedResult = results;
          break;
        case 'sum':
          aggregatedResult = results.reduce((a, b) => Number(a) + Number(b), 0);
          break;
        case 'concat':
          aggregatedResult = results.join('');
          break;
        case 'first':
          aggregatedResult = results[0];
          break;
        case 'last':
          aggregatedResult = results[results.length - 1];
          break;
        default:
          aggregatedResult = results;
      }

      context.logExecution(
        node.id,
        node.type,
        `循环完成: 共迭代${currentIndex}次`,
        undefined,
        undefined,
        { iterations: currentIndex, results }
      );

      // 构建输出
      const outputValues: Record<string, any> = {
        output: aggregatedResult,
        index: currentIndex,
        item: results[results.length - 1]
      };

      const nodeOutputs = this.buildOutputs(outputs, outputValues);

      return this.createResult('loop', {
        loopType,
        maxIterations,
        iterations: currentIndex,
        results,
        aggregatedResult,
        timestamp: new Date().toISOString(),
      }, nodeOutputs);
    });
  }

  /**
   * 评估循环条件
   */
  private evaluateCondition(condition: string, context: WorkflowContext): boolean {
    if (!condition) return false;
    
    try {
      // 替换变量
      let expression = context.replaceVariables(condition);
      
      // 简单的表达式求值（仅用于演示，生产环境应使用更安全的解析器）
      // eslint-disable-next-line no-eval
      return eval(expression);
    } catch (error) {
      return false;
    }
  }
}