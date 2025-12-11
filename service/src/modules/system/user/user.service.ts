import { UserListDto } from './user.dto';
import { User } from './user.entity';
import { isNullOrUndefined } from '@/utils';
import { genPassowrd } from '@/utils/cryptogram';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * 获取实体
   * @param id
   * @returns
   */
  findOne(id: string): Promise<User> {
    return this.repository.findOneBy({ userId: id });
  }

  findByUserId(userId: string): Promise<User> {
    return this.repository.findOne({
      where: { userId, status: 0 },
    });
  }

  findByUsername(username: string): Promise<User> {
    return this.repository.findOne({
      where: { userName: username, status: 0 },
    });
  }

  /**
   * 用户管理列表
   *
   * @param userDto
   * @returns
   */
  async findAll(userDto: UserListDto) {
    const { userName, nickName, phone, status, page, pageSize } = userDto;
    // 默认首页
    const skip = page && pageSize ? (page - 1) * pageSize : 0;

    // 默认20条数据
    const take = pageSize ? pageSize : 20;
    let qb = this.repository.createQueryBuilder('User').andWhere('User.status != -1');

    if (userName) {
      qb = qb.andWhere('User.userName like :userName', {
        userName: '%' + userName + '%',
      });
    }

    if (nickName) {
      qb = qb.andWhere('User.nickName like :nickName', {
        nickName: '%' + nickName + '%',
      });
    }

    if (phone) {
      qb = qb.andWhere('User.phone like :phone', {
        phone: '%' + phone + '%',
      });
    }

    if (!isNullOrUndefined(status)) {
      qb = qb.andWhere('User.status = :status', {
        status,
      });
    }

    qb.orderBy('User.userName', 'ASC');

    const [list, count] = await qb.skip(skip).take(take).getManyAndCount();
    return {
      list,
      page,
      pageSize,
      count,
    };
  }

  /**
   * 修改用户状态
   *
   * @param user 用户信息
   * @return 结果
   */
  async updateStatus(user: User) {
    const entity = await this.findOne(user.userId);
    entity.status = user.status;
    entity.updatedUser = user.updatedUser;
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  /**
   * 修改用户hhj
   *
   * @param user 用户信息
   * @return 结果
   */
  async updateUser(user: User) {
    const entity = await this.findOne(user.userId);
    entity.nickName = user.nickName;
    entity.userName = user.userName;
    entity.email = user.email;
    entity.phone = user.phone;
    entity.sex = user.sex;
    entity.avatar = user.avatar;
    entity.status = user.status;
    entity.description = user.description;
    entity.updatedUser = user.updatedUser;
    entity.updatedAt = new Date();
    return this.repository.save(entity);
  }

  /**
   * 添加用户
   *
   * @param user 用户信息
   * @return 结果
   */
  async addUser(user: User) {
    // hash 密码10次
    const password = await genPassowrd(user.password);

    const entity = new User();
    entity.nickName = user.nickName;
    entity.password = password;
    entity.userName = user.userName;
    entity.email = user.email;
    entity.phone = user.phone;
    entity.sex = user.sex;
    entity.avatar = user.avatar ?? '';
    entity.loginIp = user.loginIp ?? '';
    entity.loginDate = user.loginDate ?? new Date();
    entity.status = user.status;
    entity.description = user.description ?? '';
    entity.createdUser = user.createdUser;
    entity.updatedUser = user.updatedUser;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    return this.repository.save(entity);
  }

  /**
   * 重置密码
   *
   * @param userId
   * @return 结果
   */
  async resetPassword(userId: string, password: string, updatedUser: string) {
    const hashPwd = await genPassowrd(password);
    return await this.repository.update({ userId }, { password: hashPwd, updatedUser });
  }
}
