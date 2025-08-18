import { KnowledgeController } from '@/controllers/knowledge.controller';
import { Knowledge } from '@/entities/knowledge.entity';
import { KnowledgeService } from '@/services/knowledge.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Knowledge])],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}