import { IsNotEmpty, IsOptional } from 'class-validator';
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'workflow' })
export class Workflow {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  workflowId: string;

  @Column({ type: 'varchar', length: 128 })
  @IsNotEmpty()
  workflowName: string;

  @Column({ type: 'varchar', length: 512, default: '' })
  @IsOptional()
  description: string;

  @Column({ type: 'varchar', length: 32, default: '1.0.0' })
  @IsOptional()
  version: string;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  status: number;

  @Column({ type: 'json' })
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