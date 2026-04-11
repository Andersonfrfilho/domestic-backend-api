import { GET_USER_BY_ID_LOG_MESSAGES } from './get-user-by-id.constants';
import { GetUserByIdUseCase } from './get-user-by-id.use-case';

const mockUser = {
  id: 'uuid-1',
  fullName: 'Anderson',
  keycloakId: 'kc-1',
  status: 'ACTIVE',
  createdAt: new Date(),
};

describe('GetUserByIdUseCase', () => {
  let useCase: GetUserByIdUseCase;
  let mockUserRepository: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockUserRepository = { findByIdWithDeleted: jest.fn() };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new GetUserByIdUseCase(mockUserRepository, mockLogProvider);
  });

  it('returns user when found', async () => {
    mockUserRepository.findByIdWithDeleted.mockResolvedValue(mockUser);
    const result = await useCase.execute({ id: 'uuid-1' });
    expect(result).toEqual(mockUser);
    expect(mockUserRepository.findByIdWithDeleted).toHaveBeenCalledWith('uuid-1');
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: GET_USER_BY_ID_LOG_MESSAGES.USER_FOUND,
        context: 'GetUserByIdUseCase.execute',
      }),
    );
  });

  it('throws notFound when user does not exist', async () => {
    mockUserRepository.findByIdWithDeleted.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'unknown' })).rejects.toThrow();
    expect(mockUserRepository.findByIdWithDeleted).toHaveBeenCalledWith('unknown');
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: GET_USER_BY_ID_LOG_MESSAGES.USER_NOT_FOUND,
        context: 'GetUserByIdUseCase.execute',
      }),
    );
  });
});
