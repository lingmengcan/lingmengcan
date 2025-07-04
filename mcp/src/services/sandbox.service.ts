import { Injectable } from '@nestjs/common';
import { DockerService } from './docker.service';
import { TaskQueueService } from './task-queue.service';

@Injectable()
export class SandboxService {
  constructor(
    private readonly dockerService: DockerService,
    private readonly taskQueue: TaskQueueService,
  ) {}

  /**
   * 创建沙箱服务（异步方式）
   * @param userCode 用户提交的代码
   * @param sandboxType 沙箱类型（预设模板）
   * @returns 容器ID的 Promise
   */
  async createSandbox(
    userCode: string,
    sandboxType = 'node-express',
  ): Promise<string> {
    // 使用代码模板（根据sandboxType选择）
    const templatedCode = this.applyTemplate(userCode, sandboxType);

    // 添加构建任务到队列
    return await this.taskQueue.addBuildTask({
      code: templatedCode,
      sandboxType,
    });
  }

  /**
   * 同步创建沙箱（直接构建）
   */
  async createSandboxSync(code: string): Promise<string> {
    console.log('Creating sandbox with code:', code);
    return this.dockerService.createSandboxService(code);
  }

  /**
   * 删除沙箱
   * @param containerId 容器ID
   */
  async deleteSandbox(containerId: string): Promise<void> {
    await this.dockerService.deleteSandboxService(containerId);
  }

  /**
   * 应用预设代码模板
   */
  private applyTemplate(userCode: string, templateName: string): string {
    const templates = {
      'node-express': `
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// 用户代码注入点
${userCode}

app.listen(PORT, () => {
  console.log(\`Sandbox service running on port \${PORT}\`);
});`,

      'node-fastify': `
const fastify = require('fastify')({
  logger: true
});

// 用户代码注入点
${userCode}

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
start();`,
    };

    // 确保返回的模板是字符串类型
    const selectedTemplate =
      templates[templateName as keyof typeof templates] ??
      templates['node-express'];
    if (typeof selectedTemplate !== 'string') {
      throw new Error(`无效的模板类型: ${templateName}`);
    }
    return selectedTemplate;
  }

  /**
   * 获取沙箱状态
   */
  async getSandboxStatus(containerId: string) {
    return this.dockerService.getSandboxStats(containerId);
  }

  /**
   * 列出所有沙箱
   */
  async listSandboxes() {
    return this.dockerService.listActiveSandboxes();
  }
}
