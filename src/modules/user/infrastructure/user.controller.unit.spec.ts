import { beforeEach, describe, expect, it } from '@jest/globals';
import { UserController } from './user.controller';

describe('UserController - Unit Tests', () => {
  let controller: UserController;
  let mockUserService: any;
  let mockCacheProvider: any;

  beforeEach(() => {
    mockUserService = {
      createUser: jest.fn(),
      findById: jest.fn(),
      findByKeycloakId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    mockCacheProvider = {
      del: jest.fn(),
      getDecrypted: jest.fn(),
      setEncrypted: jest.fn(),
    };
    controller = new UserController(mockUserService, mockCacheProvider);
  });

  describe('create endpoint', () => {
    it('should create user and clear cache', async () => {
      const params = {
        fullName: 'Test User',
      };
      mockUserService.createUser.mockResolvedValue({ id: '1' });

      const result = await controller.create(params);
      expect(mockUserService.createUser).toHaveBeenCalledWith(params);
      expect(mockCacheProvider.del).toHaveBeenCalledWith('users:list');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('findById endpoint', () => {
    it('should return user from service', async () => {
      mockUserService.findById.mockResolvedValueOnce({ id: '123' });
      const result = await controller.findById('123');
      expect(mockUserService.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual({ id: '123' });
    });
  });

  describe('findByKeycloakId endpoint', () => {
    it('should return user from service', async () => {
      mockUserService.findByKeycloakId.mockResolvedValueOnce({ id: 'kc-1' });
      const result = await controller.findByKeycloakId('kc-1');
      expect(mockUserService.findByKeycloakId).toHaveBeenCalledWith('kc-1');
      expect(result).toEqual({ id: 'kc-1' });
    });
  });

  describe('update endpoint', () => {
    it('should update user and clear cache', async () => {
      const params = { fullName: 'New Name' };
      mockUserService.update.mockResolvedValueOnce({ id: 'u' });

      const result = await controller.update('u', params);

      expect(mockCacheProvider.del).toHaveBeenCalledWith('users:list');
      expect(mockUserService.update).toHaveBeenCalledWith('u', params);
      expect(result).toEqual({ id: 'u' });
    });
  });

  describe('delete endpoint', () => {
    it('should delete user and clear cache', async () => {
      mockUserService.delete.mockResolvedValueOnce(undefined);

      await controller.delete('usr');

      expect(mockCacheProvider.del).toHaveBeenCalledWith('users:list');
      expect(mockUserService.delete).toHaveBeenCalledWith('usr');
    });
  });
});
