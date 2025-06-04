import { IsNotEmpty } from 'class-validator';

/**
 * knowledge 列表
 */
export class KnowledgeListDto {
  knowledgeName: string;
  knowledgeType: string;

  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  pageSize: number;
}
