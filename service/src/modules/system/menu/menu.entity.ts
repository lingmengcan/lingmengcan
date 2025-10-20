import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoleMenu } from '../role/role-menu.entity';

@Entity('menu')
export class Menu {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'menu_id', unsigned: true })
  menuId: string;

  @Column('bigint', { name: 'parent_id' })
  parentId: string;

  @Column('varchar', { name: 'menu_name', length: 64 })
  menuName: string;

  @Column('varchar', { name: 'menu_code', length: 64 })
  menuCode: string;

  @Column('varchar', { name: 'component', length: 32 })
  component: string;

  @Column('varchar', { name: 'path', length: 256 })
  path: string;

  @Column('varchar', { name: 'permissions', length: 256 })
  permissions: string;

  @Column('varchar', { name: 'query', length: 128 })
  query: string;

  @Column('varchar', { name: 'redirect', length: 128 })
  redirect: string;

  @Column('varchar', {
    name: 'menu_type',
    comment: 'contents,menu,button',
    length: 16,
  })
  menuType: string;

  @Column('int', { name: 'hidden' })
  hidden: number;

  @Column('int', { name: 'cached' })
  cached: number;

  @Column('varchar', { name: 'icon', length: 64 })
  icon: string;

  @Column('int', { name: 'sort' })
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

  @OneToMany(() => RoleMenu, (roleMenu) => roleMenu.menu)
  roleMenus: RoleMenu[];

  children: Menu[];
}
