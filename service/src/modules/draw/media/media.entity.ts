import { Column, Entity, PrimaryColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity('media')
export class Media {
  @PrimaryColumn({ type: 'varchar', name: 'media_id', length: 36 })
  mediaId: string;

  @Column({ type: 'enum', enum: ['image', 'video'], name: 'media_type' })
  mediaType: string;

  @Column({ type: 'varchar', name: 'file_name', length: 255 })
  @IsNotEmpty()
  fileName: string;

  @Column({ type: 'varchar', name: 'file_path', length: 500 })
  filePath: string;

  @Column({ type: 'varchar', name: 'ai', length: 64 })
  ai: string;

  @Column({ type: 'json', name: 'generation_parameters' })
  generationParameters: string;

  @Column({
    type: 'enum',
    enum: ['completed', 'in_progress', 'failed'],
    name: 'status',
    default: 'completed',
  })
  @IsNotEmpty()
  status: string;

  @Column('varchar', { name: 'created_user', length: 32 })
  createdUser: string;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
