import { Injectable } from '@nestjs/common';
import { ChatDto, LlmChatDto } from './chat.dto';
import { MessageService } from './message/message.service';
import { Message } from './message/message.entity';
import { ConversationService } from './conversation/conversation.service';
import { ConfigService } from '@nestjs/config';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatMessageHistory } from '@langchain/community/stores/message/in_memory';
import { initChatModel } from 'langchain';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { VectorStore } from '@langchain/core/vectorstores';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { LlmService } from '@/modules/model/llm.service';
import { Llm } from '@/modules/model/llm.entity';
import { Conversation } from './conversation/conversation.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly llmService: LlmService,
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 从 JSON 数组格式的 content 中提取文本内容
   * @param content AIMessageContent[] | UserMessageContent[] | string
   * @returns 文本内容字符串
   */
  private extractTextFromContent(content: any): string {
    if (!content) return '';

    // 如果已经是字符串，直接返回
    if (typeof content === 'string') {
      return content;
    }

    // 如果是数组，提取所有 text 和 markdown 类型的内容
    if (Array.isArray(content)) {
      return content
        .filter((item) => item && (item.type === 'text' || item.type === 'markdown'))
        .map((item) => item.data || '')
        .join('\n');
    }

    return '';
  }

  //自由对话
  async chat(dto: ChatDto) {
    const { message } = dto;
    return this.chatLlm(message);
  }

  // LLM 调试对话 - 不存储到数据库
  async debugChat(dto: LlmChatDto) {
    // 获取模型配置
    const model = await this.llmService.findByModelName(dto.model);
    if (!model) {
      throw new Error(`模型 ${dto.model} 未找到`);
    }

    // 创建模型实例
    const llm = await initChatModel(model.modelName, {
      modelProvider: model.apiType,
      temperature: dto.temperature,
      topP: dto.top_p,
      maxTokens: dto.max_tokens,
      streaming: true,
      apiKey: model.apiKey,
      configuration: {
        baseURL: model.baseUrl,
      },
    });

    // 转换消息格式
    const messages = dto.messages.map((msg) => {
      switch (msg.role) {
        case 'system':
          return SystemMessagePromptTemplate.fromTemplate(msg.content);
        case 'user':
          return HumanMessagePromptTemplate.fromTemplate(msg.content);
        case 'assistant':
          // 对于 assistant 消息，我们需要用 AIMessage 处理
          return new AIMessage(msg.content);
        default:
          return HumanMessagePromptTemplate.fromTemplate(msg.content);
      }
    });

    // 创建提示模板
    const prompt = ChatPromptTemplate.fromMessages(messages);

    // 不使用 StringOutputParser，直接获取原始响应以获取推理内容
    const chain = prompt.pipe(llm);

    // 创建一个异步生成器来处理流式响应并提取深度思考内容
    async function* processStreamWithReasoning() {
      let reasoning_content = '';
      let full_content = '';
      let sentCleanContentLength = 0;

      let thinkTagComplete = false;

      for await (const chunk of await chain.stream({})) {
        // 获取内容 - 添加类型检查
        const content = chunk && typeof chunk === 'object' && 'content' in chunk ? (chunk as any).content || '' : '';

        // 累积完整内容用于提取推理
        full_content += content;

        // 检查是否包含完整的 <think></think> 标签
        const thinkMatch = full_content.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch && !thinkTagComplete) {
          reasoning_content = thinkMatch[1].trim();
          thinkTagComplete = true;
          // 移除 think 标签后重新设置 full_content
          full_content = full_content.replace(/<think>[\s\S]*?<\/think>/g, '');
          sentCleanContentLength = 0; // 重置已发送长度
        }

        // 如果 think 标签还没完整接收，跳过内容发送
        if (!thinkTagComplete && full_content.includes('<think>')) {
          continue;
        }

        // 计算新增的干净内容
        const newCleanContent = full_content.substring(sentCleanContentLength);
        sentCleanContentLength = full_content.length;

        // 只有当有新的干净内容时才发送
        if (newCleanContent.trim()) {
          const responseData = {
            content: newCleanContent,
            reasoning_content: reasoning_content,
          };
          yield JSON.stringify(responseData) + '\n';
        }
      }

      // 最后发送完成标记，确保推理内容完整
      const finalThinkMatch = full_content.match(/<think>([\s\S]*?)<\/think>/);
      if (finalThinkMatch) {
        reasoning_content = finalThinkMatch[1].trim();
      }

      const finalData = {
        content: '',
        reasoning_content: reasoning_content,
      };
      yield JSON.stringify(finalData) + '\n';
    }

    return processStreamWithReasoning();
  }

  //重新回答
  async regenerate(dto: ChatDto) {
    // 获取当前消息（通过 messageId）
    const message = await this.messageService.findOne(dto.message.messageId);
    if (!message) {
      throw new Error('消息不存在');
    }

    // 查找同对话中上一条用户消息
    const conversation = await this.conversationService.findByConversationId(message.conversationId);
    const userMessages = conversation.messages
      .filter((msg) => msg.role === 'user' && msg.createdAt < message.createdAt)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const previousMessage = userMessages[0];
    if (!previousMessage) {
      throw new Error('未找到上一条用户消息');
    }

    return this.chatLlm(previousMessage);
  }

  // 调用大模型对话
  async chatLlm(message: Message) {
    const conversation = await this.conversationService.findByConversationId(message.conversationId);

    // 获取模型信息
    const model = await this.llmService.findByModelName(conversation.llm);

    // This is where you will store your chat history.
    const messageHistory = new ChatMessageHistory();

    // 获取历史消息，如果消息时间小于当前消息，则认为是历史消息
    conversation.messages.forEach((item) => {
      if (item.createdAt < message.createdAt) {
        const textContent = this.extractTextFromContent(item.content);
        if (textContent) {
          if (item.role === 'user') {
            messageHistory.addMessage(new HumanMessage(textContent));
          } else if (item.role === 'assistant') {
            messageHistory.addMessage(new AIMessage(textContent));
          }
        }
      }
    });

    // 提取当前消息的文本内容
    const messageText = this.extractTextFromContent(message.content);

    // 检查 content 中是否包含 attachment 类型的文件信息
    let fileId: string | null = null;
    if (Array.isArray(message.content)) {
      const attachmentContent = message.content.find((item) => item?.type === 'attachment');
      if (attachmentContent?.data && Array.isArray(attachmentContent.data) && attachmentContent.data.length > 0) {
        // 从 attachment 中提取文件ID（如果有的话）
        // 这里需要根据实际的 attachment 数据结构来调整
        fileId = attachmentContent.data[0]?.metadata?.fileId || null;
      }
    }

    if (fileId) {
      const vectorStore = await Chroma.fromExistingCollection(
        new OpenAIEmbeddings({
          openAIApiKey: model.apiKey,
          modelName: model.defaultEmbeddingModel,
          configuration: {
            baseURL: model.baseUrl,
          },
        }),
        {
          collectionName: fileId,
          url: this.configService.get<string>('chromadb.db'),
        },
      );

      return this.chatfileOpenAi(messageText, conversation, messageHistory, model, vectorStore);
    } else {
      return this.chatOpenAi(messageText, conversation, messageHistory, model);
    }
  }

  //自由对话
  async chatOpenAi(message: string, conversation: Conversation, messageHistory: ChatMessageHistory, model: Llm) {
    //根据内容回答问题
    const llm = await initChatModel(model.modelName, {
      modelProvider: model.apiType,
      temperature: conversation.temperature,
      topP: conversation.topP,
      maxTokens: conversation.maxTokens,
      streaming: true,
      apiKey: model.apiKey,
      configuration: {
        baseURL: model.baseUrl,
      },
    });

    const prompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);

    const outputParser = new StringOutputParser();

    const chain = prompt.pipe(llm).pipe(outputParser);

    const stream = await chain.stream({
      history: await messageHistory.getMessages(),
      input: message,
    });

    return stream;
  }

  //文档问答
  async chatfileOpenAi(
    message: string,
    conversation: Conversation,
    messageHistory: ChatMessageHistory,
    model: Llm,
    vectorStore: VectorStore,
  ) {
    const result = await vectorStore.similaritySearch(message, 1);

    //根据内容回答问题
    const llm = await initChatModel(model.modelName, {
      modelProvider: model.apiType,
      temperature: conversation.temperature,
      streaming: true,
      apiKey: model.apiKey,
      configuration: {
        baseURL: model.baseUrl,
      },
    });
    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `基于已知内容, 回答用户问题。如果无法从中得到答案，请说'没有足够的相关信息'已知内容:${result[0].pageContent}`,
      ),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);

    const outputParser = new StringOutputParser();

    const chain = prompt.pipe(llm).pipe(outputParser);

    const stream = await chain.stream({
      history: await messageHistory.getMessages(),
      input: message,
    });

    return stream;
  }
}
