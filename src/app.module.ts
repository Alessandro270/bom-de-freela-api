import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ProfilesModule } from './profiles/profiles.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { ProposalsModule } from './proposals/proposals.module.js';
import { ContractsModule } from './contracts/contracts.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { AdminModule } from './admin/admin.module.js';
import { MailModule } from './mail/mail.module.js';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    MailModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    CategoriesModule,
    ProjectsModule,
    ProposalsModule,
    ContractsModule,
    PaymentsModule,
    ReviewsModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
