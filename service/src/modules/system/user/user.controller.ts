import { UserListDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { MenuService } from '../menu/menu.service';
import { successJson } from '@/utils/result';
import { Controller, Get, UseGuards, Request, Post, Body, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user') // 添加 接口标签 装饰器
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly menuService: MenuService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('info')
  async getUserInfo(@Request() req: any) {
    const userId = req.user.userId;
    const permissions = await this.menuService.findPermissionsByUserId(userId);

    const result = {
      user: req.user,
      permissions,
    };
    // 生成令牌
    return successJson(result);
  }

  /**
   * 管理列表
   *
   * @param dto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('list')
  async findAll(@Body() dto: UserListDto) {
    return successJson(await this.userService.findAll(dto));
  }

  /**
   * 变更状态
   *
   * @param user
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('change-status')
  async changeStatus(@Body() user: User, @Request() req: any) {
    const userName = req.user.userName;
    user.updatedUser = userName;
    return successJson(await this.userService.updateStatus(user));
  }

  /**
   * 添加
   *
   * @param user
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/add')
  async add(@Body() user: User, @Request() req: any) {
    const userName = req.user.userName;
    user.updatedUser = userName;
    user.createdUser = userName;
    return successJson(await this.userService.addUser(user));
  }

  /**
   * 编辑
   *
   * @param user
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('edit')
  async edit(@Body() user: User, @Request() req: any) {
    const userName = req.user.userName;
    user.updatedUser = userName;
    return successJson(await this.userService.updateUser(user));
  }

  /**
   * 重置密码
   *
   * @param user
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Put('/reset-pwd')
  async resetPwd(@Body() user: any, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.userService.resetPassword(user.userId, user.password, userName));
  }
}
