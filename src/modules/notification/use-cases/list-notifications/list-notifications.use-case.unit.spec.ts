import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { NOTIFICATION_REPOSITORY_PROVIDE } from '../../notification.token';
import {
  LIST_NOTIFICATIONS_LOG_CONTEXT,
  LIST_NOTIFICATIONS_LOG_MESSAGES,
} from './list-notifications-constants';
import { ListNotificationsUseCase } from './list-notifications.use-case';

const mockNotificationRepository = { listByUser: jest.fn() };
const mockLogProvider = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const mockNotifications = {
  data: [
    {
      id: 'id-1',
      userId: 'user-1',
      title: 'Test',
      message: 'Test message',
      isRead: false,
    },
  ],
  total: 1,
};

describe('ListNotificationsUseCase', () => {
  let useCase: ListNotificationsUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ListNotificationsUseCase,
        { provide: NOTIFICATION_REPOSITORY_PROVIDE, useValue: mockNotificationRepository },
        { provide: LOGGER_PROVIDER, useValue: mockLogProvider },
      ],
    }).compile();
    useCase = module.get(ListNotificationsUseCase);
    jest.clearAllMocks();
  });

  it('returns notifications when found', async () => {
    mockNotificationRepository.listByUser.mockResolvedValue(mockNotifications);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toEqual(mockNotifications);
    expect(mockNotificationRepository.listByUser).toHaveBeenCalledWith('user-1');
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: LIST_NOTIFICATIONS_LOG_MESSAGES.START_FLOW,
        context: LIST_NOTIFICATIONS_LOG_CONTEXT,
      }),
    );
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: LIST_NOTIFICATIONS_LOG_MESSAGES.LISTED_SUCCESS,
        context: LIST_NOTIFICATIONS_LOG_CONTEXT,
      }),
    );
  });

  it('throws NotFoundException when notifications is null', async () => {
    mockNotificationRepository.listByUser.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'unknown' })).rejects.toThrow(NotFoundException);
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: LIST_NOTIFICATIONS_LOG_MESSAGES.NOT_FOUND_NOTIFICATION,
        context: LIST_NOTIFICATIONS_LOG_CONTEXT,
      }),
    );
  });
});
