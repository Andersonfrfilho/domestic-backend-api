import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';
import { Test } from '@nestjs/testing';

import { DELETE_USER_LOG_CONTEXT, DELETE_USER_LOG_MESSAGES } from './delete-user.constants';
import { DeleteUserUseCase } from './delete-user.use-case';

const mockUser = {
  id: 'uuid-1',
  fullName: 'Anderson',
  keycloakId: 'kc-1',
  status: 'ACTIVE',
  createdAt: new Date(),
};
const mockUserRepository = { findById: jest.fn(), update: jest.fn() };
const mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        { provide: USER_REPOSITORY_PROVIDE, useValue: mockUserRepository },
        { provide: LOGGER_PROVIDER, useValue: mockLogProvider },
      ],
    }).compile();
    useCase = module.get(DeleteUserUseCase);
    jest.clearAllMocks();
  });

  it('soft deletes user by setting status to DELETED', async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockUserRepository.update.mockResolvedValue(undefined);

    await useCase.execute({ id: 'uuid-1' });
    expect(mockUserRepository.update).toHaveBeenCalledWith('uuid-1', { status: 'DELETED' });
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: DELETE_USER_LOG_MESSAGES.USER_SOFT_DELETED,
        context: DELETE_USER_LOG_CONTEXT,
      }),
    );
  });

  it('throws notFound when user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown' })).rejects.toThrow();
    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: DELETE_USER_LOG_MESSAGES.USER_NOT_FOUND,
        context: DELETE_USER_LOG_CONTEXT,
      }),
    );
  });
});
