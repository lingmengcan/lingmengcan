import { IsNotEmpty, IsOptional } from 'class-validator';
import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Workflow } from './workflow.entity';

/**
 * 执行状态枚举
 */
export enum ExecutionStatus {
  RUNNING = 0, // 运行中
  SUCCESS = 1, // 成功
  FAILED = 2, // 失败
  STOPPED = 3, // 已停止
  TIMEOUT = 4, // 超时
}

@Entity({ name: 'workflow_execution' })
export class WorkflowExecution {
  @PrimaryColumn({ type: 'varchar', length: 36, name: 'execution_id' })
  executionId: string;

  @Column({ type: 'varchar', length: 36, name: 'workflow_id' })
  @IsNotEmpty()
  workflowId: string;

  @ManyToOne(() => Workflow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow?: Workflow;

  @Column({ type: 'json', nullable: true, name: 'inputs' })
  @IsOptional()
  inputs: Record<string, any>;

  @Column({ type: 'json', nullable: true, name: 'outputs' })
  @IsOptional()
  outputs: Record<string, any>;

  @Column({ type: 'tinyint', width: 1, default: 0, name: 'status' })
  status: ExecutionStatus;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  @IsOptional()
  errorMessage: string;

  @Column({ type: 'datetime', name: 'start_time' })
  @IsNotEmpty()
  startTime: Date;

  @Column({ type: 'datetime', nullable: true, name: 'end_time' })
  @IsOptional()
  endTime: Date;

  @Column({ type: 'int', nullable: true, name: 'duration' })
  @IsOptional()
  duration: number;

  @Column({ type: 'varchar', length: 32, name: 'created_user' })
  createdUser: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;
}
