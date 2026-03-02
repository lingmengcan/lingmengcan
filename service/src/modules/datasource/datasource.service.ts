import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Datasource } from './datasource.entity';
import { DatasourceListDto, TestConnectionDto } from './datasource.dto';
import { isNullOrUndefined } from '@/utils';

@Injectable()
export class DatasourceService implements OnModuleDestroy {
  private readonly logger = new Logger(DatasourceService.name);

  // 外部数据源连接池缓存
  private connectionPool: Map<string, DataSource> = new Map();

  constructor(
    @InjectRepository(Datasource)
    private repository: Repository<Datasource>,
    private dataSource: DataSource,
  ) {}

  /**
   * 模块销毁时清理所有外部连接
   */
  async onModuleDestroy() {
    for (const [id, ds] of this.connectionPool) {
      try {
        if (ds.isInitialized) {
          await ds.destroy();
        }
        this.logger.log(`已销毁数据源连接: ${id}`);
      } catch (error) {
        this.logger.warn(`销毁数据源连接失败: ${id} - ${error.message}`);
      }
    }
    this.connectionPool.clear();
  }

  /**
   * 分页列表
   */
  async findAll(dto: DatasourceListDto) {
    const { name, type, status, page, pageSize } = dto;
    const skip = page && pageSize ? (page - 1) * pageSize : 0;
    const take = pageSize ? pageSize : 20;

    let qb = this.repository
      .createQueryBuilder('ds')
      .andWhere('ds.status != -1');

    if (name) {
      qb = qb.andWhere('ds.name like :name', { name: `%${name}%` });
    }

    if (type) {
      qb = qb.andWhere('ds.type = :type', { type });
    }

    if (!isNullOrUndefined(status)) {
      qb = qb.andWhere('ds.status = :status', { status });
    }

    qb.orderBy({ 'ds.createdAt': 'DESC' });

    const [list, count] = await qb.skip(skip).take(take).getManyAndCount();

    // 脱敏密码
    const safeList = list.map((item) => ({
      ...item,
      password: item.password ? '******' : '',
    }));

    return { list: safeList, page, pageSize, count };
  }

  /**
   * 获取所有启用的数据源（供下拉选择）
   */
  async findActiveList() {
    return this.repository.find({
      where: { status: 0 },
      select: ['datasourceId', 'name', 'type', 'host', 'port', 'databaseName'],
      order: { name: 'ASC' },
    });
  }

  /**
   * 获取详情
   */
  async findById(id: string) {
    return this.repository.findOneBy({ datasourceId: id });
  }

  /**
   * 新增
   */
  async add(entity: Datasource) {
    const datasourceId = uuidv4();

    const ds = new Datasource();
    ds.datasourceId = datasourceId;
    ds.name = entity.name;
    ds.type = entity.type;
    ds.host = entity.host;
    ds.port = entity.port;
    ds.databaseName = entity.databaseName;
    ds.username = entity.username;
    ds.password = entity.password;
    ds.charset = entity.charset || 'utf8mb4';
    ds.extraOptions = entity.extraOptions;
    ds.status = entity.status ?? 0;
    ds.description = entity.description ?? '';
    ds.createdUser = entity.createdUser;
    ds.updatedUser = entity.updatedUser;
    ds.createdAt = new Date();
    ds.updatedAt = new Date();

    return this.repository.save(ds);
  }

  /**
   * 修改
   */
  async update(entity: Datasource) {
    const existing = await this.findById(entity.datasourceId);
    if (!existing) {
      throw new Error('数据源不存在');
    }

    existing.name = entity.name;
    existing.type = entity.type;
    existing.host = entity.host;
    existing.port = entity.port;
    existing.databaseName = entity.databaseName;
    existing.username = entity.username;
    // 密码为脱敏值时不更新
    if (entity.password && entity.password !== '******') {
      existing.password = entity.password;
    }
    existing.charset = entity.charset || 'utf8mb4';
    existing.extraOptions = entity.extraOptions;
    existing.status = entity.status;
    existing.description = entity.description ?? '';
    existing.updatedUser = entity.updatedUser;
    existing.updatedAt = new Date();

    // 连接配置变更，销毁旧连接
    await this.destroyConnection(entity.datasourceId);

    return this.repository.save(existing);
  }

  /**
   * 修改状态
   */
  async updateStatus(entity: Datasource) {
    const existing = await this.findById(entity.datasourceId);
    if (!existing) {
      throw new Error('数据源不存在');
    }
    existing.status = entity.status;
    existing.updatedUser = entity.updatedUser;
    existing.updatedAt = new Date();

    // 禁用或删除时销毁连接
    if (entity.status !== 0) {
      await this.destroyConnection(entity.datasourceId);
    }

    return this.repository.save(existing);
  }

  /**
   * 测试连接
   */
  async testConnection(dto: TestConnectionDto): Promise<boolean> {
    let testDs: DataSource | null = null;
    try {
      testDs = new DataSource({
        type: this.getDbType(dto.type),
        host: dto.host,
        port: dto.port,
        username: dto.username,
        password: dto.password,
        database: dto.databaseName,
        charset: dto.charset || 'utf8mb4',
        connectTimeout: 5000,
      } as any);

      await testDs.initialize();
      await testDs.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.warn(`测试连接失败: ${error.message}`);
      throw new Error(`连接失败: ${error.message}`);
    } finally {
      if (testDs?.isInitialized) {
        await testDs.destroy();
      }
    }
  }

  /**
   * 获取数据源连接（带缓存）
   * datasourceId 为 'default' 时返回项目自身数据库连接
   */
  async getConnection(datasourceId: string): Promise<DataSource> {
    if (datasourceId === 'default') {
      return this.dataSource;
    }

    // 检查缓存
    const cached = this.connectionPool.get(datasourceId);
    if (cached?.isInitialized) {
      return cached;
    }

    // 从数据库读取配置
    const config = await this.findById(datasourceId);
    if (!config) {
      throw new Error(`数据源不存在: ${datasourceId}`);
    }
    if (config.status !== 0) {
      throw new Error(`数据源已禁用: ${config.name}`);
    }

    // 创建新连接
    const ds = new DataSource({
      type: this.getDbType(config.type),
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.databaseName,
      charset: config.charset || 'utf8mb4',
      connectTimeout: 10000,
    } as any);

    await ds.initialize();
    this.connectionPool.set(datasourceId, ds);
    this.logger.log(`已创建数据源连接: ${config.name} (${datasourceId})`);

    return ds;
  }

  /**
   * 销毁指定连接
   */
  async destroyConnection(datasourceId: string) {
    const cached = this.connectionPool.get(datasourceId);
    if (cached) {
      try {
        if (cached.isInitialized) {
          await cached.destroy();
        }
      } catch (error) {
        this.logger.warn(`销毁连接失败: ${error.message}`);
      }
      this.connectionPool.delete(datasourceId);
    }
  }

  /**
   * 获取数据库类型
   */
  private getDbType(type: string): any {
    switch (type) {
      case 'mysql':
        return 'mysql';
      case 'postgresql':
        return 'postgres';
      case 'sqlite':
        return 'sqlite';
      default:
        return 'mysql';
    }
  }
}
