import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service.js';
import { AdminController } from './admin.controller.js';
import { User } from '../users/entities/user.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { Contract } from '../contracts/entities/contract.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, Contract, Payment])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
