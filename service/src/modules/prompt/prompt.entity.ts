import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('prompt')
export class Prompt {
  @PrimaryColumn({ type: 'varchar', name: 'prompt_id', length: 36 })
  promptId: string;

  @Column('varchar', { name: 'title', length: 32 })
  title: string;

  @Column('varchar', { name: 'content', length: 1024 })
  content: string;

  @Column('varchar', { name: 'user_name', length: 32 })
  userName: string;

  @Column('tinyint', {
    name: 'status',
    comment: '-1 deleted, 0 normal, 1 deactivated',
  })
  @IsNotEmpty()
  status: number;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
