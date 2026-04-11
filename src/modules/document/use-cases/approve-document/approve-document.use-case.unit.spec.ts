import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Test } from '@nestjs/testing';

import { DOCUMENT_REPOSITORY_PROVIDE } from '../../document.token';
import {
  APPROVE_DOCUMENT_LOG_MESSAGES,
} from './approve-document.constants';
import { ApproveDocumentUseCase } from './approve-document.use-case';

const mockRepo = { findById: jest.fn(), updateStatus: jest.fn() };
const mockLogProvider = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const pendingDoc = { id: 'doc-1', userId: 'user-1', status: 'PENDING', type: 'ID' };

describe('ApproveDocumentUseCase', () => {
  let useCase: ApproveDocumentUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ApproveDocumentUseCase,
        { provide: DOCUMENT_REPOSITORY_PROVIDE, useValue: mockRepo },
        { provide: LOGGER_PROVIDER, useValue: mockLogProvider },
      ],
    }).compile();
    useCase = module.get(ApproveDocumentUseCase);
    jest.clearAllMocks();
  });

  it('approves a PENDING document', async () => {
    mockRepo.findById.mockResolvedValue(pendingDoc);
    mockRepo.updateStatus.mockResolvedValue({ ...pendingDoc, status: 'APPROVED', reviewedAt: new Date() });

    const result = await useCase.execute({ id: 'doc-1' });

    expect(result.status).toBe('APPROVED');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('doc-1', 'APPROVED', expect.any(Date));
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: APPROVE_DOCUMENT_LOG_MESSAGES.START_FLOW,
        context: 'ApproveDocumentUseCase.execute',
      }),
    );
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: APPROVE_DOCUMENT_LOG_MESSAGES.SUCCESS,
        context: 'ApproveDocumentUseCase.execute',
      }),
    );
  });

  it('throws when document not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'doc-1' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: APPROVE_DOCUMENT_LOG_MESSAGES.NOT_FOUND,
        context: 'ApproveDocumentUseCase.execute',
      }),
    );
  });

  it('throws when document is not PENDING', async () => {
    mockRepo.findById.mockResolvedValue({ ...pendingDoc, status: 'APPROVED' });
    await expect(useCase.execute({ id: 'doc-1' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: APPROVE_DOCUMENT_LOG_MESSAGES.INVALID_STATUS,
        context: 'ApproveDocumentUseCase.execute',
      }),
    );
  });
});
