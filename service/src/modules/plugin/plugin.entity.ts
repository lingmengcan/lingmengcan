import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('plugin')
export class Plugin {
  @Column('varchar', { primary: true, name: 'plugin_id', length: 36 })
  pluginId: string;

  @Column('varchar', { name: 'plugin_name', length: 128 })
  pluginName: string;

  @Column('varchar', { name: 'plugin_type', length: 32, nullable: true })
  pluginType: string;

  @Column('varchar', { name: 'plugin_type_name', length: 32, nullable: true })
  pluginTypeName: string;

  @Column('varchar', { name: 'description', length: 512, nullable: true })
  description: string;

  @Column('varchar', { name: 'icon', length: 64, nullable: true })
  icon: string;

  @Column('varchar', { name: 'version', length: 32, nullable: true })
  version: string;

  @Column('varchar', { name: 'author', length: 64, nullable: true })
  author: string;

  @Column('text', { name: 'config', nullable: true })
  config: string;

  @Column('tinyint', {
    name: 'status',
    comment: '-1 deleted, 0 normal, 1 deactivated',
    default: 0,
  })
  @IsNotEmpty()
  status: number;

  @Column('varchar', { name: 'created_user', length: 32, nullable: true })
  createdUser: string;

  @Column('varchar', { name: 'updated_user', length: 32, nullable: true })
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
