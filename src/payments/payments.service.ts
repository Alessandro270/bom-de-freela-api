import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity.js';
import { Contract } from '../contracts/entities/contract.entity.js';
import { Notification } from '../notifications/entities/notification.entity.js';
import { CreatePaymentDto } from './dto/payment.dto.js';
import { ContractStatus } from '../common/enums/contract-status.enum.js';
import { PaymentStatus } from '../common/enums/payment-status.enum.js';
import { NotificationType } from '../common/enums/notification-type.enum.js';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(userId: string, dto: CreatePaymentDto): Promise<Payment> {
    const contract = await this.contractRepository.findOne({
      where: { id: dto.contractId },
      relations: ['clientProfile', 'freelancerProfile', 'payment', 'project'],
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    // Apenas o cliente pode efetuar pagamento
    if (contract.clientProfile.userId !== userId) {
      throw new ForbiddenException('Apenas o cliente pode efetuar o pagamento');
    }

    // Apenas contratos concluídos
    if (contract.status !== ContractStatus.CONCLUIDO) {
      throw new BadRequestException(
        'O pagamento só pode ser efetuado para contratos concluídos',
      );
    }

    // Um contrato só pode ter um pagamento
    if (contract.payment) {
      throw new ConflictException(
        'Este contrato já possui um pagamento registado',
      );
    }

    // O valor não pode ser inferior ao valor do contrato
    if (dto.amount < Number(contract.value)) {
      throw new BadRequestException(
        `O valor pago não pode ser inferior ao valor do contrato (${contract.value})`,
      );
    }

    const payment = this.paymentRepository.create({
      contractId: contract.id,
      amount: dto.amount,
      status: PaymentStatus.PAGO,
      paidAt: new Date(),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Notificar o freelancer
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: contract.freelancerProfile.userId,
        type: NotificationType.PAGAMENTO_RECEBIDO,
        message: `Pagamento de ${dto.amount}€ recebido pelo projeto "${contract.project.title}"`,
      }),
    );

    return savedPayment;
  }

  async getHistory(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: [
        { contract: { clientProfile: { userId } } },
        { contract: { freelancerProfile: { userId } } },
      ],
      relations: [
        'contract',
        'contract.project',
        'contract.clientProfile',
        'contract.clientProfile.user',
        'contract.freelancerProfile',
        'contract.freelancerProfile.user',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: [
        'contract',
        'contract.project',
        'contract.clientProfile',
        'contract.clientProfile.user',
        'contract.freelancerProfile',
        'contract.freelancerProfile.user',
      ],
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return payment;
  }
}
