import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import type { LogProviderInterface } from '@app/modules/shared';

import { type NotificationRepositoryInterface } from '../../notification.repository.interface';
import { NOTIFICATION_REPOSITORY_PROVIDE } from '../../notification.token';

import {
  MARK_NOTIFICATION_READ_LOG_MESSAGES,
} from './mark-notification-read-constants.interface';
import {
  MarkNotificationReadUseCaseInterface,
  MarkNotificationReadUseCaseParams,
} from './mark-notification-read.interface';

@Injectable()
export class MarkNotificationReadUseCase implements MarkNotificationReadUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(NOTIFICATION_REPOSITORY_PROVIDE)
    private readonly notificationRepository: NotificationRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: MarkNotificationReadUseCaseParams): Promise<void> {
    this.logProvider.info({
      message: MARK_NOTIFICATION_READ_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: {
        id: params.id,
      },
    });

    await this.notificationRepository.markAsRead(new ObjectId(params.id));

    this.logProvider.info({
      message: MARK_NOTIFICATION_READ_LOG_MESSAGES.MARKED_SUCCESS,
      context: this.logContext,
      meta: {
        id: params.id,
      },
    });
  }
}
