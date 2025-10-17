import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from '@/controllers/workflow.controller';
import { WorkflowService } from '@/services/workflow.service';
import { Workflow } from '@/entities/workflow.entity';
import { WorkflowExecution } from '@/entities/workflow-execution.entity';
import { Plugin } from '@/entities/plugin.entity';
import { ModelModule } from '@/modules/model.module';
import { WorkflowExecutionEngine } from '@/services/workflow/workflow-execution-engine';
import { WorkflowNodeExecutor } from '@/services/workflow/workflow-node-executor';
import { LLMNodeExecutor } from '@/services/workflow/nodes/llm-node-executor';
import { ConditionNodeExecutor } from '@/services/workflow/nodes/condition-node-executor';
import { HttpNodeExecutor } from '@/services/workflow/nodes/http-node-executor';
import { LoopNodeExecutor } from '@/services/workflow/nodes/loop-node-executor';
import { ParallelNodeExecutor } from '@/services/workflow/nodes/parallel-node-executor';
import { TransformNodeExecutor } from '@/services/workflow/nodes/transform-node-executor';
import { DatabaseNodeExecutor } from '@/services/workflow/nodes/database-node-executor';

@Module({
  imports: [TypeOrmModule.forFeature([Workflow, WorkflowExecution, Plugin]), ModelModule],
  controllers: [WorkflowController],
  providers: [
    WorkflowService,
    WorkflowExecutionEngine,
    WorkflowNodeExecutor,
    LLMNodeExecutor,
    ConditionNodeExecutor,
    HttpNodeExecutor,
    LoopNodeExecutor,
    ParallelNodeExecutor,
    TransformNodeExecutor,
    DatabaseNodeExecutor,
  ],
  exports: [WorkflowService],
})
export class WorkflowModule {}