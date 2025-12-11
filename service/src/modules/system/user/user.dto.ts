import { IsNotEmpty } from 'class-validator';

/**
 * 用户列表
 */
export class UserListDto {
  userName: string;

  nickName: string;

  phone: string;

  status: string;

  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  pageSize: number;
}
