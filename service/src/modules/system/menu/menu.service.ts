import { MenuListDto } from './menu.dto';
import { Meta, Route } from './route.dto';
import { Menu } from './menu.entity';
import { isNullOrUndefined } from '@/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private repository: Repository<Menu>,
  ) {}

  /**
   * 查找用户全部权限
   * @param userId
   * @returns
   */
  async findPermissionsByUserId(userId: string): Promise<string[]> {
    const permissions = await this.repository
      .createQueryBuilder('Menu')
      .select('Menu.permissions')
      .innerJoin('Menu.roleMenus', 'RoleMenu')
      .innerJoin('RoleMenu.role', 'Role')
      .innerJoin('Role.roleUsers', 'RoleUser')
      .where('RoleUser.userId = :userId AND Role.status=0 AND Menu.status=0', {
        userId,
      })
      .getMany();

    const res: string[] = [];
    permissions.forEach((item) => {
      if (item) {
        res.push(item.permissions);
      }
    });

    return res;
  }

  findAll(dto: MenuListDto): Promise<Menu[]> {
    const { menuName, status } = dto;

    let qb = this.repository.createQueryBuilder('Menu').andWhere('Menu.status != -1');

    if (menuName) {
      qb = qb.andWhere('Menu.menuName like :name', {
        name: '%' + menuName + '%',
      });
    }

    if (!isNullOrUndefined(status)) {
      qb = qb.andWhere('Menu.status = :status', {
        status,
      });
    }

    qb.orderBy('Menu.sort', 'ASC');
    return qb.getMany();
  }

  /**
   * 查找用户全部权限菜单
   * @param userId
   * @returns
   */
  async findMenusByUser(userId: string): Promise<Menu[]> {
    const qb = await this.repository
      .createQueryBuilder('Menu')
      .innerJoin('Menu.roleMenus', 'RoleMenu')
      .innerJoin('RoleMenu.role', 'Role')
      .innerJoin('Role.roleUsers', 'RoleUser')
      .where('RoleUser.userId = :userId AND Role.status=0 AND Menu.status=0', {
        userId,
      })
      .orderBy({ 'Menu.parentId': 'ASC', 'Menu.sort': 'ASC' })
      .getMany();

    return qb;
  }

  /**
   * 构建前端路由所需要的菜单
   *
   * @param menus 菜单列表
   * @return 路由列表
   */
  buildRoutes(menus: Menu[], menuId = '0'): Route[] {
    const routes: Route[] = [];
    menus.forEach((menu) => {
      // 如果是目录和菜单，递归找子路由
      if (menu.parentId === menuId && (menu.menuType === 'contents' || menu.menuType === 'menu')) {
        const route = new Route();
        route.name = menu.menuCode || 'Menu' + menu.menuId;
        // route.path = this.getRoutePath(menu, parentPath); // 留给前端处理
        route.path = menu.path;
        route.component = menu.component;
        route.query = menu.query;
        route.redirect = menu.redirect;

        const meta = new Meta();
        meta.cached = menu.cached === 1;
        meta.icon = menu.icon;
        meta.title = menu.menuName;
        meta.query = menu.query;
        meta.hidden = menu.hidden === 1;
        meta.permissions = menu.permissions;
        route.meta = meta;
        const children = this.buildRoutes(menus, menu.menuId);

        // 如果存在子菜单
        if (children.length > 0) {
          route.children = children;
        }

        routes.push(route);
      }
    });
    return routes;
  }

  /**
   * 获取路由地址
   *
   * @param menu 菜单信息
   * @return 路由地址
   */
  getRoutePath(menu: Menu, parentPath: string): string {
    // 非外链
    if (!menu.path.match(/(http|https):\/\/([\w.]+\/?)\S*/)) {
      return `${parentPath}/${menu.path}`;
    }
    return menu.path;
  }

  // 获取子菜单
  async getChildren(parentId: string): Promise<Menu[]> {
    // 获取所有子菜单以计算menuid
    const children = await this.repository.find({
      where: { parentId: parentId },
      order: { menuId: 'DESC' },
    });
    return children;
  }

  /**
   * 修改
   *
   * @param menu 信息
   * @return 结果
   */
  async updateMenu(menu: Menu) {
    const entity = await this.repository.findOneBy({ menuId: menu.menuId });
    entity.parentId = menu.parentId;
    entity.menuName = menu.menuName;
    entity.menuCode = menu.menuCode;
    entity.component = menu.component;
    entity.path = menu.path;
    entity.permissions = menu.permissions;
    entity.redirect = menu.redirect;
    entity.query = menu.query;
    entity.menuType = menu.menuType;
    entity.hidden = menu.hidden;
    entity.cached = menu.cached;
    entity.icon = menu.icon;
    entity.description = menu.description;
    entity.sort = menu.sort;
    entity.status = menu.status;
    entity.updatedUser = menu.updatedUser;
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  /**
   * 新增
   *
   * @param menu 信息
   * @return 结果
   */
  async addMenu(menu: Menu) {
    // const menuId = await this.generateMenuId(menu.parentId);

    const entity = new Menu();
    // entity.menuId = menuId;
    entity.parentId = menu.parentId;
    entity.menuName = menu.menuName;
    entity.menuCode = menu.menuCode;
    entity.component = menu.component;
    entity.path = menu.path;
    entity.permissions = menu.permissions;
    entity.redirect = menu.redirect;
    entity.query = menu.query;
    entity.menuType = menu.menuType;
    entity.hidden = menu.hidden;
    entity.cached = menu.cached;
    entity.icon = menu.icon;
    entity.description = menu.description;
    entity.sort = menu.sort;
    entity.status = menu.status;
    entity.createdUser = menu.createdUser;
    entity.updatedUser = menu.updatedUser;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  // 生成最新的menuid
  // async generateMenuId(parentId: string): Promise<string> {
  //   let menuId = '';
  //   // 获取所有子菜单以计算menuid
  //   const children = await this.repository.find({
  //     where: { parentId: parentId },
  //     order: { menuId: 'DESC' },
  //   });

  //   // 每个菜单的子菜单，最多99个。不然id会冲突
  //   if (children.length === 0) {
  //     menuId = parentId + '01';
  //   } else {
  //     menuId = String(Number(children.at(0).menuId) + 1);
  //   }

  //   if (!menuId) {
  //     throw new ServiceUnavailableException('50001', '生成新的menuid出错！');
  //   }

  //   return menuId;
  // }

  /**
   * 菜单，假删除，状态改为-1
   *
   * @param menuId
   * @return 结果
   */
  async delStatus(menuId: string, userName: string) {
    return await this.repository.update({ menuId: menuId }, { status: -1, updatedUser: userName });
  }
}
