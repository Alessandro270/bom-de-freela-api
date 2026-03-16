import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ContractStatus } from '../../common/enums/contract-status.enum.js';
import { Proposal } from '../../proposals/entities/proposal.entity.js';
import { Project } from '../../projects/entities/project.entity.js';
import { ClientProfile } from '../../profiles/entities/client-profile.entity.js';
import { FreelancerProfile } from '../../profiles/entities/freelancer-profile.entity.js';
import { Payment } from '../../payments/entities/payment.entity.js';
import { Review } from '../../reviews/entities/review.entity.js';
import { GenericEntity } from '../../generic/entities/generic.entity.js';

@Entity('contracts')
export class Contract extends GenericEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.ATIVO,
  })
  status: ContractStatus;

  @OneToOne(() => Proposal, (proposal) => proposal.contract)
  @JoinColumn()
  proposal: Proposal;

  @Column('uuid')
  proposalId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @Column('uuid')
  projectId: string;

  @ManyToOne(() => ClientProfile, { onDelete: 'CASCADE' })
  clientProfile: ClientProfile;

  @Column('uuid')
  clientProfileId: string;

  @ManyToOne(() => FreelancerProfile, { onDelete: 'CASCADE' })
  freelancerProfile: FreelancerProfile;

  @Column('uuid')
  freelancerProfileId: string;

  @OneToOne(() => Payment, (payment) => payment.contract)
  payment: Payment;

  @OneToMany(() => Review, (review) => review.contract)
  reviews: Review[];
}
