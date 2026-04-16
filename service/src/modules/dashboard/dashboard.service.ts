import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/system/user/user.entity';
import { Conversation } from '@/modules/chat/conversation/conversation.entity';
import { Message } from '@/modules/chat/message/message.entity';
import { Llm } from '@/modules/model/llm.entity';
import { Knowledge } from '@/modules/knowledge/knowledge.entity';
import { Workflow } from '@/modules/workflow/workflow.entity';
import { WorkflowExecution } from '@/modules/workflow/workflow-execution.entity';
import dayjs from 'dayjs';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Llm)
    private llmRepository: Repository<Llm>,
    @InjectRepository(Knowledge)
    private knowledgeRepository: Repository<Knowledge>,
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowExecution)
    private workflowExecutionRepository: Repository<WorkflowExecution>,
  ) {}

  async getOverview() {
    const [totalUsers, activeUsers] = await Promise.all([
      this.userRepository.count({ where: { status: 0 } }),
      this.userRepository
        .createQueryBuilder('user')
        .where('user.loginDate >= :date', { date: dayjs().subtract(30, 'day').toDate() })
        .andWhere('user.status = 0')
        .getCount(),
    ]);

    const [totalConversations, totalMessages] = await Promise.all([
      this.conversationRepository.count({ where: { status: 0 } }),
      this.messageRepository.count(),
    ]);

    const [totalModels, totalKnowledges, totalWorkflows] = await Promise.all([
      this.llmRepository.count({ where: { status: 0 } }),
      this.knowledgeRepository.count({ where: { status: 0 } }),
      this.workflowRepository.count(),
    ]);

    const [successCount, failCount] = await Promise.all([
      this.workflowExecutionRepository.count({ where: { status: 1 } }),
      this.workflowExecutionRepository.count({ where: { status: 2 } }),
    ]);

    const totalExecutions = successCount + failCount;
    const successRate = totalExecutions > 0 ? Math.round((successCount / totalExecutions) * 100) : 0;

    return {
      totalUsers,
      activeUsers,
      totalConversations,
      totalMessages,
      totalModels,
      totalKnowledges,
      totalWorkflows,
      successRate,
    };
  }

  async getUserGrowth(days: number = 7) {
    const results = [];
    const startDate = dayjs().subtract(days, 'day').startOf('day');

    for (let i = 0; i < days; i++) {
      const date = startDate.add(i, 'day');
      const nextDate = date.add(1, 'day');

      const count = await this.userRepository
        .createQueryBuilder('user')
        .where('user.createdAt >= :start', { start: date.toDate() })
        .andWhere('user.createdAt < :end', { end: nextDate.toDate() })
        .getCount();

      results.push({
        date: date.format('MM-DD'),
        count,
      });
    }

    return results;
  }

  async getConversationTrend(days: number = 7) {
    const results = [];
    const startDate = dayjs().subtract(days, 'day').startOf('day');

    for (let i = 0; i < days; i++) {
      const date = startDate.add(i, 'day');
      const nextDate = date.add(1, 'day');

      const count = await this.conversationRepository
        .createQueryBuilder('conversation')
        .where('conversation.createdAt >= :start', { start: date.toDate() })
        .andWhere('conversation.createdAt < :end', { end: nextDate.toDate() })
        .getCount();

      results.push({
        date: date.format('MM-DD'),
        count,
      });
    }

    return results;
  }

  async getWorkflowStats() {
    const [total, success, failed, running, stopped, timeout] = await Promise.all([
      this.workflowExecutionRepository.count(),
      this.workflowExecutionRepository.count({ where: { status: 1 } }),
      this.workflowExecutionRepository.count({ where: { status: 2 } }),
      this.workflowExecutionRepository.count({ where: { status: 0 } }),
      this.workflowExecutionRepository.count({ where: { status: 3 } }),
      this.workflowExecutionRepository.count({ where: { status: 4 } }),
    ]);

    return {
      total,
      success,
      failed,
      running,
      stopped,
      timeout,
    };
  }

  async getModelDistribution() {
    const models = await this.llmRepository.find({ where: { status: 0 } });

    const distribution: Record<string, number> = {};
    models.forEach((model) => {
      const type = model.modelTypeName || model.modelType || '其他';
      distribution[type] = (distribution[type] || 0) + 1;
    });

    return Object.entries(distribution).map(([type, count]) => ({
      type,
      count,
    }));
  }
}
