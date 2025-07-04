import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskQueueService {
  constructor(@InjectQueue('build-queue') private readonly buildQueue: Queue) {}

  async addBuildTask(taskData: {
    code: string;
    sandboxType: string;
  }): Promise<string> {
    const job = await this.buildQueue.add('build-sandbox', taskData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    return job.id as string;
  }
}
