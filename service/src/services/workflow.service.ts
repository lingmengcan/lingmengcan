import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Application } from '@/entities/application.entity';
import { WorkflowExecution } from '@/entities/workflow-execution.entity';
import { WorkflowAppListDto, WorkflowAppDto, WorkflowExecuteDto, WorkflowExecutionListDto } from '@/dtos/workflow.dto';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Application)
    private readonly workflowAppRepository: Repository<Application>,
    @InjectRepository(WorkflowExecution)
    private readonly workflowExecutionRepository: Repository<WorkflowExecution>,
  ) {}

  /**
   * 获取工作流应用列表
   */
  async findAll(dto: WorkflowAppListDto) {
    const { appName, appType, status, page, pageSize } = dto;
    
    const queryBuilder = this.workflowAppRepository.createQueryBuilder('app');
    
    if (appName) {
      queryBuilder.andWhere('app.appName LIKE :appName', { appName: `%${appName}%` });
    }
    
    if (appType) {
      queryBuilder.andWhere('app.appType = :appType', { appType });
    }
    
    if (status !== undefined && status !== null) {
      queryBuilder.andWhere('app.status = :status', { status });
    }
    
    queryBuilder
      .orderBy('app.updatedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);
    
    const [list, count] = await queryBuilder.getManyAndCount();
    
    return {
      list,
      count,
      page,
      pageSize,
    };
  }

  /**
   * 根据ID获取工作流应用详情
   */
  async findOne(appId: string): Promise<Application> {
    return await this.workflowAppRepository.findOne({
      where: { appId },
    });
  }

  /**
   * 创建工作流应用
   */
  async create(dto: WorkflowAppDto, userName: string): Promise<Application> {
    const app = new Application();
    app.appId = uuidv4();
    app.appName = dto.appName;
    app.appType = dto.appType;
    app.appTypeName = dto.appTypeName;
    app.description = dto.description || '';
    app.version = dto.version || '1.0.0';
    app.status = dto.status || 0;
    app.workflowConfig = dto.workflowConfig || { nodes: [], edges: [], variables: [] };
    app.createdUser = userName;
    app.updatedUser = userName;

    return await this.workflowAppRepository.save(app);
  }

  /**
   * 更新工作流应用
   */
  async update(dto: WorkflowAppDto, userName: string): Promise<Application> {
    const app = await this.findOne(dto.appId);
    if (!app) {
      throw new Error('应用不存在');
    }

    app.appName = dto.appName;
    app.appType = dto.appType;
    app.appTypeName = dto.appTypeName;
    app.description = dto.description || app.description;
    app.version = dto.version || app.version;
    app.status = dto.status !== undefined ? dto.status : app.status;
    app.workflowConfig = dto.workflowConfig || app.workflowConfig;
    app.updatedUser = userName;

    return await this.workflowAppRepository.save(app);
  }

  /**
   * 删除工作流应用
   */
  async remove(appId: string): Promise<boolean> {
    const result = await this.workflowAppRepository.delete({ appId });
    return result.affected > 0;
  }

  /**
   * 复制工作流应用
   */
  async copy(appId: string, newName: string, userName: string): Promise<Application> {
    const originalApp = await this.findOne(appId);
    if (!originalApp) {
      throw new Error('原应用不存在');
    }

    const newApp = new Application();
    newApp.appId = uuidv4();
    newApp.appName = newName;
    newApp.appType = originalApp.appType;
    newApp.appTypeName = originalApp.appTypeName;
    newApp.description = originalApp.description;
    newApp.version = originalApp.version;
    newApp.status = 0; // 复制的应用默认为草稿状态
    newApp.workflowConfig = originalApp.workflowConfig;
    newApp.createdUser = userName;
    newApp.updatedUser = userName;

    return await this.workflowAppRepository.save(newApp);
  }

  /**
   * 发布工作流应用
   */
  async publish(appId: string, userName: string): Promise<boolean> {
    const app = await this.findOne(appId);
    if (!app) {
      throw new Error('应用不存在');
    }

    app.status = 1; // 已发布
    app.updatedUser = userName;
    
    await this.workflowAppRepository.save(app);
    return true;
  }

  /**
   * 取消发布工作流应用
   */
  async unpublish(appId: string, userName: string): Promise<boolean> {
    const app = await this.findOne(appId);
    if (!app) {
      throw new Error('应用不存在');
    }

    app.status = 0; // 草稿
    app.updatedUser = userName;
    
    await this.workflowAppRepository.save(app);
    return true;
  }

  /**
   * 执行工作流
   */
  async execute(dto: WorkflowExecuteDto, userName: string): Promise<WorkflowExecution> {
    const app = await this.findOne(dto.appId);
    if (!app) {
      throw new Error('应用不存在');
    }

    if (app.status !== 1) {
      throw new Error('应用未发布，无法执行');
    }

    const execution = new WorkflowExecution();
    execution.executionId = uuidv4();
    execution.appId = dto.appId;
    execution.inputs = dto.inputs;
    execution.status = 0; // 运行中
    execution.startTime = new Date();
    execution.createdUser = userName;

    // 这里应该实现实际的工作流执行逻辑
    // 暂时模拟执行成功
    setTimeout(async () => {
      execution.status = 1; // 成功
      execution.endTime = new Date();
      execution.duration = Math.floor((execution.endTime.getTime() - execution.startTime.getTime()) / 1000);
      execution.outputs = { result: '执行成功' };
      await this.workflowExecutionRepository.save(execution);
    }, 2000);

    return await this.workflowExecutionRepository.save(execution);
  }

  /**
   * 获取工作流执行历史
   */
  async getExecutions(dto: WorkflowExecutionListDto) {
    const { appId, page, pageSize } = dto;
    
    const [list, count] = await this.workflowExecutionRepository.findAndCount({
      where: { appId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    return {
      list,
      count,
      page,
      pageSize,
    };
  }

  /**
   * 停止工作流执行
   */
  async stopExecution(executionId: string): Promise<boolean> {
    const execution = await this.workflowExecutionRepository.findOne({
      where: { executionId },
    });
    
    if (!execution) {
      throw new Error('执行记录不存在');
    }

    if (execution.status !== 0) {
      throw new Error('执行已结束，无法停止');
    }

    execution.status = 3; // 已停止
    execution.endTime = new Date();
    execution.duration = Math.floor((execution.endTime.getTime() - execution.startTime.getTime()) / 1000);
    
    await this.workflowExecutionRepository.save(execution);
    return true;
  }
}