import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Test } from '@nestjs/testing';

import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '@modules/service-request/service-request.token';

import { REVIEW_REPOSITORY_PROVIDE } from '../../review.token';
import {
  CREATE_REVIEW_LOG_CONTEXT,
  CREATE_REVIEW_LOG_MESSAGES,
} from './create-review.constants';
import { CreateReviewUseCase } from './create-review.use-case';

const mockReviewRepo = { findByServiceRequestId: jest.fn(), create: jest.fn() };
const mockSrRepo = { findById: jest.fn() };
const mockLogProvider = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const completedSr = { id: 'sr-1', contractorId: 'user-1', providerId: 'prov-1', status: 'COMPLETED' };

describe('CreateReviewUseCase', () => {
  let useCase: CreateReviewUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateReviewUseCase,
        { provide: REVIEW_REPOSITORY_PROVIDE, useValue: mockReviewRepo },
        { provide: SERVICE_REQUEST_REPOSITORY_PROVIDE, useValue: mockSrRepo },
        { provide: LOGGER_PROVIDER, useValue: mockLogProvider },
      ],
    }).compile();
    useCase = module.get(CreateReviewUseCase);
    jest.clearAllMocks();
  });

  it('creates review for completed service request', async () => {
    mockSrRepo.findById.mockResolvedValue(completedSr);
    mockReviewRepo.findByServiceRequestId.mockResolvedValue(null);
    mockReviewRepo.create.mockResolvedValue({
      id: 'rev-1',
      serviceRequestId: 'sr-1',
      contractorId: 'user-1',
      providerId: 'prov-1',
      rating: 5,
      comment: 'Great!',
    });

    const result = await useCase.execute({
      serviceRequestId: 'sr-1',
      contractorId: 'user-1',
      rating: 5,
      comment: 'Great!',
    });

    expect(result.id).toBe('rev-1');
    expect(mockReviewRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ providerId: 'prov-1', rating: 5 }),
    );
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: CREATE_REVIEW_LOG_MESSAGES.START_FLOW,
        context: CREATE_REVIEW_LOG_CONTEXT,
      }),
    );
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: CREATE_REVIEW_LOG_MESSAGES.SUCCESS,
        context: CREATE_REVIEW_LOG_CONTEXT,
      }),
    );
  });

  it('throws when service request is not COMPLETED', async () => {
    mockSrRepo.findById.mockResolvedValue({ ...completedSr, status: 'ACCEPTED' });
    await expect(
      useCase.execute({ serviceRequestId: 'sr-1', contractorId: 'user-1', rating: 5 }),
    ).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: CREATE_REVIEW_LOG_MESSAGES.SERVICE_REQUEST_NOT_COMPLETED,
        context: CREATE_REVIEW_LOG_CONTEXT,
      }),
    );
  });

  it('throws when service request not found', async () => {
    mockSrRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ serviceRequestId: 'sr-1', contractorId: 'user-1', rating: 5 }),
    ).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: CREATE_REVIEW_LOG_MESSAGES.SERVICE_REQUEST_NOT_COMPLETED,
        context: CREATE_REVIEW_LOG_CONTEXT,
      }),
    );
  });

  it('throws when review already exists', async () => {
    mockSrRepo.findById.mockResolvedValue(completedSr);
    mockReviewRepo.findByServiceRequestId.mockResolvedValue({ id: 'existing-rev' });
    await expect(
      useCase.execute({ serviceRequestId: 'sr-1', contractorId: 'user-1', rating: 4 }),
    ).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: CREATE_REVIEW_LOG_MESSAGES.ALREADY_EXISTS,
        context: CREATE_REVIEW_LOG_CONTEXT,
      }),
    );
  });
});
