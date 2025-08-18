import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from '@/controllers/workflow.controller';
import { WorkflowService } from '@/services/workflow.service';
import { Application } from '@/entities/application.entity';
import { WorkflowExecution } from '@/entities/workflow-execution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, WorkflowExecution])],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}