import { IsNotEmpty, IsOptional } from 'class-validator';
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'workflow' })
export class Workflow {
  @PrimaryColumn({ type: 'varchar', length: 36, name: 'workflow_id' })
  workflowId: string;

  @Column({ type: 'varchar', length: 128, name: 'workflow_name' })
  @IsNotEmpty()
  workflowName: string;

  @Column({ type: 'varchar', length: 512, default: '', name: 'description' })
  @IsOptional()
  description: string;

  @Column({ type: 'varchar', length: 32, default: '1.0.0', name: 'version' })
  @IsOptional()
  version: string;

  @Column({ type: 'tinyint', width: 1, default: 0, name: 'status' })
  status: number;

  @Column({ type: 'json', name: 'config' })
  @IsOptional()
  config: any;

  @Column({ type: 'varchar', length: 32, name: 'created_user' })
  createdUser: string;

  @Column({ type: 'varchar', length: 32, name: 'updated_user' })
  updatedUser: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
