import { IsNotEmpty, IsOptional } from 'class-validator';
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'application' })
export class Application {
  @PrimaryColumn({ type: 'varchar', length: 36, name: 'app_id' })
  appId: string;

  @Column({ type: 'varchar', length: 128, name: 'app_name' })
  @IsNotEmpty()
  appName: string;

  @Column({ type: 'varchar', length: 32, name: 'app_type' })
  @IsNotEmpty()
  appType: string;

  @Column({ type: 'varchar', length: 32, name: 'app_type_name' })
  @IsOptional()
  appTypeName: string;

  @Column({ type: 'varchar', length: 512, default: '' })
  @IsOptional()
  description: string;

  @Column({ type: 'varchar', length: 32, default: '1.0.0' })
  @IsOptional()
  version: string;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  status: number;

  @Column({ type: 'varchar', length: 36, name: 'workflow_id', nullable: true })
  @IsOptional()
  workflowId: string;

  @Column({ type: 'varchar', length: 32, name: 'created_user' })
  createdUser: string;

  @Column({ type: 'varchar', length: 32, name: 'updated_user' })
  updatedUser: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
