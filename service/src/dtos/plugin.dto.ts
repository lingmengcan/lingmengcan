import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class PluginDto {
  @ApiProperty({ description: '插件ID' })
  @IsOptional()
  @IsString()
  pluginId?: string;

  @ApiProperty({ description: '插件名称' })
  @IsNotEmpty({ message: '插件名称不能为空' })
  @Length(1, 128, { message: '插件名称长度为1-128个字符' })
  pluginName: string;

  @ApiProperty({ description: '插件类型' })
  @IsOptional()
  @IsString()
  pluginType?: string;

  @ApiProperty({ description: '插件类型名称' })
  @IsOptional()
  @IsString()
  pluginTypeName?: string;

  @ApiProperty({ description: '插件描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '图标' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: '版本' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ description: '作者' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ description: '配置' })
  @IsOptional()
  @IsString()
  config?: string;

  @ApiProperty({ description: '状态（-1 deleted, 0 normal, 1 deactivated）' })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: '创建人' })
  @IsOptional()
  @IsString()
  createdUser?: string;

  @ApiProperty({ description: '更新人' })
  @IsOptional()
  @IsString()
  updatedUser?: string;
}

export class PluginQueryDto {
  @ApiProperty({ description: '插件名称', required: false })
  @IsOptional()
  @IsString()
  pluginName?: string;

  @ApiProperty({ description: '插件类型', required: false })
  @IsOptional()
  @IsString()
  pluginType?: string;

  @ApiProperty({ description: '页码', required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: '每页数量', required: false })
  @IsOptional()
  pageSize?: number;
}