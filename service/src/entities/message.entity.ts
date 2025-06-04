import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { IsNotEmpty } from 'class-validator';

@Index('message_conversation_id_foreign', ['conversationId'], {})
@Entity('message', { schema: 'lmc' })
export class Message {
  @PrimaryColumn({ type: 'varchar', name: 'message_id', length: 36 })
  messageId: string;

  @Column({ type: 'varchar', name: 'previous_id', length: 36 })
  previousId: string;

  @Column({ type: 'varchar', name: 'conversation_id', length: 36 })
  conversationId: string;

  @Column({ type: 'varchar', name: 'file_id', length: 36 })
  @IsNotEmpty()
  fileId: string;

  @Column({ type: 'text', name: 'content' })
  content: string;

  @Column({ type: 'text', name: 'reasoning' })
  @IsNotEmpty()
  reasoning: string;

  @Column({ type: 'varchar', name: 'sender' })
  @IsNotEmpty()
  sender: string;

  @Column({ type: 'varchar', name: 'role' })
  @IsNotEmpty()
  role: string;

  @Column({ type: 'tinyint', name: 'completed' })
  @IsNotEmpty()
  completed: number;

  @Column('tinyint', {
    name: 'status',
    comment: '1 deleted, 0 normal, 1 deactivated',
  })
  @IsNotEmpty()
  status: number;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'conversation_id', referencedColumnName: 'conversationId' }])
  conversation: Conversation;
}
