import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Conversation } from '../conversation/conversation.entity';

@Index('message_conversation_id_foreign', ['conversationId'], {})
@Entity('message', { schema: 'lmc' })
export class Message {
  @PrimaryColumn({ type: 'varchar', name: 'message_id', length: 36 })
  messageId: string;

  @Column({ type: 'varchar', name: 'conversation_id', length: 36 })
  conversationId: string;

  @Column({ type: 'json', name: 'content', nullable: true, default: null })
  content: any; // AIMessageContent[] | UserMessageContent[]

  @Column({
    type: 'enum',
    name: 'role',
    enum: ['user', 'assistant', 'system'],
    default: 'user',
  })
  role: 'user' | 'assistant' | 'system';

  @Column({
    type: 'enum',
    name: 'status',
    enum: ['pending', 'streaming', 'complete', 'stop', 'error'],
    default: 'pending',
  })
  status: 'pending' | 'streaming' | 'complete' | 'stop' | 'error';

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'conversation_id', referencedColumnName: 'conversationId' }])
  conversation: Conversation;
}
