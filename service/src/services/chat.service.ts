import { Injectable } from '@nestjs/common';
import { ChatDto, LlmChatDto } from '@/dtos/chat.dto';
import { MessageService } from './message.service';
import { Message } from '@/entities/message.entity';
import { ConversationService } from './conversation.service';
import { ConfigService } from '@nestjs/config';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { ChatMessageHistory } from '@langchain/community/stores/message/in_memory';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { VectorStore } from '@langchain/core/vectorstores';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { LlmService } from './llm.service';
import { Ollama } from '@langchain/ollama';
import { Llm } from '@/entities/llm.entity';
import { ChatPromptValueInterface } from '@langchain/core/dist/prompt_values';
import { RunnableLike } from '@langchain/core/runnables';
import { Conversation } from '@/entities/conversation.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly llmService: LlmService,
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
    private readonly configService: ConfigService,
  ) {}

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
    let llm;
    if (model.apiType === 'LLM_API_OLLAMA') {
      llm = new Ollama({
        model: model.modelName,
        temperature: dto.temperature,
        topP: dto.top_p || 1,
      });
    } else {
      llm = new ChatOpenAI(
        {
          openAIApiKey: model.apiKey,
          temperature: dto.temperature,
          topP: dto.top_p,
          maxTokens: dto.max_tokens,
          streaming: true,
        },
        { basePath: model.baseUrl },
      );
    }

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

      for await (const chunk of await chain.stream({})) {
        // 检查是否有深度思考内容（适用于支持推理的模型如 o1）
        if (chunk && typeof chunk === 'object' && 'additional_kwargs' in chunk) {
          const chunkWithKwargs = chunk as any;
          if (chunkWithKwargs.additional_kwargs?.reasoning_content) {
            reasoning_content += chunkWithKwargs.additional_kwargs.reasoning_content;
          }
        }

        // 获取内容 - 添加类型检查
        const content = (chunk && typeof chunk === 'object' && 'content' in chunk) 
          ? (chunk as any).content || '' 
          : '';

        // 返回包含深度思考内容的 JSON 格式
        const responseData = {
          content: content,
          reasoning_content: reasoning_content,
          type: 'chunk',
        };
        yield JSON.stringify(responseData) + '\n';
      }

      // 最后发送完成标记
      const finalData = {
        content: '',
        reasoning_content: reasoning_content,
        type: 'complete',
      };
      yield JSON.stringify(finalData) + '\n';
    }

    return processStreamWithReasoning();
  }

  //重新回答
  async regenerate(dto: ChatDto) {
    // 获取问题
    const message = await this.messageService.findByMessageId(dto.message.previousId);
    return this.chatLlm(message);
  }

  // 调用大模型对话
  async chatLlm(message: Message) {
    const conversation = await this.conversationService.findByConversationId(message.conversationId);

    // 获取模型信息
    const model = await this.llmService.findByModelName(conversation.llm);

    // This is where you will store your chat history.
    const messageHistory = new ChatMessageHistory();

    conversation.messages.forEach((item) => {
      // 获取历史消息，如果消息时间小于当前消息，并且文件id相同，则认为是历史消息，当时文件回答时，只获取当前文件的消息
      if (item.createdAt < new Date(message.createdAt) && message.fileId === item.fileId) {
        if (item.role === 'user') {
          messageHistory.addMessage(new HumanMessage(item.content));
        } else if (item.role === 'assistant') {
          messageHistory.addMessage(new AIMessage(item.content));
        }
      }
    });

    if (message.fileId) {
      const vectorStore = await Chroma.fromExistingCollection(
        new OpenAIEmbeddings(
          { openAIApiKey: model.apiKey, modelName: model.defaultEmbeddingModel },
          { basePath: model.baseUrl },
        ),
        {
          collectionName: message.fileId,
          url: this.configService.get<string>('chromadb.db'),
        },
      );

      return this.chatfileOpenAi(message.content, conversation, messageHistory, model, vectorStore);
    } else {
      return this.chatOpenAi(message.content, conversation, messageHistory, model);
    }
  }

  //自由对话
  async chatOpenAi(message: string, conversation: Conversation, messageHistory: ChatMessageHistory, model: Llm) {
    //根据内容回答问题

    // 工厂函数，创建模型实例
    function createModelInstance(
      model: Llm,
      temperature: number,
      topP: number,
      maxTokens: number,
    ): RunnableLike<ChatPromptValueInterface, unknown> {
      if (model.apiType === 'LLM_API_OLLAMA') {
        return new Ollama({
          model: model.modelName,
          temperature,
          topP,
        });
      } else {
        return new ChatOpenAI(
          { openAIApiKey: model.apiKey, temperature, topP, maxTokens, streaming: true },
          { basePath: model.baseUrl },
        );
      }
    }

    const llm = createModelInstance(model, conversation.temperature, conversation.topP, conversation.maxTokens);

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
    // Instantiate your model and prompt.
    const llm = new ChatOpenAI(
      { openAIApiKey: model.apiKey, temperature: conversation.temperature, streaming: true },
      { basePath: model.baseUrl },
    );
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
