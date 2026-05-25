import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Test } from '@nestjs/testing';

import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';
import {
  ACCEPT_SERVICE_REQUEST_LOG_MESSAGES,
} from './accept-service-request.constants';
import { AcceptServiceRequestUseCase } from './accept-service-request.use-case';

const mockRepo = { findById: jest.fn(), updateStatus: jest.fn() };
const mockLogProvider = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const pendingSr = { id: 'sr-1', providerId: 'prov-1', contractorId: 'user-1', status: 'PENDING' };

describe('AcceptServiceRequestUseCase', () => {
  let useCase: AcceptServiceRequestUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AcceptServiceRequestUseCase,
        { provide: SERVICE_REQUEST_REPOSITORY_PROVIDE, useValue: mockRepo },
        { provide: LOGGER_PROVIDER, useValue: mockLogProvider },
      ],
    }).compile();
    useCase = module.get(AcceptServiceRequestUseCase);
    jest.clearAllMocks();
  });

  it('accepts a PENDING request by the correct provider', async () => {
    mockRepo.findById.mockResolvedValue(pendingSr);
    mockRepo.updateStatus.mockResolvedValue({ ...pendingSr, status: 'ACCEPTED' });

    const result = await useCase.execute({ id: 'sr-1', providerId: 'prov-1' });

    expect(result.status).toBe('ACCEPTED');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('sr-1', 'ACCEPTED');
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ACCEPT_SERVICE_REQUEST_LOG_MESSAGES.START_FLOW,
        context: 'AcceptServiceRequestUseCase.execute',
      }),
    );
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ACCEPT_SERVICE_REQUEST_LOG_MESSAGES.SUCCESS,
        context: 'AcceptServiceRequestUseCase.execute',
      }),
    );
  });

  it('throws when provider is not the owner', async () => {
    mockRepo.findById.mockResolvedValue(pendingSr);
    await expect(useCase.execute({ id: 'sr-1', providerId: 'other-prov' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ACCEPT_SERVICE_REQUEST_LOG_MESSAGES.NOT_AUTHORIZED,
        context: 'AcceptServiceRequestUseCase.execute',
      }),
    );
  });

  it('throws when status is not PENDING', async () => {
    mockRepo.findById.mockResolvedValue({ ...pendingSr, status: 'ACCEPTED' });
    await expect(useCase.execute({ id: 'sr-1', providerId: 'prov-1' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ACCEPT_SERVICE_REQUEST_LOG_MESSAGES.INVALID_STATUS,
        context: 'AcceptServiceRequestUseCase.execute',
      }),
    );
  });

  it('throws when service request not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown', providerId: 'prov-1' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ACCEPT_SERVICE_REQUEST_LOG_MESSAGES.NOT_FOUND,
        context: 'AcceptServiceRequestUseCase.execute',
      }),
    );
  });
});
