import { ApplicationController } from '@/controllers/application.controller';
import { Knowledge } from '@/entities/knowledge.entity';
import { KnowledgeService } from '@/services/knowledge.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Knowledge])],
  controllers: [ApplicationController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class ApplicationModule {}
