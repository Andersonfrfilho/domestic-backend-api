import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Test } from '@nestjs/testing';

import { DOCUMENT_REPOSITORY_PROVIDE } from '../../document.token';
import {
  REJECT_DOCUMENT_LOG_MESSAGES,
} from './reject-document.constants';
import { RejectDocumentUseCase } from './reject-document.use-case';

const mockRepo = { findById: jest.fn(), updateStatus: jest.fn() };
const mockLogProvider = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const pendingDoc = { id: 'doc-1', userId: 'user-1', status: 'PENDING', type: 'ID' };

describe('RejectDocumentUseCase', () => {
  let useCase: RejectDocumentUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RejectDocumentUseCase,
        { provide: DOCUMENT_REPOSITORY_PROVIDE, useValue: mockRepo },
        { provide: LOGGER_PROVIDER, useValue: mockLogProvider },
      ],
    }).compile();
    useCase = module.get(RejectDocumentUseCase);
    jest.clearAllMocks();
  });

  it('rejects a PENDING document', async () => {
    mockRepo.findById.mockResolvedValue(pendingDoc);
    mockRepo.updateStatus.mockResolvedValue({ ...pendingDoc, status: 'REJECTED', reviewedAt: new Date() });

    const result = await useCase.execute({ id: 'doc-1' });

    expect(result.status).toBe('REJECTED');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('doc-1', 'REJECTED', expect.any(Date));
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: REJECT_DOCUMENT_LOG_MESSAGES.START_FLOW,
        context: 'RejectDocumentUseCase.execute',
      }),
    );
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: REJECT_DOCUMENT_LOG_MESSAGES.SUCCESS,
        context: 'RejectDocumentUseCase.execute',
      }),
    );
  });

  it('throws when document not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'doc-1' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: REJECT_DOCUMENT_LOG_MESSAGES.NOT_FOUND,
        context: 'RejectDocumentUseCase.execute',
      }),
    );
  });

  it('throws when document is not PENDING', async () => {
    mockRepo.findById.mockResolvedValue({ ...pendingDoc, status: 'APPROVED' });
    await expect(useCase.execute({ id: 'doc-1' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: REJECT_DOCUMENT_LOG_MESSAGES.INVALID_STATUS,
        context: 'RejectDocumentUseCase.execute',
      }),
    );
  });
});
