import { UpdateUserUseCase } from './update-user.use-case';
import { UserRepositoryInterface } from '@modules/user/domain/repositories/user.repository.interface';
import { User } from '@modules/shared/domain/entities/user.entity';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepositoryInterface>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByKeycloakId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new UpdateUserUseCase(mockUserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call userRepository.update and return updated user', async () => {
    const userToUpdate = {
      fullName: 'Updated Name',
      status: 'inactive',
    };

    const mockUser = {
      id: 'usr-1',
      fullName: 'Updated Name',
      keycloakId: 'kc-1',
      status: 'inactive',
      createdAt: new Date(),
    } as User;

    mockUserRepository.update.mockResolvedValueOnce(mockUser);

    const result = await useCase.execute('usr-1', userToUpdate);

    expect(mockUserRepository.update).toHaveBeenCalledWith('usr-1', userToUpdate);
    expect(result).toEqual(mockUser);
  });
});
