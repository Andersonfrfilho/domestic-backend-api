import { DeleteUserUseCase } from './delete-user.use-case';
import { UserRepositoryInterface } from '@modules/user/domain/repositories/user.repository.interface';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepositoryInterface>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByKeycloakId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteUserUseCase(mockUserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call userRepository.delete', async () => {
    mockUserRepository.delete.mockResolvedValueOnce();

    await useCase.execute('usr-333');

    expect(mockUserRepository.delete).toHaveBeenCalledWith('usr-333');
    expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
  });
});
