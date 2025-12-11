import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Application } from './application.entity';

import {
  ApplicationListDto,
  ApplicationDto,
  ApplicationExecuteDto,
  ApplicationExecutionListDto,
} from './application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  /**
   * 获取应用列表
   */
  async findAll(dto: ApplicationListDto) {
    const { appName, appType, status, page, pageSize } = dto;

    const queryBuilder = this.applicationRepository.createQueryBuilder('Application');

    if (appName) {
      queryBuilder.andWhere('Application.appName LIKE :appName', { appName: `%${appName}%` });
    }

    if (appType) {
      queryBuilder.andWhere('Application.appType = :appType', { appType });
    }

    if (status !== undefined && status !== null) {
      queryBuilder.andWhere('Application.status = :status', { status });
    }

    queryBuilder
      .orderBy('Application.updatedAt', 'DESC')
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
   * 根据ID获取应用详情
   */
  async findOne(appId: string): Promise<Application> {
    return await this.applicationRepository.findOne({
      where: { appId },
    });
  }

  /**
   * 创建应用
   */
  async create(dto: ApplicationDto, userName: string): Promise<Application> {
    const app = new Application();
    app.appId = uuidv4();
    app.appName = dto.appName;
    app.appType = dto.appType;
    app.appTypeName = dto.appTypeName;
    app.description = dto.description || '';
    app.version = dto.version || '1.0.0';
    app.status = dto.status || 0;
    app.createdUser = userName;
    app.updatedUser = userName;
    app.createdAt = new Date();
    app.updatedAt = new Date();

    return await this.applicationRepository.save(app);
  }

  /**
   * 更新应用
   */
  async update(dto: ApplicationDto, userName: string): Promise<Application> {
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
    app.updatedUser = userName;
    app.updatedAt = new Date();

    return await this.applicationRepository.save(app);
  }

  /**
   * 删除应用
   */
  async remove(appId: string): Promise<boolean> {
    const result = await this.applicationRepository.delete({ appId });
    return result.affected > 0;
  }

  /**
   * 复制应用
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
    newApp.createdUser = userName;
    newApp.updatedUser = userName;

    return await this.applicationRepository.save(newApp);
  }

  /**
   * 发布应用
   */
  async publish(appId: string, userName: string): Promise<boolean> {
    const app = await this.findOne(appId);
    if (!app) {
      throw new Error('应用不存在');
    }

    app.status = 1; // 已发布
    app.updatedUser = userName;

    await this.applicationRepository.save(app);
    return true;
  }

  /**
   * 取消发布应用
   */
  async unpublish(appId: string, userName: string): Promise<boolean> {
    const app = await this.findOne(appId);
    if (!app) {
      throw new Error('应用不存在');
    }

    app.status = 0; // 草稿
    app.updatedUser = userName;

    await this.applicationRepository.save(app);
    return true;
  }
}
