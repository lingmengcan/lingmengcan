import { IsNotEmpty, IsOptional, IsNumber, IsString, IsArray, IsObject, IsBoolean } from 'class-validator';

/**
 * 工作流列表查询 DTO
 */
export class WorkflowListDto {
  @IsOptional()
  @IsString()
  workflowName?: string;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsNotEmpty()
  @IsNumber()
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
  status?: number;

  @IsOptional()
  @IsObject()
  config?: any;
}

/**
 * 工作流执行 DTO
 */
export class WorkflowExecuteDto {
  @IsNotEmpty()
  @IsString()
  workflowId: string;

  @IsOptional()
  @IsObject()
  inputs?: any;

  @IsOptional()
  @IsBoolean()
  stream?: boolean; // 是否流式输出
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
  page: number;

  @IsNotEmpty()
  @IsNumber()
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
