import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node-executor';
import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult, DatabaseNodeConfig } from '../workflow.types';

/**
 * 数据库节点执行器
 */
@Injectable()
export class DatabaseNodeExecutor extends BaseNodeExecutor {
  /**
   * 执行数据库节点
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    const config = this.getNodeConfig<DatabaseNodeConfig>(node);
    const { operation, table, query, connectionString, timeout = 30000 } = config;

    this.logNodeConfig(node, context, `操作=${operation}, 表=${table}`);

    return this.safeExecute(node, context, async () => {
      // 这里应该执行实际的数据库操作
      // 暂时返回模拟结果
      await new Promise((resolve) => setTimeout(resolve, 200));

      const result = {
        affectedRows: 1,
        message: '数据库操作成功',
        operation,
        table,
        query: query || 'SELECT * FROM ' + table,
      };

      context.logExecution(
        node.id,
        node.type,
        `数据库操作完成: ${operation} ${table}`,
        undefined,
        undefined,
        { result }
      );

      return this.createResult('database', {
        operation,
        table,
        query,
        connectionString,
        timeout,
        result,
        timestamp: new Date().toISOString(),
      });
    });
  }
}