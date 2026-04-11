import { UpdateCategoryUseCase } from './update-category.use-case';

const category = { id: 'cat-1', name: 'Limpeza', slug: 'limpeza', isActive: true };

describe('UpdateCategoryUseCase', () => {
  let useCase: UpdateCategoryUseCase;
  let mockRepo: any;
  let mockCache: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockRepo = { findById: jest.fn(), findBySlug: jest.fn(), update: jest.fn() };
    mockCache = { del: jest.fn().mockResolvedValue(null) };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new UpdateCategoryUseCase(mockRepo, mockCache, mockLogProvider);
  });

  it('updates category and invalidates cache', async () => {
    mockRepo.findById.mockResolvedValue(category);
    mockRepo.update.mockResolvedValue({ ...category, name: 'Limpeza Pro' });
    const result = await useCase.execute({ id: 'cat-1', name: 'Limpeza Pro' });
    expect(result.name).toBe('Limpeza Pro');
    expect(mockCache.del).toHaveBeenCalled();
  });

  it('throws notFound when category does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown', name: 'X' })).rejects.toThrow();
  });

  it('throws conflict when new slug already exists', async () => {
    mockRepo.findById.mockResolvedValue(category);
    mockRepo.findBySlug.mockResolvedValue({ id: 'cat-2', slug: 'novo-slug' });
    await expect(useCase.execute({ id: 'cat-1', slug: 'novo-slug' })).rejects.toThrow();
    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});
