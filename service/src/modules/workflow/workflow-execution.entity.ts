import { IsNotEmpty, IsOptional } from 'class-validator';
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'workflow_execution' })
export class WorkflowExecution {
  @PrimaryColumn({ type: 'varchar', length: 36, name: 'execution_id' })
  executionId: string;

  @Column({ type: 'varchar', length: 36, name: 'workflow_id' })
  @IsNotEmpty()
  workflowId: string;

  @Column({ type: 'json', nullable: true, name: 'inputs' })
  @IsOptional()
  inputs: any;

  @Column({ type: 'json', nullable: true, name: 'outputs' })
  @IsOptional()
  outputs: any;

  @Column({ type: 'tinyint', width: 1, default: 0, name: 'status' })
  status: number;

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
