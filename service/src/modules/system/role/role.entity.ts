import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { RoleMenu } from './role-menu.entity';
import { RoleUser } from './role-user.entity';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'role_id', unsigned: true })
  roleId: string;

  @Column('varchar', { name: 'role_name', length: 32 })
  @IsNotEmpty()
  roleName: string;

  @Column('varchar', { name: 'role_code', length: 32 })
  @IsNotEmpty()
  roleCode: string;

  @Column('int', { name: 'sort' })
  @IsNotEmpty()
  sort: number;

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

  @OneToMany(() => RoleMenu, (roleMenu) => roleMenu.role)
  roleMenus: RoleMenu[];

  @OneToMany(() => RoleUser, (roleUser) => roleUser.role)
  roleUsers: RoleUser[];
}
