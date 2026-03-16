import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity.js';
import { ClientProfile } from '../profiles/entities/client-profile.entity.js';
import { FreelancerProfile } from '../profiles/entities/freelancer-profile.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { Proposal } from '../proposals/entities/proposal.entity.js';
import { Contract } from '../contracts/entities/contract.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';
import { Review } from '../reviews/entities/review.entity.js';
import { Notification } from '../notifications/entities/notification.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'bom_de_freela'),
        entities: [
          User,
          ClientProfile,
          FreelancerProfile,
          Category,
          Project,
          Proposal,
          Contract,
          Payment,
          Review,
          Notification,
        ],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      ClientProfile,
      FreelancerProfile,
      Category,
      Project,
      Proposal,
      Contract,
      Payment,
      Review,
      Notification,
    ]),
  ],
})
export class DatabaseModule {}
