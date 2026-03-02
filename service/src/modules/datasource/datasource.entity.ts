import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('datasource')
export class Datasource {
  @PrimaryColumn('varchar', { name: 'datasource_id', length: 36 })
  datasourceId: string;

  @Column('varchar', { name: 'name', length: 100 })
  @IsNotEmpty()
  name: string;

  @Column('varchar', { name: 'type', length: 20 })
  @IsNotEmpty()
  type: string;

  @Column('varchar', { name: 'host', length: 255 })
  @IsNotEmpty()
  host: string;

  @Column('int', { name: 'port' })
  @IsNotEmpty()
  port: number;

  @Column('varchar', { name: 'database_name', length: 255 })
  @IsNotEmpty()
  databaseName: string;

  @Column('varchar', { name: 'username', length: 255 })
  username: string;

  @Column('varchar', { name: 'password', length: 500 })
  password: string;

  @Column('varchar', { name: 'charset', length: 20, default: 'utf8mb4' })
  charset: string;

  @Column('text', { name: 'extra_options', nullable: true })
  extraOptions: string;

  @Column('tinyint', {
    name: 'status',
    comment: '-1 deleted, 0 normal, 1 deactivated',
    default: 0,
  })
  @IsNotEmpty()
  status: number;

  @Column('varchar', { name: 'description', length: 512, nullable: true })
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
