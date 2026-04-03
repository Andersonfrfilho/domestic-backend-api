import { FindUserByKeycloakIdUseCase } from './find-user-by-keycloak-id.use-case';
import { UserRepositoryInterface } from '@modules/user/domain/repositories/user.repository.interface';
import { User } from '@modules/shared/domain/entities/user.entity';

describe('FindUserByKeycloakIdUseCase', () => {
  let useCase: FindUserByKeycloakIdUseCase;
  let mockUserRepository: jest.Mocked<UserRepositoryInterface>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByKeycloakId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new FindUserByKeycloakIdUseCase(mockUserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call userRepository.findByKeycloakId and return the user', async () => {
    const mockUser = {
      id: '123',
      fullName: 'Test User',
      keycloakId: 'keycloak-123',
      status: 'active',
      createdAt: new Date(),
    } as User;

    mockUserRepository.findByKeycloakId.mockResolvedValueOnce(mockUser);

    const result = await useCase.execute('keycloak-123');

    expect(mockUserRepository.findByKeycloakId).toHaveBeenCalledWith('keycloak-123');
    expect(mockUserRepository.findByKeycloakId).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockUser);
  });

  it('should return null if user is not found', async () => {
    mockUserRepository.findByKeycloakId.mockResolvedValueOnce(null);

    const result = await useCase.execute('unknown');

    expect(mockUserRepository.findByKeycloakId).toHaveBeenCalledWith('unknown');
    expect(result).toBeNull();
  });
});
