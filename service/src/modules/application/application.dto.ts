import { IsNotEmpty, IsOptional, IsString, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplicationListDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: '应用名称', required: false })
  appName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '应用类型', required: false })
  appType?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: '状态', required: false })
  status?: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: '页码' })
  page: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: '每页数量' })
  pageSize: number;
}

export class ApplicationDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: '应用ID', required: false })
  appId?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '应用名称' })
  appName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '应用类型' })
  appType: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '应用类型名称' })
  appTypeName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '描述', required: false })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '版本', required: false })
  version?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: '状态', required: false })
  status?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '关联的工作流ID', required: false })
  workflowId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '创建用户', required: false })
  createdUser?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '更新用户', required: false })
  updatedUser?: string;
}

export class ApplicationExecuteDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '应用ID' })
  appId: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: '输入参数', required: false })
  inputs?: any;
}

export class ApplicationExecutionListDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '应用ID' })
  appId: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: '页码' })
  page: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: '每页数量' })
  pageSize: number;
}

export class ApplicationCopyDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '应用ID' })
  appId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '新应用名称' })
  newName: string;
}