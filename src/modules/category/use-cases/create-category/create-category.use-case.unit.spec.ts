import { CreateCategoryUseCase } from './create-category.use-case';

const category = { id: 'cat-1', name: 'Limpeza', slug: 'limpeza', isActive: true };

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
  let mockRepo: any;
  let mockCache: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockRepo = { findBySlug: jest.fn(), create: jest.fn() };
    mockCache = { del: jest.fn().mockResolvedValue(null) };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new CreateCategoryUseCase(mockRepo, mockCache, mockLogProvider);
  });

  it('creates category and invalidates cache', async () => {
    mockRepo.findBySlug.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue(category);
    const result = await useCase.execute({ name: 'Limpeza', slug: 'limpeza' });
    expect(result).toEqual(category);
    expect(mockCache.del).toHaveBeenCalledWith('api:categories');
  });

  it('throws conflict when slug already exists', async () => {
    mockRepo.findBySlug.mockResolvedValue(category);
    await expect(useCase.execute({ name: 'Limpeza', slug: 'limpeza' })).rejects.toThrow();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
