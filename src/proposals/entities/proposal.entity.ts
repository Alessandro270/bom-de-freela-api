import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
import { ProposalStatus } from '../../common/enums/proposal-status.enum.js';
import { Project } from '../../projects/entities/project.entity.js';
import { FreelancerProfile } from '../../profiles/entities/freelancer-profile.entity.js';
import { Contract } from '../../contracts/entities/contract.entity.js';
import { GenericEntity } from '../../generic/entities/generic.entity.js';

@Entity('proposals')
export class Proposal extends GenericEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column()
  estimatedDays: number;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ProposalStatus,
    default: ProposalStatus.PENDENTE,
  })
  status: ProposalStatus;

  @ManyToOne(() => Project, (project) => project.proposals, {
    onDelete: 'CASCADE',
  })
  project: Project;

  @Column('uuid')
  projectId: string;

  @ManyToOne(() => FreelancerProfile, (fp) => fp.proposals, {
    onDelete: 'CASCADE',
  })
  freelancerProfile: FreelancerProfile;

  @Column('uuid')
  freelancerProfileId: string;

  @OneToOne(() => Contract, (contract) => contract.proposal)
  contract: Contract;
}
