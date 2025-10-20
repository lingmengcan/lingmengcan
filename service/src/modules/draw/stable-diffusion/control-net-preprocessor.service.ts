import { ControlNetPreprocessor } from './control-net-preprocessor.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ControlNetPreprocessorService {
  constructor(
    @InjectRepository(ControlNetPreprocessor)
    private repository: Repository<ControlNetPreprocessor>,
    private dataSource: DataSource,
  ) {}

  /**
   * 列表
   *
   * @returns
   */
  async findPreprocessorList() {
    const qb = this.repository
      .createQueryBuilder('ControlNetPreprocessor')
      .andWhere('ControlNetPreprocessor.status = 0');

    qb.orderBy({ 'ControlNetPreprocessor.sort': 'ASC' });

    return qb.getMany();
  }
}
