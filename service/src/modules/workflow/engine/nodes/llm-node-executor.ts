import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node-executor';
import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult, LLMNodeConfig, LLMRequest, LLMResponse } from '../workflow.types';
import { LlmService } from '@/modules/model/llm.service';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { initChatModel } from 'langchain';

/**
 * LLM节点执行器
 */
@Injectable()
export class LLMNodeExecutor extends BaseNodeExecutor {
  constructor(private readonly llmService: LlmService) {
    super();
  }

  /**
   * 执行LLM节点
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    const config = this.getNodeConfig<LLMNodeConfig>(node);

    this.logNodeConfig(
      node,
      context,
      `模型="${config.model}", 温度=${config.temperature}, 最大token=${config.maxTokens}`,
    );

    return this.safeExecute(node, context, async () => {
      const llmRequest = this.buildLLMRequest(config, context);
      const response = await this.callLLMAPI(llmRequest);

      return this.createResult('llm', {
        output: response.output || '',
        reasoning_content: response.reasoning_content || '',
        outputVariable: config.outputVariable || 'output',
        outputType: config.outputType || 'text',
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * 流式执行LLM节点
   */
  async *executeStream(node: WorkflowNode, context: WorkflowContext): AsyncGenerator<string> {
    const config = this.getNodeConfig<LLMNodeConfig>(node);
    const llmRequest = this.buildLLMRequest(config, context);

    for await (const chunk of this.callLLMAPIStream(llmRequest)) {
      yield chunk;
    }
  }

  /**
   * 构建LLM请求
   */
  private buildLLMRequest(config: LLMNodeConfig, context: WorkflowContext): LLMRequest {
    const { model, temperature, maxTokens, topP, systemPrompt, userPrompt, variableName, inputs } = config;

    // 解析所有输入变量并注册到 context，使提示词模板中可以用 {{变量名}} 引用
    const resolvedInputs: Record<string, any> = {};

    if (inputs && Array.isArray(inputs) && inputs.length > 0) {
      for (const input of inputs) {
        let value: any;
        if (input.source) {
          // 从指定来源获取（格式: nodeId.outputName）
          value = context.getVariableValue(input.source);
        } else {
          // 从全局变量获取
          value = context.getVariableValue(input.name);
        }
        resolvedInputs[input.name] = value;
        // 注册到 context 中，这样 replaceVariables 就能用 {{inputName}} 引用
        context.setVariable(input.name, value);
      }
    } else if (variableName) {
      // 旧方式：使用 variableName
      const value = context.getVariableValue(variableName || 'input');
      resolvedInputs[variableName || 'input'] = value;
    }

    // 构建消息数组
    const messages: Array<{ role: string; content: string }> = [];

    // 添加系统提示词
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: context.replaceVariables(systemPrompt),
      });
    }

    // 添加用户输入
    let userContent: string;
    if (userPrompt) {
      userContent = context.replaceVariables(userPrompt);
    } else {
      // 没有用户提示词模板时，取第一个输入作为内容
      const firstInputValue = Object.values(resolvedInputs)[0];
      userContent = String(firstInputValue ?? '');
    }
    messages.push({
      role: 'user',
      content: userContent,
    });

    return {
      model: model || 'lingmengcan',
      messages,
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 4096,
      top_p: topP || 1,
    };
  }

  /**
   * 调用LLM API
   */
  private async callLLMAPI(request: LLMRequest): Promise<LLMResponse> {
    const { model: modelName, messages, temperature, max_tokens, top_p } = request;

    const model = await this.llmService.findByModelName(modelName);
    if (!model) {
      throw new Error(`模型未找到: ${modelName}`);
    }

    // 创建模型实例
    const llm = await initChatModel(model.modelName, {
      modelProvider: model.apiType,
      temperature,
      topP: top_p,
      maxTokens: max_tokens,
      streaming: true,
      apiKey: model.apiKey,
      configuration: {
        baseURL: model.baseUrl,
      },
    });

    const chatMessages = messages.map((m) => {
      if (m.role === 'system') return new SystemMessage(m.content);
      return new HumanMessage(m.content);
    });

    let reasoning = '';
    let fullContent = '';
    let thinkTagComplete = false;

    for await (const chunk of await llm.stream(chatMessages)) {
      const content =
        chunk && typeof chunk === 'object' && 'content' in (chunk as any) ? (chunk as any).content || '' : '';
      fullContent += content;

      if (!thinkTagComplete) {
        const thinkMatch = fullContent.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
          reasoning = thinkMatch[1].trim();
          thinkTagComplete = true;
          fullContent = fullContent.replace(/<think>[\s\S]*?<\/think>/g, '');
        }
      }
    }

    return {
      output: fullContent.trim(),
      reasoning_content: reasoning,
    };
  }

  /**
   * 流式调用LLM API
   */
  private async *callLLMAPIStream(request: LLMRequest): AsyncGenerator<string> {
    const { model: modelName, messages, temperature, max_tokens, top_p } = request;

    const model = await this.llmService.findByModelName(modelName);
    if (!model) {
      throw new Error(`模型未找到: ${modelName}`);
    }

    // 创建模型实例
    const llm = await initChatModel(model.modelName, {
      modelProvider: model.apiType,
      temperature,
      topP: top_p,
      maxTokens: max_tokens,
      streaming: true,
      apiKey: model.apiKey,
      configuration: {
        baseURL: model.baseUrl,
      },
    });

    const chatMessages = messages.map((m) => {
      if (m.role === 'system') return new SystemMessage(m.content);
      return new HumanMessage(m.content);
    });

    let reasoning_content = '';
    let full_content = '';
    let sentCleanLength = 0;
    let thinkTagComplete = false;

    for await (const chunk of await llm.stream(chatMessages)) {
      const content =
        chunk && typeof chunk === 'object' && 'content' in (chunk as any) ? (chunk as any).content || '' : '';
      full_content += content;

      const thinkMatch = full_content.match(/<think>([\s\S]*?)<\/think>/);
      if (thinkMatch && !thinkTagComplete) {
        reasoning_content = thinkMatch[1].trim();
        thinkTagComplete = true;
        full_content = full_content.replace(/<think>[\s\S]*?<\/think>/g, '');
        sentCleanLength = 0;
      }

      if (!thinkTagComplete && full_content.includes('<think>')) {
        continue;
      }

      const newClean = full_content.substring(sentCleanLength);
      sentCleanLength = full_content.length;
      if (newClean) {
        yield JSON.stringify({ content: newClean, reasoning_content }) + '\n';
      }
    }

    const finalThinkMatch = full_content.match(/<think>([\s\S]*?)<\/think>/);
    if (finalThinkMatch) {
      reasoning_content = finalThinkMatch[1].trim();
    }

    yield JSON.stringify({ content: '', reasoning_content }) + '\n';
  }
}
