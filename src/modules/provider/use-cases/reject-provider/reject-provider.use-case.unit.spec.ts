import { RejectProviderUseCase } from './reject-provider.use-case';

const provider = { id: 'prov-1', userId: 'user-1' };
const verification = { id: 'verif-1', providerId: 'prov-1', status: 'UNDER_REVIEW' };

describe('RejectProviderUseCase', () => {
  let useCase: RejectProviderUseCase;
  let mockRepo: any;
  let mockProducer: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockRepo = { findById: jest.fn(), getLatestVerification: jest.fn(), updateVerification: jest.fn() };
    mockProducer = { send: jest.fn().mockResolvedValue({ success: true }) };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new RejectProviderUseCase(mockRepo, mockProducer, mockLogProvider);
  });

  it('rejects provider under review and publishes event', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.getLatestVerification.mockResolvedValue(verification);
    mockRepo.updateVerification.mockResolvedValue({ ...verification, status: 'REJECTED', notes: 'Docs incomplete' });
    const result = await useCase.execute({ providerId: 'prov-1', reviewedBy: 'admin-1', reason: 'Docs incomplete' });
    expect(result.status).toBe('REJECTED');
    expect(mockRepo.updateVerification).toHaveBeenCalledWith('verif-1', expect.objectContaining({ status: 'REJECTED' }));
    expect(mockProducer.send).toHaveBeenCalled();
  });

  it('throws when provider not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ providerId: 'prov-1', reviewedBy: 'admin-1', reason: 'x' })).rejects.toThrow();
  });

  it('throws when no verification exists', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.getLatestVerification.mockResolvedValue(null);
    await expect(useCase.execute({ providerId: 'prov-1', reviewedBy: 'admin-1', reason: 'x' })).rejects.toThrow();
  });

  it('throws when verification is not UNDER_REVIEW', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.getLatestVerification.mockResolvedValue({ ...verification, status: 'APPROVED' });
    await expect(useCase.execute({ providerId: 'prov-1', reviewedBy: 'admin-1', reason: 'x' })).rejects.toThrow();
  });
});
