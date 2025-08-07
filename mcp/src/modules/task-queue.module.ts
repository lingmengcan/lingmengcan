import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BuildTaskProcessor } from 'src/processors/build-task.processor';
import { TaskQueueService } from 'src/services/task-queue.service';
import { DockerModule } from './docker.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'build-queue',
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    DockerModule,
  ],
  providers: [TaskQueueService, BuildTaskProcessor],
  exports: [TaskQueueService],
})
export class TaskQueueModule {}
