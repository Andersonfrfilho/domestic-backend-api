import { GetCategoryByIdUseCase } from './get-category-by-id.use-case';

const category = { id: 'cat-1', name: 'Limpeza', slug: 'limpeza', isActive: true };

describe('GetCategoryByIdUseCase', () => {
  let useCase: GetCategoryByIdUseCase;
  let mockRepo: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockRepo = { findById: jest.fn() };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new GetCategoryByIdUseCase(mockRepo, mockLogProvider);
  });

  it('returns category when found', async () => {
    mockRepo.findById.mockResolvedValue(category);
    expect(await useCase.execute({ id: 'cat-1' })).toEqual(category);
  });

  it('throws notFound when category does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown' })).rejects.toThrow();
  });
});
