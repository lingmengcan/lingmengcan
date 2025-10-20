import { PromptController } from './prompt.controller';
import { Prompt } from './prompt.entity';
import { PromptService } from './prompt.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Prompt])],
  controllers: [PromptController],
  providers: [PromptService],
  exports: [PromptService],
})
export class PromptModule {}
