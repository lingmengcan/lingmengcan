import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('llm')
export class Llm {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'model_id', unsigned: true })
  modelId: string;

  @Column('varchar', { name: 'model_name', length: 128 })
  modelName: string;

  @Column('varchar', { name: 'model_type', length: 32 })
  modelType: string;

  @Column('varchar', { name: 'model_type_name', length: 32 })
  modelTypeName: string;

  @Column('varchar', { name: 'base_url', length: 512 })
  baseUrl: string;

  @Column('varchar', { name: 'api_key', length: 128 })
  apiKey: string;

  @Column('varchar', { name: 'api_type', length: 32 })
  apiType: string;

  @Column('varchar', { name: 'default_embedding_model', length: 128 })
  defaultEmbeddingModel: string;

  @Column('tinyint', {
    name: 'status',
    comment: '-1 deleted, 0 normal, 1 deactivated',
  })
  @IsNotEmpty()
  status: number;

  @Column('varchar', { name: 'description', length: 512 })
  description: string;

  @Column('varchar', { name: 'created_user', length: 32 })
  createdUser: string;

  @Column('varchar', { name: 'updated_user', length: 32 })
  updatedUser: string;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('datetime', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
