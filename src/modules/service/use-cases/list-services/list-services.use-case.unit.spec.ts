import { ListServicesUseCase } from './list-services.use-case';

const services = [
  { id: 'svc-1', categoryId: 'cat-1', name: 'Faxina' },
  { id: 'svc-2', categoryId: 'cat-2', name: 'Encanamento' },
];

describe('ListServicesUseCase', () => {
  let useCase: ListServicesUseCase;
  let mockRepo: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockRepo = { list: jest.fn(), findByCategory: jest.fn() };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new ListServicesUseCase(mockRepo, mockLogProvider);
  });

  it('lists all services when no categoryId provided', async () => {
    mockRepo.list.mockResolvedValue(services);
    const result = await useCase.execute({});
    expect(result).toEqual(services);
    expect(mockRepo.list).toHaveBeenCalled();
    expect(mockRepo.findByCategory).not.toHaveBeenCalled();
  });

  it('filters by category when categoryId provided', async () => {
    const filtered = services.filter((s) => s.categoryId === 'cat-1');
    mockRepo.findByCategory.mockResolvedValue(filtered);
    const result = await useCase.execute({ categoryId: 'cat-1' });
    expect(result).toEqual(filtered);
    expect(mockRepo.findByCategory).toHaveBeenCalledWith('cat-1');
    expect(mockRepo.list).not.toHaveBeenCalled();
  });
});
