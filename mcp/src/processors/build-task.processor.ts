import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DockerService } from 'src/services/docker.service';

@Processor('build-queue')
export class BuildTaskProcessor extends WorkerHost {
  constructor(private dockerService: DockerService) {
    super();
  }

  async process(job: Job<{ code: string }>): Promise<string> {
    return this.dockerService.createSandboxService(job.data.code);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Sandbox created: ${job.returnvalue}`);
  }
}
