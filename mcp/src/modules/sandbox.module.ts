import { Module } from '@nestjs/common';
import { SandboxController } from 'src/controllers/sandbox.controller';
import { SandboxService } from 'src/services/sandbox.service';
import { TaskQueueModule } from './task-queue.module';
import { DockerModule } from './docker.module';

@Module({
  imports: [TaskQueueModule, DockerModule],
  controllers: [SandboxController],
  providers: [SandboxService],
  exports: [SandboxService],
})
export class SandboxModule {}
