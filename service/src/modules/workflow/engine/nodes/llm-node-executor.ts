import { Injectable } from '@nestjs/common';
import { BaseNodeExecutor } from './base-node-executor';
import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult, LLMNodeConfig, LLMRequest, LLMResponse } from '../workflow.types';
import { LlmService } from '@/modules/model/llm.service';
import { ChatOpenAI } from '@langchain/openai';
import { Ollama } from '@langchain/ollama';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';

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
      `模型="${config.model}", 温度=${config.temperature}, 最大token=${config.maxTokens}`
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
    const { model, temperature, maxTokens, topP, systemPrompt, userPrompt, variableName } = config;

    // 获取输入数据
    const inputData = context.getVariableValue(variableName || 'input');

    // 构建消息数组
    const messages: Array<{ role: string; content: string }> = [];

    // 添加系统提示词
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // 添加用户输入
    const userContent = userPrompt ? context.replaceVariables(userPrompt) : String(inputData);
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

    const isOllama = model.apiType === 'LLM_API_OLLAMA';

    const llmInstance: any = isOllama
      ? new Ollama({
          model: model.modelName,
          temperature: temperature ?? 0.7,
          topP: top_p ?? 1,
        })
      : new ChatOpenAI(
          {
            openAIApiKey: model.apiKey,
            temperature: temperature ?? 0.7,
            topP: top_p,
            maxTokens: max_tokens,
            streaming: true,
          },
          { basePath: model.baseUrl },
        );

    const promptMessages = messages.map((m) => {
      if (m.role === 'system') return SystemMessagePromptTemplate.fromTemplate(m.content);
      if (m.role === 'user') return HumanMessagePromptTemplate.fromTemplate(m.content);
      return HumanMessagePromptTemplate.fromTemplate(m.content);
    });

    const prompt = ChatPromptTemplate.fromMessages(promptMessages);
    const chain = prompt.pipe(llmInstance);

    let reasoning = '';
    let fullContent = '';
    let thinkTagComplete = false;

    for await (const chunk of await chain.stream({})) {
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

    const isOllama = model.apiType === 'LLM_API_OLLAMA';

    const llmInstance: any = isOllama
      ? new Ollama({
          model: model.modelName,
          temperature: temperature ?? 0.7,
          topP: top_p ?? 1,
        })
      : new ChatOpenAI(
          {
            openAIApiKey: model.apiKey,
            temperature: temperature ?? 0.7,
            topP: top_p,
            maxTokens: max_tokens,
            streaming: true,
          },
          { basePath: model.baseUrl },
        );

    const promptMessages = messages.map((m) => {
      if (m.role === 'system') return SystemMessagePromptTemplate.fromTemplate(m.content);
      if (m.role === 'user') return HumanMessagePromptTemplate.fromTemplate(m.content);
      return HumanMessagePromptTemplate.fromTemplate(m.content);
    });

    const prompt = ChatPromptTemplate.fromMessages(promptMessages);
    const chain = prompt.pipe(llmInstance);

    let reasoning_content = '';
    let full_content = '';
    let sentCleanLength = 0;
    let thinkTagComplete = false;

    for await (const chunk of await chain.stream({})) {
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