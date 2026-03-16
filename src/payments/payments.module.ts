import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';
import { Payment } from './entities/payment.entity.js';
import { Contract } from '../contracts/entities/contract.entity.js';
import { Notification } from '../notifications/entities/notification.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Contract, Notification])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
