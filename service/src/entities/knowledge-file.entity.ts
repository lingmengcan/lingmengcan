import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { File } from './file.entity';
import { Knowledge } from './knowledge.entity';

@Entity({ name: 'knowledge_file' })
export class KnowledgeFile {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  knowledgeId: string;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  fileId: string;

  @ManyToOne(() => Knowledge, (knowledge) => knowledge.knowledgeFiles, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'knowledge_id', referencedColumnName: 'knowledgeId' }])
  knowledge: Knowledge;

  @ManyToOne(() => File, (file) => file.knowledgeFiles, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'file_id', referencedColumnName: 'fileId' }])
  file: File;
}
