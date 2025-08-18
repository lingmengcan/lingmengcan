import { ApplicationController } from '@/controllers/application.controller';
import { Application } from '@/entities/application.entity';
import { WorkflowExecution } from '@/entities/workflow-execution.entity';
import { ApplicationService } from '@/services/application.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Application, WorkflowExecution])],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}