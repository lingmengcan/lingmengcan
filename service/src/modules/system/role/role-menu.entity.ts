import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Menu } from '@/modules/system/menu/menu.entity';
import { Role } from '@/modules/system/role/role.entity';

@Index('role_menu_role_id_foreign', ['roleId'], {})
@Index('role_menu_menu_id_foreign', ['menuId'], {})
@Entity('role_menu', { schema: 'lmc' })
export class RoleMenu {
  @Column('bigint', { primary: true, name: 'role_id', unsigned: true })
  roleId: string;

  @Column('bigint', { primary: true, name: 'menu_id', unsigned: true })
  menuId: string;

  @ManyToOne(() => Menu, (menu) => menu.roleMenus, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'menu_id', referencedColumnName: 'menuId' }])
  menu: Menu;

  @ManyToOne(() => Role, (role) => role.roleMenus, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'role_id', referencedColumnName: 'roleId' }])
  role: Role;
}
