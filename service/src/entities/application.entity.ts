import { IsNotEmpty } from 'class-validator';
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'app' })
export class App {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  appId: string;

  @Column({ type: 'varchar', name: 'file_id', length: 36 })
  @IsNotEmpty()
  knowledgeId: string;

  @Column({ type: 'varchar', length: 128 })
  appName: string;

  @Column({ type: 'varchar', length: 32 })
  appType: string;

  @Column({ type: 'varchar', length: 32 })
  appTypeName: string;

  @Column({ type: 'varchar', length: 128 })
  llm: string;

  @Column({ type: 'json' })
  params: string;

  @Column({ type: 'json' })
  promptTemplate: string;

  @Column({ type: 'tinyint', width: 1 })
  status: number;

  @Column({ type: 'varchar', length: 512 })
  description: string;

  @Column({ type: 'varchar', length: 32 })
  createdUser: string;

  @Column({ type: 'varchar', length: 32 })
  updatedUser: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
