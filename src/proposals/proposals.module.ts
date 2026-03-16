import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalsService } from './proposals.service.js';
import { ProposalsController } from './proposals.controller.js';
import { Proposal } from './entities/proposal.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { FreelancerProfile } from '../profiles/entities/freelancer-profile.entity.js';
import { Contract } from '../contracts/entities/contract.entity.js';
import { Notification } from '../notifications/entities/notification.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Proposal,
      Project,
      FreelancerProfile,
      Contract,
      Notification,
    ]),
  ],
  controllers: [ProposalsController],
  providers: [ProposalsService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
