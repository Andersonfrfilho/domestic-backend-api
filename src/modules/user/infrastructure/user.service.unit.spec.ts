import { UserService } from './user.service';

describe('UserService Unit Tests', () => {
  let service: UserService;
  let mockUserCreateUseCase: any;
  let mockFindUserByIdUseCase: any;
  let mockFindUserByKeycloakIdUseCase: any;
  let mockUpdateUserUseCase: any;
  let mockDeleteUserUseCase: any;

  beforeEach(() => {
    mockUserCreateUseCase = { execute: jest.fn() };
    mockFindUserByIdUseCase = { execute: jest.fn() };
    mockFindUserByKeycloakIdUseCase = { execute: jest.fn() };
    mockUpdateUserUseCase = { execute: jest.fn() };
    mockDeleteUserUseCase = { execute: jest.fn() };

    service = new UserService(
      mockUserCreateUseCase,
      mockFindUserByIdUseCase,
      mockFindUserByKeycloakIdUseCase,
      mockUpdateUserUseCase,
      mockDeleteUserUseCase,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should forward createUser to userCreateUseCase', async () => {
    const params = { fullName: 'Test' };
    const response = { id: '1', ...params };
    mockUserCreateUseCase.execute.mockResolvedValueOnce(response);

    const result = await service.createUser(params);

    expect(mockUserCreateUseCase.execute).toHaveBeenCalledWith(params);
    expect(result).toEqual(response);
  });

  it('should forward findById to findUserByIdUseCase', async () => {
    mockFindUserByIdUseCase.execute.mockResolvedValueOnce({ id: '123' });

    await service.findById('123');

    expect(mockFindUserByIdUseCase.execute).toHaveBeenCalledWith('123');
  });

  it('should forward findByKeycloakId to findUserByKeycloakIdUseCase', async () => {
    mockFindUserByKeycloakIdUseCase.execute.mockResolvedValueOnce({ keycloakId: 'kc' });

    await service.findByKeycloakId('kc');

    expect(mockFindUserByKeycloakIdUseCase.execute).toHaveBeenCalledWith('kc');
  });

  it('should forward update to updateUserUseCase', async () => {
    const dto = { status: 'inactive' };
    mockUpdateUserUseCase.execute.mockResolvedValueOnce({ id: 'u' });

    await service.update('u', dto);

    expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith('u', dto);
  });

  it('should forward delete to deleteUserUseCase', async () => {
    mockDeleteUserUseCase.execute.mockResolvedValueOnce(undefined);

    await service.delete('usr');

    expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith('usr');
  });
});
