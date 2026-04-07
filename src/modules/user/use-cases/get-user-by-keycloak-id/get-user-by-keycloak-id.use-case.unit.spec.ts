import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';
import { Test } from '@nestjs/testing';

import {
  GET_USER_BY_KEYCLOAK_ID_LOG_CONTEXT,
  GET_USER_BY_KEYCLOAK_ID_LOG_MESSAGES,
} from './get-user-by-keycloak-id.constants';
import { GetUserByKeycloakIdUseCase } from './get-user-by-keycloak-id.use-case';

const mockUser = {
  id: 'uuid-1',
  fullName: 'Anderson',
  keycloakId: 'kc-1',
  status: 'ACTIVE',
  createdAt: new Date(),
};
const mockUserRepository = { findByKeycloakId: jest.fn() };
const mockLogProvider = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };

describe('GetUserByKeycloakIdUseCase', () => {
  let useCase: GetUserByKeycloakIdUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GetUserByKeycloakIdUseCase,
        { provide: USER_REPOSITORY_PROVIDE, useValue: mockUserRepository },
        { provide: LOGGER_PROVIDER, useValue: mockLogProvider },
      ],
    }).compile();
    useCase = module.get(GetUserByKeycloakIdUseCase);
    jest.clearAllMocks();
  });

  it('returns user when found by keycloakId', async () => {
    mockUserRepository.findByKeycloakId.mockResolvedValue(mockUser);
    const result = await useCase.execute({ keycloakId: 'kc-1' });
    expect(result).toEqual(mockUser);
    expect(mockUserRepository.findByKeycloakId).toHaveBeenCalledWith('kc-1');
    expect(mockLogProvider.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: GET_USER_BY_KEYCLOAK_ID_LOG_MESSAGES.USER_FOUND,
        context: GET_USER_BY_KEYCLOAK_ID_LOG_CONTEXT,
      }),
    );
  });

  it('throws notFound when keycloakId does not exist', async () => {
    mockUserRepository.findByKeycloakId.mockResolvedValue(null);
    await expect(useCase.execute({ keycloakId: 'unknown' })).rejects.toThrow();
    expect(mockLogProvider.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: GET_USER_BY_KEYCLOAK_ID_LOG_MESSAGES.USER_NOT_FOUND,
        context: GET_USER_BY_KEYCLOAK_ID_LOG_CONTEXT,
      }),
    );
  });
});
