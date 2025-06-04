import { Conversation } from '@/entities/conversation.entity';
import { Message } from '@/entities/message.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private repository: Repository<Conversation>,
    private dataSource: DataSource,
  ) {}

  /**
   * 获取实体
   * @param id
   * @returns
   */
  findOne(id: string): Promise<Conversation> {
    return this.repository.findOneBy({ conversationId: id });
  }

  async findByConversationId(conversationId: string): Promise<Conversation> {
    const conversation = await this.repository
      .createQueryBuilder('Conversation')
      .leftJoinAndSelect('Conversation.messages', 'Message')
      .where({ conversationId, status: 0 })
      .orderBy({ 'Message.createdAt': 'DESC' })
      .getOne();

    return conversation;
  }

  /**
   * 对话列表
   *
   * @returns
   */
  async findUserList(userName: string) {
    return this.repository.find({
      where: { status: 0, userName },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 新增
   *
   * @param conversation 信息
   * @return 结果
   */
  async addConversation(conversation: Conversation) {
    const conversationId = uuidv4();

    const entity = new Conversation();
    entity.conversationId = conversationId;
    entity.conversationName = conversation.conversationName;
    entity.userName = conversation.userName;
    entity.status = conversation.status;
    entity.temperature = conversation.temperature;
    entity.systemPrompt = conversation.systemPrompt;
    entity.topP = conversation.topP;
    entity.maxTokens = conversation.maxTokens;
    entity.llm = conversation.llm;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  /**
   * 修改对话
   *
   * @param conversation 对话信息
   * @return 结果
   */
  async updateConversation(conversation: Conversation) {
    const entity = await this.findOne(conversation.conversationId);
    entity.conversationName = conversation.conversationName;
    entity.llm = conversation.llm;
    entity.temperature = conversation.temperature;
    entity.systemPrompt = conversation.systemPrompt;
    entity.topP = conversation.topP;
    entity.maxTokens = conversation.maxTokens;
    entity.status = conversation.status;
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  /**
   * 修改对话状态
   *
   * @param conversation 对话信息
   * @return 结果
   */
  async updateStatus(conversation: Conversation) {
    const entity = await this.findOne(conversation.conversationId);
    entity.status = conversation.status;
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  /**
   * 清空用户对话列表
   *
   * @param userName 用户
   * @return 结果
   */
  async clearConversationList(userName: string) {
    const res = await this.dataSource
      .createQueryBuilder()
      .update(Conversation)
      .set({ status: 1 })
      .where({ userName })
      .execute();

    return res;
  }
}
