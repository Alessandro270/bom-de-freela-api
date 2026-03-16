import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Project } from '../../projects/entities/project.entity.js';
import { GenericEntity } from '../../generic/entities/generic.entity.js';

@Entity('client_profiles')
export class ClientProfile extends GenericEntity {
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, length: 500 })
  profilePhoto: string;

  @OneToOne(() => User, (user) => user.clientProfile)
  @JoinColumn()
  user: User;

  @Column('uuid')
  userId: string;

  @OneToMany(() => Project, (project) => project.clientProfile)
  projects: Project[];
}
