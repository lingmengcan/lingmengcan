import { IsNotEmpty, IsOptional } from 'class-validator';
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'workflow_execution' })
export class WorkflowExecution {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  executionId: string;

  @Column({ type: 'varchar', length: 36 })
  @IsNotEmpty()
  workflowId: string;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  inputs: any;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  outputs: any;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  status: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  errorMessage: string;

  @Column({ type: 'datetime' })
  @IsNotEmpty()
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  @IsOptional()
  endTime: Date;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  duration: number;

  @Column({ type: 'varchar', length: 32 })
  createdUser: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}