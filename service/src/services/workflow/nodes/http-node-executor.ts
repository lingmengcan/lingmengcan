import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node-executor';
import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult, HttpNodeConfig } from '../workflow.types';

/**
 * HTTP节点执行器
 */
@Injectable()
export class HttpNodeExecutor extends BaseNodeExecutor {
  /**
   * 执行HTTP节点
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    const config = this.getNodeConfig<HttpNodeConfig>(node);
    const { method, url, headers, body, timeout = 30000, retryCount = 0 } = config;

    this.logNodeConfig(node, context, `${method} ${url}`);

    return this.safeExecute(node, context, async () => {
      // 这里应该调用实际的HTTP请求
      // 暂时返回模拟结果
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = {
        message: 'HTTP请求成功',
        method,
        url,
        status: 200,
        headers: headers || {},
        body: body || null,
      };

      context.logExecution(
        node.id,
        node.type,
        `HTTP请求完成: ${method} ${url} - 状态: 200`,
        undefined,
        undefined,
        { response }
      );

      return this.createResult('http', {
        method,
        url,
        headers: headers || {},
        body: body || null,
        timeout,
        retryCount,
        status: 200,
        response,
        timestamp: new Date().toISOString(),
      });
    });
  }
}