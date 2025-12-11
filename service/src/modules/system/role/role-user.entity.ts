import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Role } from '@/modules/system/role/role.entity';
import { User } from '@/modules/system/user/user.entity';

@Index('role_user_role_id_foreign', ['roleId'], {})
@Index('role_user_user_id_foreign', ['userId'], {})
@Entity('role_user', { schema: 'lmc' })
export class RoleUser {
  @Column('bigint', { primary: true, name: 'role_id', unsigned: true })
  roleId: string;

  @Column('bigint', { primary: true, name: 'user_id', unsigned: true })
  userId: string;

  @ManyToOne(() => Role, (role) => role.roleUsers, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'role_id', referencedColumnName: 'roleId' }])
  role: Role;

  @ManyToOne(() => User, (user) => user.roleUsers, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user: User;
}
