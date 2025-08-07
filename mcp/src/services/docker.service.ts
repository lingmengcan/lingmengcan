import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import * as path from 'path';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DockerService {
  private readonly docker: Docker;
  private readonly tempDir = '/tmp/sandboxes';

  constructor(private configService: ConfigService) {
    this.docker = new Docker({
      socketPath: '/var/run/docker.sock', // 或者根据你的配置修改
    });

    fs.ensureDirSync(this.tempDir);
  }

  async createSandboxService(userCode: string): Promise<string> {
    const sandboxId = uuidv4();
    const sandboxPath = path.join(this.tempDir, sandboxId);

    // 1. 创建沙箱目录结构
    fs.ensureDirSync(sandboxPath);
    fs.writeFileSync(path.join(sandboxPath, 'app.js'), userCode);

    // 2. 生成 Dockerfile
    this.generateDockerfile(sandboxPath);

    // 3. 构建镜像
    const imageTag = `sandbox-${sandboxId}`;
    await this.buildImage(sandboxPath, imageTag);

    // 4. 运行容器
    const container = await this.docker.createContainer({
      Image: imageTag,
      name: `sandbox-${sandboxId}`,
      HostConfig: {
        //Memory: 512m, //this.configService.get<number>('SANDBOX_MEMORY_LIMIT'),
        NetworkMode: 'none', // 禁用网络
        AutoRemove: true, // 容器退出时自动删除
      },
    });

    await container.start();
    return container.id;
  }

  private async buildImage(context: string, tag: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.docker.buildImage(
        { context, src: ['Dockerfile', 'app.js'] },
        { t: tag },
        (err, stream) => {
          // 确保所有错误路径都返回Error对象
          if (err) {
            const errorObj =
              err instanceof Error ? err : new Error(String(err));
            return reject(errorObj);
          }

          // 检查stream是否存在
          if (!stream) {
            return reject(new Error('Docker构建流未定义'));
          }

          // 捕获构建日志（可选）
          stream.pipe(process.stdout, { end: true });

          stream.on('end', () => resolve());
          stream.on('error', reject);
        },
      );
    });
  }

  private generateDockerfile(dir: string): void {
    const dockerfileContent = `
                    # 基础沙箱镜像（需提前构建好）
                    FROM node:18-alpine

                    # 创建工作目录
                    WORKDIR /app

                    # 添加用户代码
                    COPY app.js /app/

                    # 使用非特权用户
                    USER node

                    # 启动服务
                    CMD ["node", "app.js"]
                    `;
    fs.writeFileSync(path.join(dir, 'Dockerfile'), dockerfileContent.trim());
  }

  // 列出所有活动的沙箱容器
  async listActiveSandboxes() {
    const containers = await this.docker.listContainers({
      all: false, // 仅运行中的
      filters: {
        name: ['sandbox-'],
      },
    });

    return containers.map((c) => ({
      id: c.Id,
      name: c.Names[0],
      image: c.Image,
      status: c.Status,
      created: new Date(c.Created * 1000),
    }));
  }

  // 获取沙箱状态
  async getSandboxStats(containerId: string) {
    const container = this.docker.getContainer(containerId);

    // 获取基本信息
    const info = await container.inspect();

    // 获取资源使用
    const stats = await container.stats({ stream: false });

    return {
      state: info.State.Status,
      network: info.NetworkSettings,
      memoryUsage: stats.memory_stats.usage,
      cpuUsage: stats.cpu_stats.cpu_usage.total_usage,
    };
  }

  async deleteSandboxService(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    await container.stop();
    await container.remove();

    // 清理临时文件
    const sandboxId = containerId.split('-')[1];
    fs.removeSync(path.join(this.tempDir, sandboxId));
  }
}
