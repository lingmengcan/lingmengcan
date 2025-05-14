import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { KnowledgeFile } from './knowledge-file.entity';

@Entity({ name: 'knowledge' })
export class Knowledge {
  @PrimaryColumn({ type: 'varchar', name: 'knowledge_id', length: 36 })
  knowledgeId: string;

  @Column({ type: 'varchar', name: 'knowledge_name', length: 128 })
  knowledgeName: string;

  @Column({ type: 'varchar', name: 'knowledge_type', length: 32 })
  knowledgeType: string;

  @Column({ type: 'varchar', name: 'knowledge_type_name', length: 32 })
  knowledgeTypeName: string;

  @Column({ type: 'varchar', name: 'llm', length: 128 })
  llm: string;

  @Column({ type: 'varchar', name: 'embedding_model', length: 128 })
  embeddingModel: string;

  @Column({ type: 'json', name: 'params' })
  params: string;

  @Column({ type: 'tinyint', name: 'status', width: 1 })
  status: number;

  @Column({ type: 'varchar', name: 'description', length: 512 })
  description: string;

  @Column({ type: 'varchar', name: 'created_user', length: 32 })
  createdUser: string;

  @Column({ type: 'varchar', name: 'updated_user', length: 32 })
  updatedUser: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => KnowledgeFile, (knowledgeFile) => knowledgeFile.knowledge)
  knowledgeFiles: KnowledgeFile[];
}
