import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import { Notification } from '@modules/shared/providers/database/entities/notification.entity';

import {
  NOTIFICATION_LIST_USE_CASE_PROVIDE,
  NOTIFICATION_MARK_READ_USE_CASE_PROVIDE,
} from './notification.token';
import { type ListNotificationsUseCaseInterface } from './use-cases/list-notifications/list-notifications.interface';
import { type MarkNotificationReadUseCaseInterface } from './use-cases/mark-notification-read/mark-notification-read.interface';

export interface NotificationServiceInterface {
  @TraceMethod()
  list(userId: string): Promise<Notification[]>;
  @TraceMethod()
  markAsRead(id: string): Promise<void>;
}

@Injectable()
export class NotificationService implements NotificationServiceInterface {
  @TraceMethod()
  constructor(
    @Inject(NOTIFICATION_LIST_USE_CASE_PROVIDE)
    private readonly listUseCase: ListNotificationsUseCaseInterface,
    @Inject(NOTIFICATION_MARK_READ_USE_CASE_PROVIDE)
    private readonly markReadUseCase: MarkNotificationReadUseCaseInterface,
  ) {}

  @TraceMethod()
  list(userId: string): Promise<Notification[]> {
    return this.listUseCase.execute({ userId });
  }

  @TraceMethod()
  markAsRead(id: string): Promise<void> {
    return this.markReadUseCase.execute({ id });
  }
}
