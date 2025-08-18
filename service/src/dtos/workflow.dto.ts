import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

/**
 * 工作流应用列表查询 DTO
 */
export class WorkflowAppListDto {
  @IsOptional()
  @IsString()
  appName?: string;

  @IsOptional()
  @IsString()
  appType?: string;

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
 * 工作流应用创建/更新 DTO
 */
export class WorkflowAppDto {
  @IsOptional()
  @IsString()
  appId?: string;

  @IsNotEmpty()
  @IsString()
  appName: string;

  @IsNotEmpty()
  @IsString()
  appType: string;

  @IsNotEmpty()
  @IsString()
  appTypeName: string;

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
  workflowConfig?: any;
}

/**
 * 工作流执行 DTO
 */
export class WorkflowExecuteDto {
  @IsNotEmpty()
  @IsString()
  appId: string;

  @IsOptional()
  inputs?: any;
}

/**
 * 工作流执行历史查询 DTO
 */
export class WorkflowExecutionListDto {
  @IsNotEmpty()
  @IsString()
  appId: string;

  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsNotEmpty()
  @IsNumber()
  pageSize: number;
}

/**
 * 应用复制 DTO
 */
export class WorkflowAppCopyDto {
  @IsNotEmpty()
  @IsString()
  appId: string;

  @IsNotEmpty()
  @IsString()
  newName: string;
}