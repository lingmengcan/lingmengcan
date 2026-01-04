import { IsNotEmpty, IsOptional, IsNumber, IsString, IsBoolean, IsIn, Min, Max } from 'class-validator';
import { WorkflowConfig } from './engine/workflow.types';

/**
 * 工作流列表查询 DTO
 */
export class WorkflowListDto {
  @IsOptional()
  @IsString()
  workflowName?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2])
  status?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  page: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize: number;
}

/**
 * 工作流创建/更新 DTO
 */
export class WorkflowDto {
  @IsOptional()
  @IsString()
  workflowId?: string;

  @IsNotEmpty()
  @IsString()
  workflowName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2])
  status?: number;

  @IsOptional()
  config?: WorkflowConfig;
}

/**
 * 工作流执行 DTO
 */
export class WorkflowExecuteDto {
  @IsNotEmpty()
  @IsString()
  workflowId: string;

  @IsOptional()
  inputs?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  stream?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(300000)
  timeout?: number; // 执行超时时间（毫秒），默认 60 秒
}

/**
 * 工作流执行历史查询 DTO
 */
export class WorkflowExecutionListDto {
  @IsNotEmpty()
  @IsString()
  workflowId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  page: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize: number;
}

/**
 * 工作流复制 DTO
 */
export class WorkflowCopyDto {
  @IsNotEmpty()
  @IsString()
  workflowId: string;

  @IsNotEmpty()
  @IsString()
  newName: string;
}

/**
 * 节点类型查询 DTO
 */
export class NodeTypeListDto {
  @IsOptional()
  @IsString()
  category?: string;
}
