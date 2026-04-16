import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '@/modules/system/user/user.entity';
import { Conversation } from '@/modules/chat/conversation/conversation.entity';
import { Message } from '@/modules/chat/message/message.entity';
import { Llm } from '@/modules/model/llm.entity';
import { Knowledge } from '@/modules/knowledge/knowledge.entity';
import { Workflow } from '@/modules/workflow/workflow.entity';
import { WorkflowExecution } from '@/modules/workflow/workflow-execution.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Conversation,
      Message,
      Llm,
      Knowledge,
      Workflow,
      WorkflowExecution,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
