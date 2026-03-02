import { IsNotEmpty } from 'class-validator';

/**
 * 数据源列表查询
 */
export class DatasourceListDto {
  name: string;
  type: string;
  status: string;

  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  pageSize: number;
}

/**
 * 测试连接
 */
export class TestConnectionDto {
  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  host: string;

  @IsNotEmpty()
  port: number;

  @IsNotEmpty()
  databaseName: string;

  username: string;
  password: string;
  charset: string;
}
