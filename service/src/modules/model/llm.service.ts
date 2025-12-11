import { LlmListDto } from '@/modules/model/model.dto';
import { Llm } from './llm.entity';
import { isNullOrUndefined } from '@/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LlmService {
  constructor(
    @InjectRepository(Llm)
    private repository: Repository<Llm>,
    private dataSource: DataSource,
  ) {}

  /**
   * 获取实体
   * @param id
   * @returns
   */
  findOne(id: string): Promise<Llm> {
    return this.repository.findOneBy({ modelId: id });
  }

  findByModelId(modelId: string): Promise<Llm> {
    return this.repository.findOne({
      where: { modelId, status: 0 },
    });
  }

  /**
   * 获取实体
   * @param modelName
   * @returns
   */
  findByModelName(modelName: string): Promise<Llm> {
    return this.repository.findOne({
      where: { modelName: modelName, status: 0 },
    });
  }

  /**
   * 管理列表
   *
   * @param dto
   * @returns
   */
  async findAll(dto: LlmListDto) {
    const { modelName, modelType, status, page, pageSize } = dto;
    // 默认首页
    const skip = page && pageSize ? (page - 1) * pageSize : 0;

    // 默认20条数据
    const take = pageSize ? pageSize : 20;
    let qb = this.repository.createQueryBuilder('Llm').andWhere('Llm.status != -1');

    if (modelName) {
      qb = qb.andWhere('Llm.modelName like :modelName', {
        modelName: '%' + modelName + '%',
      });
    }

    if (modelType) {
      // 将单个字符串转换为数组
      const modelTypeArray = Array.isArray(modelType) ? modelType : [modelType];

      // 仅在数组不为空时添加查询条件
      if (modelTypeArray.length > 0) {
        qb = qb.andWhere('Llm.modelType IN (:...modelType)', {
          modelType: modelTypeArray,
        });
      }
    }

    if (!isNullOrUndefined(status)) {
      qb = qb.andWhere('Llm.status = :status', {
        status,
      });
    }

    qb.orderBy({ 'Llm.modelType': 'DESC', 'Llm.modelName': 'ASC' });

    const [list, count] = await qb.skip(skip).take(take).getManyAndCount();
    return {
      list,
      page,
      pageSize,
      count,
    };
  }

  /**
   * 列表
   *
   * @param modelType
   * @returns
   */
  async findListByType(modelType: string) {
    let qb = this.repository.createQueryBuilder('Llm').andWhere('Llm.status = 0');

    if (modelType) {
      qb = qb.andWhere('Llm.modelType = :modelType', {
        modelType,
      });
    }

    qb.orderBy({ 'Llm.modelName': 'ASC' });

    return qb.getMany();
  }

  /**
   * 修改状态
   *
   * @param model 信息
   * @return 结果
   */
  async updateStatus(model: Llm) {
    const entity = await this.findOne(model.modelId);
    entity.status = model.status;
    entity.updatedUser = model.updatedUser;
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  /**
   * 修改
   *
   * @param model 用户信息
   * @return 结果
   */
  async updateModel(model: Llm) {
    const entity = await this.findOne(model.modelId);
    entity.modelName = model.modelName;
    entity.modelTypeName = model.modelTypeName;
    entity.modelType = model.modelType;
    entity.baseUrl = model.baseUrl;
    entity.apiKey = model.apiKey;
    entity.apiType = model.apiType;
    entity.defaultEmbeddingModel = model.defaultEmbeddingModel;
    entity.status = model.status;
    entity.description = model.description;
    entity.updatedUser = model.updatedUser;
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  /**
   * 添加模型
   *
   * @param model 信息
   * @return 结果
   */
  async addModel(model: Llm) {
    const modelId = uuidv4();

    const entity = new Llm();
    entity.modelId = modelId;
    entity.modelName = model.modelName;
    entity.modelTypeName = model.modelTypeName;
    entity.modelType = model.modelType;
    entity.baseUrl = model.baseUrl;
    entity.apiKey = model.apiKey;
    entity.apiType = model.apiType;
    entity.defaultEmbeddingModel = model.defaultEmbeddingModel;
    entity.status = model.status;
    entity.description = model.description ?? '';
    entity.createdUser = model.createdUser;
    entity.updatedUser = model.updatedUser;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    return this.repository.save(entity);
  }
}
