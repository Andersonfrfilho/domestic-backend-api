import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Test } from '@nestjs/testing';

import { NOTIFICATION_REPOSITORY_PROVIDE } from '../../notification.token';
import {
  MARK_NOTIFICATION_READ_LOG_CONTEXT,
  MARK_NOTIFICATION_READ_LOG_MESSAGES,
} from './mark-notification-read-constants.interface';
import { MarkNotificationReadUseCase } from './mark-notification-read.use-case';

const mockNotificationRepository = { markAsRead: jest.fn() };
const mockLogProvider = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

describe('MarkNotificationReadUseCase', () => {
  let useCase: MarkNotificationReadUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MarkNotificationReadUseCase,
        { provide: NOTIFICATION_REPOSITORY_PROVIDE, useValue: mockNotificationRepository },
        { provide: LOGGER_PROVIDER, useValue: mockLogProvider },
      ],
    }).compile();
    useCase = module.get(MarkNotificationReadUseCase);
    jest.clearAllMocks();
  });

  it('marks notification as read', async () => {
    mockNotificationRepository.markAsRead.mockResolvedValue(undefined);

    await useCase.execute({ id: '65f6c01b6b1243f2bfe779b3' });

    expect(mockNotificationRepository.markAsRead).toHaveBeenCalled();
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: MARK_NOTIFICATION_READ_LOG_MESSAGES.START_FLOW,
        context: MARK_NOTIFICATION_READ_LOG_CONTEXT,
      }),
    );
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: MARK_NOTIFICATION_READ_LOG_MESSAGES.MARKED_SUCCESS,
        context: MARK_NOTIFICATION_READ_LOG_CONTEXT,
      }),
    );
  });
});
