import { UpdateProviderUseCase } from './update-provider.use-case';

const provider = { id: 'prov-1', userId: 'user-1', bio: 'Old bio', status: 'APPROVED' };

describe('UpdateProviderUseCase', () => {
  let useCase: UpdateProviderUseCase;
  let mockRepo: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockRepo = { findById: jest.fn(), update: jest.fn() };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new UpdateProviderUseCase(mockRepo, mockLogProvider);
  });

  it('updates provider when found', async () => {
    mockRepo.findById.mockResolvedValue(provider);
    mockRepo.update.mockResolvedValue({ ...provider, bio: 'New bio' });
    const result = await useCase.execute({ id: 'prov-1', bio: 'New bio' });
    expect(result.bio).toBe('New bio');
    expect(mockRepo.update).toHaveBeenCalledWith('prov-1', { bio: 'New bio' });
  });

  it('throws when provider not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'prov-1', bio: 'New bio' })).rejects.toThrow();
    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});
