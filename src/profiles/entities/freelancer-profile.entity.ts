import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Proposal } from '../../proposals/entities/proposal.entity.js';
import { GenericEntity } from '../../generic/entities/generic.entity.js';

@Entity('freelancer_profiles')
export class FreelancerProfile extends GenericEntity {
  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @Column({ length: 20 })
  nif: string;

  @Column({ length: 20 })
  phone: string;

  @OneToOne(() => User, (user) => user.freelancerProfile)
  @JoinColumn()
  user: User;

  @Column('uuid')
  userId: string;

  @OneToMany(() => Proposal, (proposal) => proposal.freelancerProfile)
  proposals: Proposal[];
}
