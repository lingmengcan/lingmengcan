import { Llm } from './llm.entity';
import { LlmService } from './llm.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelController } from './model.controller';
import { DrawModule } from '@/modules/draw/draw.module';

@Module({
  imports: [TypeOrmModule.forFeature([Llm]), DrawModule],
  controllers: [ModelController],
  providers: [LlmService],
  exports: [LlmService],
})
export class ModelModule {}
