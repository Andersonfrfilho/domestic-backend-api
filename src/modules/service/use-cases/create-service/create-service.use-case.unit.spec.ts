import { CreateServiceUseCase } from './create-service.use-case';

const category = { id: 'cat-1', name: 'Limpeza' };
const service = { id: 'svc-1', categoryId: 'cat-1', name: 'Faxina' };

describe('CreateServiceUseCase', () => {
  let useCase: CreateServiceUseCase;
  let mockServiceRepo: any;
  let mockCategoryRepo: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockServiceRepo = { create: jest.fn() };
    mockCategoryRepo = { findById: jest.fn() };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new CreateServiceUseCase(mockServiceRepo, mockCategoryRepo, mockLogProvider);
  });

  it('creates service when category exists', async () => {
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockServiceRepo.create.mockResolvedValue(service);
    const result = await useCase.execute({ categoryId: 'cat-1', name: 'Faxina' });
    expect(result).toEqual(service);
    expect(mockCategoryRepo.findById).toHaveBeenCalledWith('cat-1');
  });

  it('throws when category does not exist', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ categoryId: 'unknown', name: 'Faxina' })).rejects.toThrow();
    expect(mockServiceRepo.create).not.toHaveBeenCalled();
  });
});
