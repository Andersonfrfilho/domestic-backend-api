import { UPDATE_USER_LOG_MESSAGES } from './update-user.constants';
import { UpdateUserUseCase } from './update-user.use-case';

const mockUser = {
  id: 'uuid-1',
  fullName: 'Anderson',
  keycloakId: 'kc-1',
  status: 'ACTIVE',
  createdAt: new Date(),
};

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let mockUserRepository: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockUserRepository = { findByIdWithDeleted: jest.fn(), update: jest.fn() };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new UpdateUserUseCase(mockUserRepository, mockLogProvider);
  });

  it('updates and returns user', async () => {
    const updated = { ...mockUser, fullName: 'Anderson Updated' };
    mockUserRepository.findByIdWithDeleted.mockResolvedValue(mockUser);
    mockUserRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 'uuid-1', fullName: 'Anderson Updated' });
    expect(result.fullName).toBe('Anderson Updated');
    expect(mockUserRepository.update).toHaveBeenCalledWith('uuid-1', {
      fullName: 'Anderson Updated',
      status: undefined,
    });
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: UPDATE_USER_LOG_MESSAGES.USER_UPDATED,
        context: 'UpdateUserUseCase.execute',
      }),
    );
  });

  it('throws notFound when user does not exist', async () => {
    mockUserRepository.findByIdWithDeleted.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown', fullName: 'X' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: UPDATE_USER_LOG_MESSAGES.USER_NOT_FOUND,
        context: 'UpdateUserUseCase.execute',
      }),
    );
  });
});
