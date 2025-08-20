import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from '@/controllers/workflow.controller';
import { WorkflowService } from '@/services/workflow.service';
import { Workflow } from '@/entities/workflow.entity';
import { WorkflowExecution } from '@/entities/workflow-execution.entity';
import { WorkflowNodeType } from '@/entities/workflow-node-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workflow, WorkflowExecution, WorkflowNodeType])],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}