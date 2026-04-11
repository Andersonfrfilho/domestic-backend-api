import { GET_USER_BY_KEYCLOAK_ID_LOG_MESSAGES } from './get-user-by-keycloak-id.constants';
import { GetUserByKeycloakIdUseCase } from './get-user-by-keycloak-id.use-case';

const mockUser = {
  id: 'uuid-1',
  fullName: 'Anderson',
  keycloakId: 'kc-1',
  status: 'ACTIVE',
  createdAt: new Date(),
};

describe('GetUserByKeycloakIdUseCase', () => {
  let useCase: GetUserByKeycloakIdUseCase;
  let mockUserRepository: any;
  let mockLogProvider: any;

  beforeEach(() => {
    mockUserRepository = { findByKeycloakIdWithDeleted: jest.fn() };
    mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    useCase = new GetUserByKeycloakIdUseCase(mockUserRepository, mockLogProvider);
  });

  it('returns user when found by keycloakId', async () => {
    mockUserRepository.findByKeycloakIdWithDeleted.mockResolvedValue(mockUser);
    const result = await useCase.execute({ keycloakId: 'kc-1' });
    expect(result).toEqual(mockUser);
    expect(mockUserRepository.findByKeycloakIdWithDeleted).toHaveBeenCalledWith('kc-1');
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: GET_USER_BY_KEYCLOAK_ID_LOG_MESSAGES.USER_FOUND,
        context: 'GetUserByKeycloakIdUseCase.execute',
      }),
    );
  });

  it('throws notFound when keycloakId does not exist', async () => {
    mockUserRepository.findByKeycloakIdWithDeleted.mockResolvedValue(null);
    await expect(useCase.execute({ keycloakId: 'unknown' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: GET_USER_BY_KEYCLOAK_ID_LOG_MESSAGES.USER_NOT_FOUND,
        context: 'GetUserByKeycloakIdUseCase.execute',
      }),
    );
  });
});
