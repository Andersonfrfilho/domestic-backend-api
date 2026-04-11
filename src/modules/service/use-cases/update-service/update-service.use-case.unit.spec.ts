import { UpdateServiceUseCase } from './update-service.use-case';

const service = { id: 'svc-1', categoryId: 'cat-1', name: 'Faxina' };
const category = { id: 'cat-1', name: 'Limpeza' };

describe('UpdateServiceUseCase', () => {
  let useCase: UpdateServiceUseCase;
  let mockServiceRepo: any;
  let mockCategoryRepo: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockServiceRepo = { findById: jest.fn(), update: jest.fn() };
    mockCategoryRepo = { findById: jest.fn() };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new UpdateServiceUseCase(mockServiceRepo, mockCategoryRepo, mockLogProvider);
  });

  it('updates service name without category change', async () => {
    mockServiceRepo.findById.mockResolvedValue(service);
    mockServiceRepo.update.mockResolvedValue({ ...service, name: 'Faxina Completa' });
    const result = await useCase.execute({ id: 'svc-1', name: 'Faxina Completa' });
    expect(result.name).toBe('Faxina Completa');
    expect(mockCategoryRepo.findById).not.toHaveBeenCalled();
  });

  it('validates category when categoryId is updated', async () => {
    mockServiceRepo.findById.mockResolvedValue(service);
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockServiceRepo.update.mockResolvedValue({ ...service, categoryId: 'cat-2' });
    await useCase.execute({ id: 'svc-1', categoryId: 'cat-2' });
    expect(mockCategoryRepo.findById).toHaveBeenCalledWith('cat-2');
  });

  it('throws when service not found', async () => {
    mockServiceRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'svc-1', name: 'x' })).rejects.toThrow();
    expect(mockServiceRepo.update).not.toHaveBeenCalled();
  });

  it('throws when new category does not exist', async () => {
    mockServiceRepo.findById.mockResolvedValue(service);
    mockCategoryRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'svc-1', categoryId: 'bad-cat' })).rejects.toThrow();
    expect(mockServiceRepo.update).not.toHaveBeenCalled();
  });
});
