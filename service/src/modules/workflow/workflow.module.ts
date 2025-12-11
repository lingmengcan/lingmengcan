import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { Workflow } from './workflow.entity';
import { WorkflowExecution } from './workflow-execution.entity';
import { Plugin } from '@/modules/plugin/plugin.entity';
import { ModelModule } from '@/modules/model/model.module';
import { WorkflowExecutionEngine } from './engine/workflow-execution-engine';
import { WorkflowNodeExecutor } from './engine/workflow-node-executor';
import { LLMNodeExecutor } from './engine/nodes/llm-node-executor';
import { ConditionNodeExecutor } from './engine/nodes/condition-node-executor';
import { HttpNodeExecutor } from './engine/nodes/http-node-executor';
import { LoopNodeExecutor } from './engine/nodes/loop-node-executor';
import { ParallelNodeExecutor } from './engine/nodes/parallel-node-executor';
import { TransformNodeExecutor } from './engine/nodes/transform-node-executor';
import { DatabaseNodeExecutor } from './engine/nodes/database-node-executor';

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