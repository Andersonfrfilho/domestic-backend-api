import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/shared';

import type { LogProviderInterface } from '@app/modules/shared';

import { type NotificationRepositoryInterface } from '../../notification.repository.interface';
import { NOTIFICATION_REPOSITORY_PROVIDE } from '../../notification.token';

import { LIST_NOTIFICATIONS_LOG_MESSAGES } from './list-notifications-constants';
import {
  ListNotificationsUseCaseInterface,
  ListNotificationsUseCaseParams,
  ListNotificationsUseCaseResponse,
} from './list-notifications.interface';

@Injectable()
export class ListNotificationsUseCase implements ListNotificationsUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(NOTIFICATION_REPOSITORY_PROVIDE)
    private readonly notificationRepository: NotificationRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: ListNotificationsUseCaseParams): Promise<ListNotificationsUseCaseResponse> {
    this.logProvider.info({
      message: LIST_NOTIFICATIONS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: {
        userId: params.userId,
      },
    });
    const notifications = await this.notificationRepository.listByUser(params.userId);

    if (!notifications) {
      this.logProvider.warn({
        message: LIST_NOTIFICATIONS_LOG_MESSAGES.NOT_FOUND_NOTIFICATION,
        context: this.logContext,
        meta: { userId: params.userId },
      });

      throw new NotFoundException(LIST_NOTIFICATIONS_LOG_MESSAGES.NOT_FOUND_NOTIFICATION);
    }

    this.logProvider.info({
      message: LIST_NOTIFICATIONS_LOG_MESSAGES.LISTED_SUCCESS,
      context: this.logContext,
      meta: {
        userId: params.userId,
      },
    });

    return notifications;
  }
}
