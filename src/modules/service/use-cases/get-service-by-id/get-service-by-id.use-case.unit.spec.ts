import { GetServiceByIdUseCase } from './get-service-by-id.use-case';

const service = { id: 'svc-1', categoryId: 'cat-1', name: 'Faxina' };

describe('GetServiceByIdUseCase', () => {
  let useCase: GetServiceByIdUseCase;
  let mockRepo: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockRepo = { findById: jest.fn() };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new GetServiceByIdUseCase(mockRepo, mockLogProvider);
  });

  it('returns service when found', async () => {
    mockRepo.findById.mockResolvedValue(service);
    expect(await useCase.execute({ id: 'svc-1' })).toEqual(service);
  });

  it('throws when service not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown' })).rejects.toThrow();
  });
});
