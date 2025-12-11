import { IsNotEmpty } from 'class-validator';

/**
 * 上传文件
 */
export class FileDto {
  @IsNotEmpty()
  conversationId: string;

  @IsNotEmpty()
  llm: string;
}
