import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsOptional } from 'class-validator';

@Entity({ name: 'workflow_node_type' })
export class WorkflowNodeType {
  @PrimaryColumn({ type: 'varchar', length: 32, name: 'node_type' })
  nodeType: string;

  @Column({ type: 'varchar', length: 64, name: 'node_name' })
  nodeName: string;

  @Column({ type: 'varchar', length: 32, name: 'category' })
  category: string;

  @Column({ type: 'varchar', length: 32, nullable: true, name: 'icon' })
  @IsOptional()
  icon: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'description' })
  @IsOptional()
  description: string;

  @Column({ type: 'json', nullable: true, name: 'config_schema' })
  @IsOptional()
  configSchema: any;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
