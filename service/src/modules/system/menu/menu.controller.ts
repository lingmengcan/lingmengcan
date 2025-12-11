import { MenuListDto } from './menu.dto';
import { Menu } from './menu.entity';
import { MenuService } from './menu.service';
import { errorJson, successJson } from '@/utils/result';
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('menu') // 添加 接口标签 装饰器
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * 获取菜单路由
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('/routes')
  async getRoutes(@Request() req: any) {
    const menus = await this.menuService.findMenusByUser(req.user.userId);
    const routes = this.menuService.buildRoutes(menus);

    return successJson(routes);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/list')
  async findAll(@Body() dto: MenuListDto) {
    return successJson(await this.menuService.findAll(dto));
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/add')
  async add(@Body() menu: Menu, @Request() req: any) {
    const userName = req.user.userName;
    menu.updatedUser = userName;
    menu.createdUser = userName;
    return successJson(await this.menuService.addMenu(menu));
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/edit')
  async edit(@Body() menu: Menu, @Request() req: any) {
    const userName = req.user.userName;
    menu.updatedUser = userName;
    return successJson(await this.menuService.updateMenu(menu));
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/del')
  async del(@Body() menu: any, @Request() req: any) {
    const userName = req.user.userName;
    const children = await this.menuService.getChildren(menu.menuId);
    if (children.length === 0) {
      return successJson(await this.menuService.delStatus(menu.menuId, userName));
    } else {
      return errorJson(50002, '存在子菜单，不能被停用或者删除');
    }
  }
}
