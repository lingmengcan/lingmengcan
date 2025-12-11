import { DiffusionModelListDto } from '@/modules/model/model.dto';
import { DiffusionModel } from './diffusion-model.entity';
import { isNullOrUndefined } from '@/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DiffusionModelService {
  constructor(
    @InjectRepository(DiffusionModel)
    private repository: Repository<DiffusionModel>,
    private dataSource: DataSource,
  ) {}

  /**
   * 获取实体
   * @param id
   * @returns
   */
  findOne(id: string): Promise<DiffusionModel> {
    return this.repository.findOneBy({ modelId: id });
  }

  findByModelId(modelId: string): Promise<DiffusionModel> {
    return this.repository.findOne({
      where: { modelId, status: 0 },
    });
  }

  /**
   * 获取实体
   * @param modelName
   * @returns
   */
  findByModelName(modelName: string): Promise<DiffusionModel> {
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
  async findAll(dto: DiffusionModelListDto) {
    const { modelName, modelType, status, page, pageSize } = dto;
    // 默认首页
    const skip = page && pageSize ? (page - 1) * pageSize : 0;

    // 默认20条数据
    const take = pageSize ? pageSize : 20;
    let qb = this.repository.createQueryBuilder('DiffusionModel').andWhere('DiffusionModel.status != -1');

    if (modelName) {
      qb = qb.andWhere('DiffusionModel.modelName like :modelName', {
        modelName: '%' + modelName + '%',
      });
    }

    if (modelType) {
      // 将单个字符串转换为数组
      const modelTypeArray = Array.isArray(modelType) ? modelType : [modelType];

      // 仅在数组不为空时添加查询条件
      if (modelTypeArray.length > 0) {
        qb = qb.andWhere('DiffusionModel.modelType IN (:...modelType)', {
          modelType: modelTypeArray,
        });
      }
    }

    if (!isNullOrUndefined(status)) {
      qb = qb.andWhere('DiffusionModel.status = :status', {
        status,
      });
    }

    qb.orderBy({ 'DiffusionModel.modelType': 'DESC', 'DiffusionModel.modelName': 'ASC' });

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
    let qb = this.repository.createQueryBuilder('DiffusionModel').andWhere('DiffusionModel.status = 0');

    if (modelType) {
      qb = qb.andWhere('DiffusionModel.modelType = :modelType', {
        modelType,
      });
    }

    qb.orderBy({ 'DiffusionModel.modelName': 'ASC' });

    return qb.getMany();
  }

  /**
   * 修改状态
   *
   * @param model 信息
   * @return 结果
   */
  async updateStatus(model: DiffusionModel) {
    const entity = await this.findOne(model.modelId);
    entity.status = model.status;
    entity.updatedUser = model.updatedUser;
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  /**
   * 修改用户
   *
   * @param model 用户信息
   * @return 结果
   */
  async updateModel(model: DiffusionModel) {
    const entity = await this.findOne(model.modelId);
    entity.baseModelId = model.baseModelId;
    entity.modelName = model.modelName;
    entity.modelCode = model.modelCode;
    entity.modelTypeName = model.modelTypeName;
    entity.modelType = model.modelType;
    entity.modelCover = model.modelCover;
    entity.tags = model.tags;
    entity.status = model.status;
    entity.description = model.description;
    entity.updatedUser = model.updatedUser;
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  /**
   * 添加用户
   *
   * @param model 信息
   * @return 结果
   */
  async addModel(model: DiffusionModel) {
    const modelId = uuidv4();

    const entity = new DiffusionModel();
    entity.modelId = modelId;
    entity.baseModelId = model.baseModelId;
    entity.modelName = model.modelName;
    entity.modelCode = model.modelCode;
    entity.modelTypeName = model.modelTypeName;
    entity.modelType = model.modelType;
    entity.modelCover = model.modelCover;
    entity.tags = model.tags;
    entity.status = model.status;
    entity.description = model.description;
    entity.createdUser = model.createdUser;
    entity.updatedUser = model.updatedUser;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    return this.repository.save(entity);
  }
}
