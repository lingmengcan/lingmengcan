import { IsNotEmpty } from 'class-validator';

/**
 * 用户列表
 */
export class DictListDto {
  dictName: string;
  dictCode: string;
  dictType: string;

  status: string;

  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  pageSize: number;
}
