import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { RoleUser } from '../role/role-user.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'user_id', unsigned: true })
  userId: string;

  @Column('varchar', { name: 'user_name', length: 32 })
  userName: string;

  @Column('varchar', { name: 'nick_name', length: 64 })
  nickName: string;

  @Column('varchar', { name: 'email', length: 64 })
  email: string;

  @Column('varchar', { name: 'phone', length: 32 })
  phone: string;

  @Column('varchar', { name: 'sex', comment: '1 male，0 female', length: 1 })
  sex: string;

  @Column('varchar', { name: 'avatar', length: 128 })
  avatar: string;

  @Column('varchar', { name: 'password', length: 32 })
  password: string;

  @Column('varchar', { name: 'login_ip', length: 64 })
  loginIp: string;

  @Column('datetime', { name: 'login_date' })
  loginDate: Date;

  @Column('tinyint', {
    name: 'status',
    comment: '-1 deleted, 0 normal, 1 deactivated',
  })
  @IsNotEmpty()
  status: number;

  @Column('varchar', { name: 'description', length: 512 })
  description: string;

  @Column('varchar', { name: 'created_user', length: 32 })
  createdUser: string;

  @Column('varchar', { name: 'updated_user', length: 32 })
  updatedUser: string;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('datetime', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => RoleUser, (roleUser) => roleUser.user)
  roleUsers: RoleUser[];
}
