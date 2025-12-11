import { KnowledgeListDto } from './knowledge.dto';
import { Knowledge } from './knowledge.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(Knowledge)
    private repository: Repository<Knowledge>,
    private dataSource: DataSource,
  ) {}

  /**
   * 获取实体
   * @param id
   * @returns
   */
  findOne(id: string): Promise<Knowledge> {
    return this.repository.findOneBy({ knowledgeId: id });
  }

  /**
   * 管理列表
   *
   * @param dto
   * @returns
   */
  async findAll(dto: KnowledgeListDto) {
    const { knowledgeName, knowledgeType, page, pageSize } = dto;
    // 默认首页
    const skip = page && pageSize ? (page - 1) * pageSize : 0;

    // 默认20条数据
    const take = pageSize ? pageSize : 20;
    let qb = this.repository.createQueryBuilder('Knowledge').andWhere('Knowledge.status != -1');

    if (knowledgeName) {
      qb = qb.andWhere('Knowledge.knowledgeName like :knowledgeName', {
        knowledgeName: '%' + knowledgeName + '%',
      });
    }

    if (knowledgeType) {
      // 将单个字符串转换为数组
      const knowledgeTypeArray = Array.isArray(knowledgeType) ? knowledgeType : [knowledgeType];

      // 仅在数组不为空时添加查询条件
      if (knowledgeTypeArray.length > 0) {
        qb = qb.andWhere('Knowledge.knowledgeType IN (:...knowledgeType)', {
          knowledgeType: knowledgeTypeArray,
        });
      }
    }

    qb.orderBy({ 'Knowledge.updatedAt': 'DESC' });

    const [list, count] = await qb.skip(skip).take(take).getManyAndCount();
    return {
      list,
      page,
      pageSize,
      count,
    };
  }

  /**
   * 修改
   *
   * @param model 信息
   * @return 结果
   */
  async updateKnowledge(model: Knowledge) {
    const entity = await this.findOne(model.knowledgeId);
    entity.knowledgeName = model.knowledgeName;
    entity.knowledgeType = model.knowledgeType;
    entity.knowledgeTypeName = model.knowledgeTypeName;
    entity.llm = model.llm;
    entity.embeddingModel = model.embeddingModel;
    entity.params = model.params;
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
  async addKnowledge(model: Knowledge) {
    const knowledgeId = uuidv4();

    const entity = new Knowledge();
    entity.knowledgeId = knowledgeId;
    entity.knowledgeName = model.knowledgeName;
    entity.knowledgeType = model.knowledgeType;
    entity.knowledgeTypeName = model.knowledgeTypeName;
    entity.llm = model.llm;
    entity.embeddingModel = model.embeddingModel;
    entity.params = model.params;
    entity.status = model.status;
    entity.description = model.description ?? '';
    entity.createdUser = model.createdUser;
    entity.updatedUser = model.updatedUser;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    return this.repository.save(entity);
  }
}
