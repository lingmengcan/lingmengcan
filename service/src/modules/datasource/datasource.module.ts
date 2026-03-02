import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Datasource } from './datasource.entity';
import { DatasourceService } from './datasource.service';
import { DatasourceController } from './datasource.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Datasource])],
  controllers: [DatasourceController],
  providers: [DatasourceService],
  exports: [DatasourceService],
})
export class DatasourceModule {}
