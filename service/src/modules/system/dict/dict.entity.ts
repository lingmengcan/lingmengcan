import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dict')
export class Dict {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'dict_id', unsigned: true })
  dictId: string;

  @Column('varchar', { name: 'dict_name', length: 100 })
  dictName: string;

  @Column('varchar', { name: 'dict_code', length: 100 })
  dictCode: string;

  @Column('varchar', { name: 'dict_type', length: 100 })
  dictType: string;

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
