import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { PaymentStatus } from '../../common/enums/payment-status.enum.js';
import { Contract } from '../../contracts/entities/contract.entity.js';
import { GenericEntity } from '../../generic/entities/generic.entity.js';

@Entity('payments')
export class Payment extends GenericEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PAGO,
  })
  status: PaymentStatus;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  @OneToOne(() => Contract, (contract) => contract.payment)
  @JoinColumn()
  contract: Contract;

  @Column('uuid')
  contractId: string;
}
