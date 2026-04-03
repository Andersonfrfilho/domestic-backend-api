import { FindUserByIdUseCase } from './find-user-by-id.use-case';
import { UserRepositoryInterface } from '@modules/user/domain/repositories/user.repository.interface';
import { User } from '@modules/shared/domain/entities/user.entity';

describe('FindUserByIdUseCase', () => {
  let useCase: FindUserByIdUseCase;
  let mockUserRepository: jest.Mocked<UserRepositoryInterface>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByKeycloakId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new FindUserByIdUseCase(mockUserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call userRepository.findById and return the user', async () => {
    const mockUser = {
      id: '123',
      fullName: 'Test User',
      keycloakId: 'keycloak-123',
      status: 'active',
      createdAt: new Date(),
    } as User;

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);

    const result = await useCase.execute('123');

    expect(mockUserRepository.findById).toHaveBeenCalledWith('123');
    expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockUser);
  });

  it('should return null if user is not found', async () => {
    mockUserRepository.findById.mockResolvedValueOnce(null);

    const result = await useCase.execute('999');

    expect(mockUserRepository.findById).toHaveBeenCalledWith('999');
    expect(result).toBeNull();
  });
});
