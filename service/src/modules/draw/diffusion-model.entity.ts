import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('diffusion_model')
export class DiffusionModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'model_id', unsigned: true })
  modelId: string;

  @Column({ type: 'bigint', name: 'base_model_id' })
  baseModelId: string;

  @Column('varchar', { name: 'model_name', length: 255 })
  modelName: string;

  @Column('varchar', { name: 'model_code', length: 128 })
  modelCode: string;

  @Column('varchar', { name: 'model_type', length: 32 })
  modelType: string;

  @Column('varchar', { name: 'model_type_name', length: 32 })
  modelTypeName: string;

  @Column('varchar', { name: 'model_cover', length: 255 })
  modelCover: string;

  @Column({ type: 'json', name: 'tags' })
  tags: string;

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
