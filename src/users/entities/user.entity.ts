import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
import { Role } from '../../common/enums/role.enum.js';
import { ClientProfile } from '../../profiles/entities/client-profile.entity.js';
import { FreelancerProfile } from '../../profiles/entities/freelancer-profile.entity.js';
import { Notification } from '../../notifications/entities/notification.entity.js';
import { GenericEntity } from '../../generic/entities/generic.entity.js';

@Entity('users')
export class User extends GenericEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, length: 255 })
  resetPasswordToken: string;

  @Column({ type: 'datetime', nullable: true })
  resetPasswordExpires: Date;

  @OneToOne(() => ClientProfile, (profile) => profile.user, { cascade: true })
  clientProfile: ClientProfile;

  @OneToOne(() => FreelancerProfile, (profile) => profile.user, {
    cascade: true,
  })
  freelancerProfile: FreelancerProfile;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
