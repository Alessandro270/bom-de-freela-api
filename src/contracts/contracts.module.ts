import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsService } from './contracts.service.js';
import { ContractsController } from './contracts.controller.js';
import { Contract } from './entities/contract.entity.js';
import { Notification } from '../notifications/entities/notification.entity.js';
import { Project } from '../projects/entities/project.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Notification, Project])],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
