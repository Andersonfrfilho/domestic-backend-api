import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Test } from '@nestjs/testing';

import { QUEUE_PRODUCER_PROVIDER } from '@modules/shared/providers/queue/producer/producer.token';

import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '../../service-request.token';
import {
  COMPLETE_SERVICE_REQUEST_LOG_MESSAGES,
} from './complete-service-request.constants';
import { CompleteServiceRequestUseCase } from './complete-service-request.use-case';

const mockRepo = { findById: jest.fn(), updateStatus: jest.fn() };
const mockProducer = { send: jest.fn().mockResolvedValue({ success: true }) };
const mockLogProvider = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const acceptedSr = { id: 'sr-1', contractorId: 'user-1', providerId: 'prov-1', serviceId: 'svc-1', status: 'ACCEPTED' };

describe('CompleteServiceRequestUseCase', () => {
  let useCase: CompleteServiceRequestUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CompleteServiceRequestUseCase,
        { provide: SERVICE_REQUEST_REPOSITORY_PROVIDE, useValue: mockRepo },
        { provide: QUEUE_PRODUCER_PROVIDER, useValue: mockProducer },
        { provide: LOGGER_PROVIDER, useValue: mockLogProvider },
      ],
    }).compile();
    useCase = module.get(CompleteServiceRequestUseCase);
    jest.clearAllMocks();
    mockProducer.send.mockResolvedValue({ success: true });
  });

  it('completes ACCEPTED request and publishes event', async () => {
    mockRepo.findById.mockResolvedValue(acceptedSr);
    mockRepo.updateStatus.mockResolvedValue({ ...acceptedSr, status: 'COMPLETED' });

    const result = await useCase.execute({ id: 'sr-1', contractorId: 'user-1' });

    expect(result.status).toBe('COMPLETED');
    expect(mockProducer.send).toHaveBeenCalled();
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: COMPLETE_SERVICE_REQUEST_LOG_MESSAGES.START_FLOW,
        context: 'CompleteServiceRequestUseCase.execute',
      }),
    );
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: COMPLETE_SERVICE_REQUEST_LOG_MESSAGES.SUCCESS,
        context: 'CompleteServiceRequestUseCase.execute',
      }),
    );
  });

  it('throws when contractor is not the owner', async () => {
    mockRepo.findById.mockResolvedValue(acceptedSr);
    await expect(useCase.execute({ id: 'sr-1', contractorId: 'other-user' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: COMPLETE_SERVICE_REQUEST_LOG_MESSAGES.NOT_AUTHORIZED,
        context: 'CompleteServiceRequestUseCase.execute',
      }),
    );
  });

  it('throws when status is not ACCEPTED', async () => {
    mockRepo.findById.mockResolvedValue({ ...acceptedSr, status: 'PENDING' });
    await expect(useCase.execute({ id: 'sr-1', contractorId: 'user-1' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: COMPLETE_SERVICE_REQUEST_LOG_MESSAGES.INVALID_STATUS,
        context: 'CompleteServiceRequestUseCase.execute',
      }),
    );
  });
});
