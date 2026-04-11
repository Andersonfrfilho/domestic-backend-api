import { ApproveProviderUseCase } from './approve-provider.use-case';

const provider = { id: 'prov-1', userId: 'user-1' };

describe('ApproveProviderUseCase', () => {
  let useCase: ApproveProviderUseCase;
  let mockRepo: any;
  let mockProducer: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockRepo = { findById: jest.fn(), getLatestVerification: jest.fn(), updateVerification: jest.fn() };
    mockProducer = { send: jest.fn().mockResolvedValue({ success: true }) };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new ApproveProviderUseCase(mockRepo, mockProducer, mockLogProvider);
  });

  it('approves provider and publishes event', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.getLatestVerification.mockResolvedValue({ id: 'ver-1', status: 'UNDER_REVIEW' });
    mockRepo.updateVerification.mockResolvedValue({ id: 'ver-1', status: 'APPROVED' });
    const result = await useCase.execute({ providerId: 'prov-1', reviewedBy: 'admin-1' });
    expect(result.status).toBe('APPROVED');
    expect(mockProducer.send).toHaveBeenCalled();
  });

  it('throws when verification is not UNDER_REVIEW', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.getLatestVerification.mockResolvedValue({ id: 'ver-1', status: 'PENDING' });
    await expect(useCase.execute({ providerId: 'prov-1', reviewedBy: 'admin-1' })).rejects.toThrow();
    expect(mockRepo.updateVerification).not.toHaveBeenCalled();
  });

  it('throws when provider not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ providerId: 'unknown', reviewedBy: 'admin-1' })).rejects.toThrow();
  });
});
