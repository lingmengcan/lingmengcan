import { RoleListDto } from './role.dto';
import { Role } from './role.entity';
import { RoleMenu } from './role-menu.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { isNullOrUndefined } from '@/utils';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private repository: Repository<Role>,
    private dataSource: DataSource,
  ) {}

  /**
   * 获取实体
   * @param id
   * @returns
   */
  findOne(id: string): Promise<Role> {
    return this.repository.findOneBy({ roleId: id });
  }

  /**
   * 角色管理列表
   *
   * @param roleDto
   * @returns
   */
  async findAll(roleDto: RoleListDto) {
    const { roleName, roleCode, status, page, pageSize } = roleDto;
    // 默认首页
    const skip = page && pageSize ? (page - 1) * pageSize : 0;

    // 默认20条数据
    const take = pageSize ? pageSize : 20;
    let qb = this.repository.createQueryBuilder('Role').andWhere('Role.status != -1');

    if (roleName) {
      qb = qb.andWhere('Role.roleName like :roleName', {
        roleName: '%' + roleName + '%',
      });
    }

    if (roleCode) {
      qb = qb.andWhere('Role.roleCode like :roleCode', {
        roleCode: '%' + roleCode + '%',
      });
    }

    if (!isNullOrUndefined(status)) {
      qb = qb.andWhere('Role.status = :status', {
        status,
      });
    }

    qb.orderBy('Role.sort', 'ASC');
    // const roles = this.repository.find({
    //   where: {
    //     roleCode: Like('%' + roleCode + '%'),
    //     roleName: Like('%' + roleName + '%'),
    //     status: status,
    //   },
    //   order: {
    //     sort: 'ASC',
    //   },
    //   skip: skip,
    //   take: take,
    // });

    const [list, count] = await qb.skip(skip).take(take).getManyAndCount();
    return {
      list,
      page,
      pageSize,
      count,
    };
  }

  /**
   * 修改角色状态
   *
   * @param role 角色信息
   * @return 结果
   */
  async updateStatus(role: Role) {
    const entity = await this.findOne(role.roleId);
    entity.status = role.status;
    entity.updatedUser = role.updatedUser;
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  /**
   * 查找角色全部菜单
   *
   * @param roleId
   * @returns
   */
  async findMenuIdsByRoleId(roleId: string): Promise<string[]> {
    const roleMenus = await this.dataSource
      .getRepository(RoleMenu)
      .createQueryBuilder()
      .where('RoleMenu.roleId = :id', { id: roleId })
      .getMany();

    const res = roleMenus.map((entity) => entity.menuId);

    return res;
  }

  /**
   * 修改角色权限
   *
   * @param roleId 角色信息
   * @param menuIds 菜单
   * @return 结果
   */
  async updateRoleMenus(roleId: string, menuIds: string[]) {
    // Transactions 启动
    /// create a new query runner
    const queryRunner = this.dataSource.createQueryRunner();

    // establish real database connection using our new query runner
    await queryRunner.connect();

    // lets now open a new transaction:
    await queryRunner.startTransaction();

    try {
      // execute some operations on this transaction:

      // 删除之前的关联关系
      await queryRunner.manager
        .getRepository(RoleMenu)
        .createQueryBuilder()
        .delete()
        .where('roleId = :id', { id: roleId })
        .execute();

      // 添加新的关联关系
      const roleMenus: QueryDeepPartialEntity<RoleMenu>[] = [];
      menuIds.forEach((menuId) => {
        roleMenus.push({ roleId, menuId });
      });
      await queryRunner.manager.createQueryBuilder().insert().into(RoleMenu).values(roleMenus).execute();

      // commit transaction now:
      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }
  }

  /**
   * 修改角色
   *
   * @param role 角色信息
   * @return 结果
   */
  async updateRole(role: Role) {
    const entity = await this.findOne(role.roleId);
    entity.roleName = role.roleName;
    entity.roleCode = role.roleCode;
    entity.description = role.description;
    entity.sort = role.sort;
    entity.status = role.status;
    entity.updatedUser = role.updatedUser;
    entity.updatedAt = new Date();
    // return this.repository.save(entity);

    // Transactions 启动
    /// create a new query runner
    const queryRunner = this.dataSource.createQueryRunner();

    // establish real database connection using our new query runner
    await queryRunner.connect();

    // lets now open a new transaction:
    await queryRunner.startTransaction();

    try {
      // execute some operations on this transaction:
      await queryRunner.manager.save(entity);

      // commit transaction now:
      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }
  }

  /**
   * 添加角色
   *
   * @param role 角色信息
   * @return 结果
   */
  async addRole(role: Role) {
    const entity = new Role();
    entity.roleCode = role.roleCode;
    entity.roleName = role.roleName;
    entity.sort = role.sort;
    entity.status = role.status;
    entity.description = role.description;
    entity.createdUser = role.createdUser;
    entity.updatedUser = role.updatedUser;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    // Transactions 启动
    /// create a new query runner
    const queryRunner = this.dataSource.createQueryRunner();

    // establish real database connection using our new query runner
    await queryRunner.connect();

    // lets now open a new transaction:
    await queryRunner.startTransaction();

    try {
      // execute some operations on this transaction:
      await queryRunner.manager.save(entity);

      // commit transaction now:
      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }
  }
}
