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
    const { 
      method = 'GET', 
      url, 
      headers, 
      body, 
      bodyType = 'json',
      timeout = 30000, 
      retryCount = 0,
      errorHandling = 'fail',
      inputs,
      outputs
    } = config;

    // 解析输入变量
    const resolvedInputs = this.resolveInputs(node, context);

    // 替换URL中的变量引用
    const resolvedUrl = context.replaceVariables(url || '');

    this.logNodeConfig(node, context, `${method} ${resolvedUrl}`);

    return this.safeExecute(node, context, async () => {
      // 构建请求头
      const resolvedHeaders: Record<string, string> = {};
      if (Array.isArray(headers)) {
        headers.forEach(h => {
          if (h.key) {
            resolvedHeaders[h.key] = context.replaceVariables(h.value || '');
          }
        });
      } else if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
          resolvedHeaders[key] = context.replaceVariables(value);
        });
      }

      // 构建请求体
      let resolvedBody = body;
      if (body && typeof body === 'string') {
        resolvedBody = context.replaceVariables(body);
        if (bodyType === 'json') {
          try {
            resolvedBody = JSON.parse(resolvedBody);
          } catch (e) {
            // 保持字符串格式
          }
        }
      }

      // TODO: 实际发送HTTP请求
      // 这里应该使用axios或其他HTTP客户端
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = {
        message: 'HTTP请求成功',
        method,
        url: resolvedUrl,
        status: 200,
        headers: resolvedHeaders,
        body: resolvedBody,
        data: { result: 'mock response data' }
      };

      context.logExecution(
        node.id,
        node.type,
        `HTTP请求完成: ${method} ${resolvedUrl} - 状态: 200`,
        undefined,
        undefined,
        { response }
      );

      // 构建输出变量
      const outputValues: Record<string, any> = {
        response: response.data,
        statusCode: response.status,
        headers: response.headers
      };

      const nodeOutputs = this.buildOutputs(outputs, outputValues);

      return this.createResult('http', {
        method,
        url: resolvedUrl,
        headers: resolvedHeaders,
        body: resolvedBody,
        timeout,
        retryCount,
        status: response.status,
        response: response.data,
        timestamp: new Date().toISOString(),
      }, nodeOutputs);
    });
  }
}