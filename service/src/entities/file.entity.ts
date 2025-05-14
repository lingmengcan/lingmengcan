import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { IsNotEmpty } from 'class-validator';
import { KnowledgeFile } from './knowledge-file.entity';

@Index('file_conversation_id_foreign', ['conversationId'], {})
@Entity('file', { schema: 'lmc' })
export class File {
  @PrimaryColumn({ type: 'varchar', name: 'file_id', length: 36 })
  @IsNotEmpty()
  fileId: string;

  @Column({ type: 'varchar', name: 'conversation_id', length: 36 })
  @IsNotEmpty()
  conversationId: string;

  @Column({ type: 'varchar', name: 'file_name', length: 255 })
  @IsNotEmpty()
  fileName: string;

  @Column({ type: 'varchar', name: 'file_type', length: 32 })
  @IsNotEmpty()
  fileType: string;

  @Column({ type: 'bigint', name: 'file_size' })
  @IsNotEmpty()
  fileSize: number;

  @Column({ type: 'varchar', name: 'path', length: 1024 })
  @IsNotEmpty()
  path: string;

  @Column({ type: 'tinyint', name: 'status' })
  @IsNotEmpty()
  status: number;

  @Column('varchar', { name: 'created_user', length: 32 })
  @IsNotEmpty()
  createdUser: string;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @IsNotEmpty()
  createdAt: Date;

  @Column('datetime', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @IsNotEmpty()
  updatedAt: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.files, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'conversation_id', referencedColumnName: 'conversationId' }])
  conversation: Conversation;

  @OneToMany(() => KnowledgeFile, (knowledgeFile) => knowledgeFile.file)
  knowledgeFiles: KnowledgeFile[];
}
