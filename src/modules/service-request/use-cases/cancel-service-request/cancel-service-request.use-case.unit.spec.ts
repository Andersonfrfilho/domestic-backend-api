import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Test } from '@nestjs/testing';

import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';
import {
  CANCEL_SERVICE_REQUEST_LOG_MESSAGES,
} from './cancel-service-request.constants';
import { CancelServiceRequestUseCase } from './cancel-service-request.use-case';

const mockRepo = { findById: jest.fn(), updateStatus: jest.fn() };
const mockLogProvider = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const pendingSr = { id: 'sr-1', contractorId: 'user-1', providerId: 'prov-1', serviceId: 'svc-1', status: 'PENDING' };

describe('CancelServiceRequestUseCase', () => {
  let useCase: CancelServiceRequestUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CancelServiceRequestUseCase,
        { provide: SERVICE_REQUEST_REPOSITORY_PROVIDE, useValue: mockRepo },
        { provide: LOGGER_PROVIDER, useValue: mockLogProvider },
      ],
    }).compile();
    useCase = module.get(CancelServiceRequestUseCase);
    jest.clearAllMocks();
  });

  it('cancels PENDING request', async () => {
    mockRepo.findById.mockResolvedValue(pendingSr);
    mockRepo.updateStatus.mockResolvedValue({ ...pendingSr, status: 'CANCELLED' });

    const result = await useCase.execute({ id: 'sr-1', contractorId: 'user-1' });

    expect(result.status).toBe('CANCELLED');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('sr-1', 'CANCELLED');
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: CANCEL_SERVICE_REQUEST_LOG_MESSAGES.START_FLOW,
        context: 'CancelServiceRequestUseCase.execute',
      }),
    );
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: CANCEL_SERVICE_REQUEST_LOG_MESSAGES.SUCCESS,
        context: 'CancelServiceRequestUseCase.execute',
      }),
    );
  });

  it('cancels ACCEPTED request', async () => {
    mockRepo.findById.mockResolvedValue({ ...pendingSr, status: 'ACCEPTED' });
    mockRepo.updateStatus.mockResolvedValue({ ...pendingSr, status: 'CANCELLED' });

    const result = await useCase.execute({ id: 'sr-1', contractorId: 'user-1' });

    expect(result.status).toBe('CANCELLED');
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: CANCEL_SERVICE_REQUEST_LOG_MESSAGES.SUCCESS,
        context: 'CancelServiceRequestUseCase.execute',
      }),
    );
  });

  it('throws when contractor is not the owner', async () => {
    mockRepo.findById.mockResolvedValue(pendingSr);
    await expect(useCase.execute({ id: 'sr-1', contractorId: 'other-user' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: CANCEL_SERVICE_REQUEST_LOG_MESSAGES.NOT_AUTHORIZED,
        context: 'CancelServiceRequestUseCase.execute',
      }),
    );
  });

  it('throws when status is COMPLETED', async () => {
    mockRepo.findById.mockResolvedValue({ ...pendingSr, status: 'COMPLETED' });
    await expect(useCase.execute({ id: 'sr-1', contractorId: 'user-1' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: CANCEL_SERVICE_REQUEST_LOG_MESSAGES.INVALID_STATUS,
        context: 'CancelServiceRequestUseCase.execute',
      }),
    );
  });

  it('throws when not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'sr-1', contractorId: 'user-1' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: CANCEL_SERVICE_REQUEST_LOG_MESSAGES.NOT_FOUND,
        context: 'CancelServiceRequestUseCase.execute',
      }),
    );
  });
});
