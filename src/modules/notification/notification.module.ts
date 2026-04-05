import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Notification } from '@modules/shared/providers/database/entities/notification.entity';
import { SharedModule } from '@modules/shared/shared.module';
import { UserModule } from '@modules/user/user.module';

import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { NotificationController } from './notification.controller';
import { NotificationRepository } from './notification.repository';
import { NotificationService } from './notification.service';
import {
  NOTIFICATION_LIST_USE_CASE_PROVIDE,
  NOTIFICATION_MARK_READ_USE_CASE_PROVIDE,
  NOTIFICATION_REPOSITORY_PROVIDE,
  NOTIFICATION_SERVICE_PROVIDE,
} from './notification.token';
import { ListNotificationsUseCase } from './use-cases/list-notifications/list-notifications.use-case';
import { MarkNotificationReadUseCase } from './use-cases/mark-notification-read/mark-notification-read.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification], CONNECTIONS_NAMES.MONGO),
    SharedModule,
    UserModule,
  ],
  controllers: [NotificationController],
  providers: [
    { provide: NOTIFICATION_REPOSITORY_PROVIDE, useClass: NotificationRepository },
    { provide: NOTIFICATION_LIST_USE_CASE_PROVIDE, useClass: ListNotificationsUseCase },
    { provide: NOTIFICATION_MARK_READ_USE_CASE_PROVIDE, useClass: MarkNotificationReadUseCase },
    { provide: NOTIFICATION_SERVICE_PROVIDE, useClass: NotificationService },
  ],
})
export class NotificationModule {}
