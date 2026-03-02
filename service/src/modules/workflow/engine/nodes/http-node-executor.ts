import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { BaseNodeExecutor } from './base-node-executor';
import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult, HttpNodeConfig } from '../workflow.types';

/**
 * HTTP节点执行器
 * 使用 axios 发送真实 HTTP 请求
 */
@Injectable()
export class HttpNodeExecutor extends BaseNodeExecutor {
  private readonly logger = new Logger(HttpNodeExecutor.name);

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
      outputs,
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
        headers.forEach((h) => {
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
      let resolvedBody: any = undefined;
      if (body !== undefined && body !== null && body !== '') {
        if (typeof body === 'string') {
          resolvedBody = context.replaceVariables(body);
          if (bodyType === 'json') {
            try {
              resolvedBody = JSON.parse(resolvedBody);
            } catch {
              // 保持字符串格式
            }
          }
        } else if (typeof body === 'object') {
          // 遍历对象值替换变量
          resolvedBody = this.resolveBodyVariables(body, context);
        } else {
          resolvedBody = body;
        }
      }

      // 注入 resolvedInputs 到请求体（如果有配置 inputs）
      if (Object.keys(resolvedInputs).length > 0 && resolvedBody && typeof resolvedBody === 'object') {
        resolvedBody = { ...resolvedBody, ...resolvedInputs };
      }

      // 构建 axios 请求配置
      const axiosConfig: AxiosRequestConfig = {
        method: method.toUpperCase() as Method,
        url: resolvedUrl,
        headers: resolvedHeaders,
        timeout,
        // 不抛出非 2xx 状态码的异常，由我们自己处理
        validateStatus: () => true,
      };

      // 根据 method 设置请求体
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
        if (bodyType === 'form' && resolvedBody && typeof resolvedBody === 'object') {
          const formData = new URLSearchParams();
          Object.entries(resolvedBody).forEach(([key, value]) => {
            formData.append(key, String(value));
          });
          axiosConfig.data = formData.toString();
          axiosConfig.headers = {
            ...axiosConfig.headers,
            'Content-Type': 'application/x-www-form-urlencoded',
          };
        } else {
          axiosConfig.data = resolvedBody;
          if (!resolvedHeaders['Content-Type'] && !resolvedHeaders['content-type']) {
            axiosConfig.headers = {
              ...axiosConfig.headers,
              'Content-Type': 'application/json',
            };
          }
        }
      } else if (method.toUpperCase() === 'GET' && resolvedBody && typeof resolvedBody === 'object') {
        // GET 请求将 body 作为 query params
        axiosConfig.params = resolvedBody;
      }

      // 发送 HTTP 请求（带重试）
      let response: AxiosResponse;
      let lastError: Error | null = null;
      const maxAttempts = Math.max(1, (retryCount || 0) + 1);

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          this.logger.log(`HTTP请求 [尝试 ${attempt}/${maxAttempts}]: ${method} ${resolvedUrl}`);
          response = await axios(axiosConfig);
          lastError = null;
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          this.logger.warn(
            `HTTP请求失败 [尝试 ${attempt}/${maxAttempts}]: ${lastError.message}`,
          );

          if (attempt < maxAttempts) {
            // 指数退避重试，基础延迟 1s
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      // 所有重试都失败
      if (lastError || !response) {
        const errorMsg = lastError?.message || '未知HTTP请求错误';

        if (errorHandling === 'continue') {
          context.logExecution(
            node.id,
            node.type,
            `HTTP请求失败(已忽略): ${method} ${resolvedUrl} - ${errorMsg}`,
            undefined,
            errorMsg,
          );

          const outputValues: Record<string, any> = {
            response: null,
            statusCode: 0,
            headers: {},
            error: errorMsg,
          };
          const nodeOutputs = this.buildOutputs(outputs, outputValues);
          return this.createResult('http', {
            method,
            url: resolvedUrl,
            status: 0,
            error: errorMsg,
            timestamp: new Date().toISOString(),
          }, nodeOutputs);
        }

        if (errorHandling === 'default') {
          const outputValues: Record<string, any> = {
            response: {},
            statusCode: 0,
            headers: {},
            error: errorMsg,
          };
          const nodeOutputs = this.buildOutputs(outputs, outputValues);
          return this.createResult('http', {
            method,
            url: resolvedUrl,
            status: 0,
            response: {},
            error: errorMsg,
            timestamp: new Date().toISOString(),
          }, nodeOutputs);
        }

        // errorHandling === 'fail'
        throw new Error(`HTTP请求失败: ${method} ${resolvedUrl} - ${errorMsg}`);
      }

      // 解析响应数据
      let responseData = response.data;

      // 如果响应是字符串且看起来像 JSON，尝试解析
      if (typeof responseData === 'string') {
        try {
          responseData = JSON.parse(responseData);
        } catch {
          // 保持字符串格式
        }
      }

      context.logExecution(
        node.id,
        node.type,
        `HTTP请求完成: ${method} ${resolvedUrl} - 状态: ${response.status}`,
        undefined,
        undefined,
        {
          requestInfo: { method, url: resolvedUrl, headers: resolvedHeaders },
          responseInfo: { status: response.status, statusText: response.statusText },
        },
      );

      // 构建输出变量
      const responseHeaders: Record<string, string> = {};
      if (response.headers) {
        Object.entries(response.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            responseHeaders[key] = value;
          }
        });
      }

      const outputValues: Record<string, any> = {
        response: responseData,
        statusCode: response.status,
        headers: responseHeaders,
        body: responseData,
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
        statusText: response.statusText,
        response: responseData,
        responseHeaders,
        timestamp: new Date().toISOString(),
      }, nodeOutputs);
    });
  }

  /**
   * 递归替换对象中的变量引用
   */
  private resolveBodyVariables(obj: any, context: WorkflowContext): any {
    if (typeof obj === 'string') {
      return context.replaceVariables(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.resolveBodyVariables(item, context));
    }
    if (obj && typeof obj === 'object') {
      const result: Record<string, any> = {};
      Object.entries(obj).forEach(([key, value]) => {
        result[key] = this.resolveBodyVariables(value, context);
      });
      return result;
    }
    return obj;
  }
}