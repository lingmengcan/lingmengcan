import { Prompt } from './prompt.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PromptService {
  constructor(
    @InjectRepository(Prompt)
    private repository: Repository<Prompt>,
    private dataSource: DataSource,
  ) {}

  /**
   * 获取实体
   * @param id
   * @returns
   */
  findOne(id: string): Promise<Prompt> {
    return this.repository.findOneBy({ promptId: id });
  }

  findByPromptId(promptId: string): Promise<Prompt> {
    return this.repository.findOne({
      where: { promptId, status: 0 },
    });
  }

  /**
   * 列表
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
   * @param prompt 信息
   * @return 结果
   */
  async addPrompt(prompt: Prompt) {
    const promptId = uuidv4();

    const entity = new Prompt();
    entity.promptId = promptId;
    entity.title = prompt.title;
    entity.userName = prompt.userName;
    entity.status = prompt.status;
    entity.createdAt = new Date();
    entity.content = prompt.content;
    return this.repository.save(entity);
  }

  /**
   * 修改指令
   *
   * @param prompt 指令信息
   * @return 结果
   */
  async updatePrompt(prompt: Prompt) {
    const entity = await this.findOne(prompt.promptId);
    entity.title = prompt.title;
    entity.status = prompt.status;
    entity.content = prompt.content;
    return this.repository.save(entity);
  }

  /**
   * 修改指令状态
   *
   * @param prompt 对话信息
   * @return 结果
   */
  async updateStatus(prompt: Prompt) {
    const entity = await this.findOne(prompt.promptId);
    entity.status = prompt.status;
    return this.repository.save(entity);
  }
}
