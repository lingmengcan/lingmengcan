import { DictListDto } from './dict.dto';
import { Dict } from './dict.entity';
import { isNullOrUndefined } from '@/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(Dict)
    private repository: Repository<Dict>,
    private dataSource: DataSource,
  ) {}

  /**
   * 获取实体
   * @param id
   * @returns
   */
  findOne(id: string): Promise<Dict> {
    return this.repository.findOneBy({ dictId: id });
  }

  findByDictId(dictId: string): Promise<Dict> {
    return this.repository.findOne({
      where: { dictId, status: 0 },
    });
  }

  findByDictName(dictname: string): Promise<Dict> {
    return this.repository.findOne({
      where: { dictName: dictname, status: 0 },
    });
  }

  /**
   * 字典管理列表
   *
   * @param dictDto
   * @returns
   */
  async findAll(dictDto: DictListDto) {
    const { dictName, dictCode, dictType, status, page, pageSize } = dictDto;
    // 默认首页
    const skip = page && pageSize ? (page - 1) * pageSize : 0;

    // 默认20条数据
    const take = pageSize ? pageSize : 20;
    let qb = this.repository.createQueryBuilder('Dict').andWhere('Dict.status != -1');

    if (dictName) {
      qb = qb.andWhere('Dict.dictName like :dictName', {
        dictName: '%' + dictName + '%',
      });
    }

    if (dictCode) {
      qb = qb.andWhere('Dict.dictCode like :dictCode', {
        dictCode: '%' + dictCode + '%',
      });
    }

    if (dictType) {
      // 将单个字符串转换为数组
      const typeArray = Array.isArray(dictType) ? dictType : [dictType];

      // 仅在数组不为空时添加查询条件
      if (typeArray.length > 0) {
        qb = qb.andWhere('Dict.dictType IN (:...dictType)', {
          dictType: typeArray,
        });
      }
    }

    if (!isNullOrUndefined(status)) {
      qb = qb.andWhere('Dict.status = :status', {
        status,
      });
    }

    qb.orderBy({ 'Dict.dictType': 'ASC', 'Dict.sort': 'ASC' });

    const [list, count] = await qb.skip(skip).take(take).getManyAndCount();
    return {
      list,
      page,
      pageSize,
      count,
    };
  }

  /**
   * 字典列表
   *
   * @param dictType
   * @returns
   */
  async findListByType(dictType: string | string[]) {
    let qb = this.repository.createQueryBuilder('Dict').andWhere('Dict.status = 0');

    if (dictType) {
      // 将单个字符串转换为数组
      const modelTypeArray = Array.isArray(dictType) ? dictType : [dictType];

      // 仅在数组不为空时添加查询条件
      if (modelTypeArray.length > 0) {
        qb = qb.andWhere('Dict.dictType IN (:...value)', {
          value: modelTypeArray,
        });
      }
    }
    qb.orderBy({ 'Dict.dictType': 'ASC', 'Dict.sort': 'ASC' });

    return qb.getMany();
  }

  /**
   * 修改用户状态
   *
   * @param dict 用户信息
   * @return 结果
   */
  async updateStatus(dict: Dict) {
    const entity = await this.findOne(dict.dictId);
    entity.status = dict.status;
    entity.updatedUser = dict.updatedUser;
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  /**
   * 修改用户hhj
   *
   * @param dict 用户信息
   * @return 结果
   */
  async updateDict(dict: Dict) {
    const entity = await this.findOne(dict.dictId);
    entity.dictName = dict.dictName;
    entity.dictCode = dict.dictCode;
    entity.dictType = dict.dictType;
    entity.sort = dict.sort;
    entity.status = dict.status;
    entity.description = dict.description;
    entity.updatedUser = dict.updatedUser;
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  /**
   * 添加用户
   *
   * @param dict 用户信息
   * @return 结果
   */
  async addDict(dict: Dict) {
    const entity = new Dict();
    entity.dictName = dict.dictName;
    entity.dictCode = dict.dictCode;
    entity.dictType = dict.dictType;
    entity.sort = dict.sort;
    entity.status = dict.status;
    entity.description = dict.description ?? '';
    entity.createdUser = dict.createdUser;
    entity.updatedUser = dict.updatedUser;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    return this.repository.save(entity);
  }
}
