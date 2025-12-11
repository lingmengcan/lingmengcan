import { Dict } from './dict.entity';
import { DictService } from './dict.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuModule } from '../menu/menu.module';
import { DictController } from './dict.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dict]), MenuModule],
  controllers: [DictController],
  providers: [DictService],
  exports: [DictService],
})
export class DictModule {}
