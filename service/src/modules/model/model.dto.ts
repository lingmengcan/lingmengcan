import { IsNotEmpty } from 'class-validator';

/**
 * LLM列表
 */
export class LlmListDto {
  modelName: string;
  modelType: string;

  status: string;

  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  pageSize: number;
}

/**
 * stable diffusion model列表
 */
export class DiffusionModelListDto {
  modelName: string;
  modelType: string;

  status: string;

  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  pageSize: number;
}
