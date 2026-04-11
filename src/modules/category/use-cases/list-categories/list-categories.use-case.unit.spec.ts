import { ListCategoriesUseCase } from './list-categories.use-case';

const categories = [{ id: 'cat-1', name: 'Limpeza', slug: 'limpeza', isActive: true }];

describe('ListCategoriesUseCase', () => {
  let useCase: ListCategoriesUseCase;
  let mockRepo: any;
  let mockCache: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockRepo = { listActive: jest.fn() };
    mockCache = { get: jest.fn(), set: jest.fn().mockResolvedValue(null) };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new ListCategoriesUseCase(mockRepo, mockCache, mockLogProvider);
  });

  it('returns cached result when available', async () => {
    mockCache.get.mockResolvedValue(categories);
    const result = await useCase.execute();
    expect(result).toEqual(categories);
    expect(mockRepo.listActive).not.toHaveBeenCalled();
  });

  it('fetches from db and caches when cache is empty', async () => {
    mockCache.get.mockResolvedValue(null);
    mockRepo.listActive.mockResolvedValue(categories);
    const result = await useCase.execute();
    expect(result).toEqual(categories);
    expect(mockRepo.listActive).toHaveBeenCalled();
    expect(mockCache.set).toHaveBeenCalledWith('api:categories', categories, 300);
  });
});
