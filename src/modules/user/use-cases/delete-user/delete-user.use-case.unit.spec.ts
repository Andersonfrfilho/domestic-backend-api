import { DELETE_USER_LOG_MESSAGES } from './delete-user.constants';
import { DeleteUserUseCase } from './delete-user.use-case';

const mockUser = {
  id: 'uuid-1',
  fullName: 'Anderson',
  keycloakId: 'kc-1',
  status: 'ACTIVE',
  createdAt: new Date(),
};

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let mockUserRepository: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockUserRepository = { findByIdWithDeleted: jest.fn(), update: jest.fn(), softDelete: jest.fn() };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new DeleteUserUseCase(mockUserRepository, mockLogProvider);
  });

  it('soft deletes user by setting status to DELETED', async () => {
    mockUserRepository.findByIdWithDeleted.mockResolvedValue(mockUser);
    mockUserRepository.update.mockResolvedValue(undefined);
    mockUserRepository.softDelete.mockResolvedValue(undefined);

    await useCase.execute({ id: 'uuid-1' });
    expect(mockUserRepository.update).toHaveBeenCalledWith('uuid-1', { status: 'DELETED' });
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: DELETE_USER_LOG_MESSAGES.USER_SOFT_DELETED,
        context: 'DeleteUserUseCase.execute',
      }),
    );
  });

  it('throws notFound when user does not exist', async () => {
    mockUserRepository.findByIdWithDeleted.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown' })).rejects.toThrow();
    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: DELETE_USER_LOG_MESSAGES.USER_NOT_FOUND,
        context: 'DeleteUserUseCase.execute',
      }),
    );
  });
});
