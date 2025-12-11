import { Message } from './message.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private repository: Repository<Message>,
  ) {}

  /**
   * 获取实体
   * @param id
   * @returns
   */
  findOne(id: string): Promise<Message> {
    return this.repository.findOneBy({ messageId: id });
  }

  findByMessageId(messageId: string): Promise<Message> {
    return this.repository.findOne({
      where: { messageId, status: 'complete' },
    });
  }

  /**
   * 消息列表
   *
   * @returns
   */
  async findListByConversationId(conversationId: string) {
    const messages = await this.repository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    return messages;
  }

  /**
   * 新增
   *
   * @param message 信息
   * @return 结果
   */
  async addMessage(message: Message) {
    const messageId = uuidv4();

    const entity = new Message();
    entity.messageId = messageId;
    entity.conversationId = message.conversationId;
    entity.content = message.content || [];
    entity.role = message.role || 'user';
    entity.status = message.status || 'pending';

    return this.repository.save(entity);
  }

  /**
   * 修改消息
   *
   * @param message 消息信息
   * @return 结果
   */
  async updateMessage(message: Message) {
    const entity = await this.findOne(message.messageId);
    if (message.content !== undefined) {
      entity.content = message.content;
    }
    if (message.role !== undefined) {
      entity.role = message.role;
    }
    if (message.status !== undefined) {
      entity.status = message.status;
    }

    return this.repository.save(entity);
  }

  /**
   * 修改消息状态
   *
   * @param message 消息信息
   * @return 结果
   */
  async updateStatus(message: Message) {
    const entity = await this.findOne(message.messageId);
    entity.status = message.status;
    return this.repository.save(entity);
  }

  /**
   * 清空消息
   *
   * @param conversationId conversationId
   * @return 结果
   */
  async clearMessagesByConversationId(conversationId: string) {
    return await this.repository.update({ conversationId: conversationId }, { status: 'error' });
  }
}
