import { DeleteCategoryUseCase } from './delete-category.use-case';

const category = { id: 'cat-1', name: 'Limpeza', slug: 'limpeza', isActive: true };

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;
  let mockRepo: any;
  let mockCache: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockRepo = { findById: jest.fn(), deactivate: jest.fn().mockResolvedValue(undefined) };
    mockCache = { del: jest.fn().mockResolvedValue(null) };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new DeleteCategoryUseCase(mockRepo, mockCache, mockLogProvider);
  });

  it('deactivates category and invalidates cache', async () => {
    mockRepo.findById.mockResolvedValue(category);
    await useCase.execute({ id: 'cat-1' });
    expect(mockRepo.deactivate).toHaveBeenCalledWith('cat-1');
    expect(mockCache.del).toHaveBeenCalled();
  });

  it('throws notFound when category does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown' })).rejects.toThrow();
    expect(mockRepo.deactivate).not.toHaveBeenCalled();
  });
});
