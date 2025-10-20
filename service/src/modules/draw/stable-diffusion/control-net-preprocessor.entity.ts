import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('control_net_preprocessor')
export class ControlNetPreprocessor {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'preprocessor_id', unsigned: true })
  preprocessorId: number;

  @Column('varchar', { name: 'preprocessor_name', length: 100 })
  preprocessorName: string;

  @Column('varchar', { name: 'preprocessor_code', length: 100 })
  preprocessorCode: string;

  @Column('varchar', { name: 'preprocessor_type', length: 100 })
  preprocessorType: string;

  @Column({ type: 'json', name: 'params' })
  params: string;

  @Column('int', { name: 'sort' })
  sort: number;

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
