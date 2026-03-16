import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesService } from './profiles.service.js';
import { ProfilesController } from './profiles.controller.js';
import { ClientProfile } from './entities/client-profile.entity.js';
import { FreelancerProfile } from './entities/freelancer-profile.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ClientProfile, FreelancerProfile])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
