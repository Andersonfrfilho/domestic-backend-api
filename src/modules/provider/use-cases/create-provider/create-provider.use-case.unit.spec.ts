import { CreateProviderUseCase } from './create-provider.use-case';

const provider = { id: 'prov-1', userId: 'user-1', businessName: 'Minha Empresa' };

describe('CreateProviderUseCase', () => {
  let useCase: CreateProviderUseCase;
  let mockRepo: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockRepo = { findByUserId: jest.fn(), create: jest.fn(), createVerification: jest.fn().mockResolvedValue({ id: 'ver-1', status: 'PENDING' }) };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new CreateProviderUseCase(mockRepo, mockLogProvider);
  });

  it('creates provider and initial verification', async () => {
    mockRepo.findByUserId.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue(provider);
    const result = await useCase.execute({ userId: 'user-1' });
    expect(result).toEqual(provider);
    expect(mockRepo.createVerification).toHaveBeenCalledWith({ providerId: 'prov-1', status: 'PENDING' });
  });

  it('throws conflict when provider already exists for user', async () => {
    mockRepo.findByUserId.mockResolvedValue(provider);
    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
