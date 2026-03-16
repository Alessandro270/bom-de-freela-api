import { Entity, Column, ManyToOne } from 'typeorm';
import { Contract } from '../../contracts/entities/contract.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { GenericEntity } from '../../generic/entities/generic.entity.js';

@Entity('reviews')
export class Review extends GenericEntity {
  @Column({ type: 'decimal' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ length: 20 })
  reviewerType: string; // 'client' or 'freelancer'

  @ManyToOne(() => Contract, (contract) => contract.reviews, {
    onDelete: 'CASCADE',
  })
  contract: Contract;

  @Column('uuid')
  contractId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  reviewer: User;

  @Column('uuid')
  reviewerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  reviewed: User;

  @Column('uuid')
  reviewedId: string;
}
