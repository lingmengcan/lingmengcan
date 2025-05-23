import { Message } from '@/entities/message.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private repository: Repository<Message>,
    private dataSource: DataSource,
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
      where: { messageId, status: 0 },
    });
  }

  /**
   * 消息列表
   *
   * @returns
   */
  async findListByConversationId(conversationId: string) {
    const messages = await this.repository.find({
      where: { status: 0, conversationId },
      order: { createdAt: 'ASC' },
    });

    // 按聊天问题记录排序
    const res = messages.reduce((acc, item) => {
      if (item.sender === 'Human' || item.sender === 'System') {
        acc.push(item);

        const aiMessages = messages.filter((msg) => msg.previousId === item.messageId);

        if (aiMessages?.length > 0) {
          acc.push(...aiMessages);
        }
      }
      return acc;
    }, [] as Message[]);

    return res;
  }

  /**
   * 新增
   *
   * @param menu 信息
   * @return 结果
   */
  async addMessage(message: Message) {
    const messageId = uuidv4();

    const entity = new Message();
    entity.messageId = messageId;
    entity.previousId = message.previousId;
    entity.conversationId = message.conversationId;
    entity.fileId = message.fileId;
    entity.content = message.content;
    entity.sender = message.sender;
    entity.role = message.role;
    entity.reasoning = message.reasoning;
    entity.completed = message.completed;
    entity.status = message.status;
    entity.createdAt = new Date();

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
    entity.content = message.content;
    entity.sender = message.sender;
    entity.role = message.role;
    entity.reasoning = message.reasoning;
    entity.status = message.status;
    entity.completed = message.completed;

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
    return await this.repository.update({ conversationId: conversationId }, { status: 1 });
  }
}
