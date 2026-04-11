import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import { UserAddress } from '@app/modules/shared/providers/database/entities/user-address.entity';
import type { LogProviderInterface } from '@modules/shared';

import { type AddUserAddressUseCaseInterface } from './use-cases/add-user-address/add-user-address.interface';
import {
  AddUserAddressParams,
  type UserCreateUseCaseInterface,
  UserServiceInterface,
  UserServiceParams,
  UserServiceResponse,
} from './use-cases/create-users/create-user.interface';
import { type DeleteUserUseCaseInterface } from './use-cases/delete-user/delete-user.interface';
import { type GetUserByIdUseCaseInterface } from './use-cases/get-user-by-id/get-user-by-id.interface';
import { type GetUserByKeycloakIdUseCaseInterface } from './use-cases/get-user-by-keycloak-id/get-user-by-keycloak-id.interface';
import { type GetUserStatsUseCaseInterface } from './use-cases/get-user-stats/get-user-stats.interface';
import { type ListUserAddressesUseCaseInterface } from './use-cases/list-user-addresses/list-user-addresses.interface';
import { type RemoveUserAddressUseCaseInterface } from './use-cases/remove-user-address/remove-user-address.interface';
import { type RestoreUserUseCaseInterface } from './use-cases/restore-user/restore-user.interface';
import { type UpdateUserUseCaseInterface } from './use-cases/update-user/update-user.interface';
import { UserStats } from './user.repository.interface';
import { USER_SERVICE_LOG_CONTEXT, USER_SERVICE_LOG_MESSAGES } from './user.service.constants';
import {
  ADD_USER_ADDRESS_USE_CASE_PROVIDE,
  LIST_USER_ADDRESSES_USE_CASE_PROVIDE,
  REMOVE_USER_ADDRESS_USE_CASE_PROVIDE,
  USER_CREATE_USE_CASE_PROVIDE,
  USER_DELETE_USE_CASE_PROVIDE,
  USER_GET_BY_ID_USE_CASE_PROVIDE,
  USER_GET_BY_KEYCLOAK_ID_USE_CASE_PROVIDE,
  USER_GET_STATS_USE_CASE_PROVIDE,
  USER_RESTORE_USE_CASE_PROVIDE,
  USER_UPDATE_USE_CASE_PROVIDE,
} from './user.token';

@Injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @Inject(USER_CREATE_USE_CASE_PROVIDE)
    private readonly userCreateUseCase: UserCreateUseCaseInterface,
    @Inject(USER_GET_BY_ID_USE_CASE_PROVIDE)
    private readonly getUserByIdUseCase: GetUserByIdUseCaseInterface,
    @Inject(USER_GET_BY_KEYCLOAK_ID_USE_CASE_PROVIDE)
    private readonly getUserByKeycloakIdUseCase: GetUserByKeycloakIdUseCaseInterface,
    @Inject(USER_UPDATE_USE_CASE_PROVIDE)
    private readonly updateUserUseCase: UpdateUserUseCaseInterface,
    @Inject(USER_DELETE_USE_CASE_PROVIDE)
    private readonly deleteUserUseCase: DeleteUserUseCaseInterface,
    @Inject(USER_GET_STATS_USE_CASE_PROVIDE)
    private readonly getUserStatsUseCase: GetUserStatsUseCaseInterface,
    @Inject(ADD_USER_ADDRESS_USE_CASE_PROVIDE)
    private readonly addUserAddressUseCase: AddUserAddressUseCaseInterface,
    @Inject(REMOVE_USER_ADDRESS_USE_CASE_PROVIDE)
    private readonly removeUserAddressUseCase: RemoveUserAddressUseCaseInterface,
    @Inject(LIST_USER_ADDRESSES_USE_CASE_PROVIDE)
    private readonly listUserAddressesUseCase: ListUserAddressesUseCaseInterface,
    @Inject(USER_RESTORE_USE_CASE_PROVIDE)
    private readonly restoreUserUseCase: RestoreUserUseCaseInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async createUser(params: UserServiceParams): Promise<UserServiceResponse> {
    const user = await this.userCreateUseCase.execute(params);
    // invalidate users:list cache and log the operation
    try {
      this.logProvider.info({
        message: USER_SERVICE_LOG_MESSAGES.INVALIDATE_CACHE_ATTEMPT,
        context: USER_SERVICE_LOG_CONTEXT,
        meta: { userId: user?.id ?? null, cacheKey: 'users:list' },
      });
      await this.cacheProvider.del('users:list');
      this.logProvider.info({
        message: USER_SERVICE_LOG_MESSAGES.INVALIDATE_CACHE_SUCCESS,
        context: USER_SERVICE_LOG_CONTEXT,
        meta: { cacheKey: 'users:list' },
      });
    } catch (err) {
      this.logProvider.warn({
        message: USER_SERVICE_LOG_MESSAGES.INVALIDATE_CACHE_FAILED,
        context: USER_SERVICE_LOG_CONTEXT,
        meta: { error: err?.message ?? String(err), cacheKey: 'users:list' },
      });
    }

    return user;
  }

  async getUserById(id: string): Promise<UserServiceResponse> {
    return this.getUserByIdUseCase.execute({ id });
  }

  async getUserByKeycloakId(keycloakId: string): Promise<UserServiceResponse> {
    return this.getUserByKeycloakIdUseCase.execute({ keycloakId });
  }

  async updateUser(
    id: string,
    params: { fullName?: string; status?: string },
  ): Promise<UserServiceResponse> {
    return this.updateUserUseCase.execute({ id, ...params });
  }

  async deleteUser(id: string): Promise<void> {
    return this.deleteUserUseCase.execute({ id });
  }

  async restoreUser(id: string): Promise<UserServiceResponse> {
    return this.restoreUserUseCase.execute({ id });
  }

  async getUserStats(): Promise<UserStats> {
    return this.getUserStatsUseCase.execute();
  }

  async addUserAddress(params: AddUserAddressParams): Promise<UserAddress> {
    return this.addUserAddressUseCase.execute(params);
  }

  async removeUserAddress(userId: string, addressId: string): Promise<void> {
    return this.removeUserAddressUseCase.execute({ userId, userAddressId: addressId });
  }

  async listUserAddresses(userId: string): Promise<UserAddress[]> {
    return this.listUserAddressesUseCase.execute({ userId });
  }

  async listUserAddressesByKeycloakId(keycloakId: string): Promise<UserAddress[]> {
    this.logProvider.info({
      message: USER_SERVICE_LOG_MESSAGES.LIST_ADDRESSES_BY_KEYCLOAK_START,
      context: USER_SERVICE_LOG_CONTEXT,
      meta: { keycloakId },
    });

    const user = await this.getUserByKeycloakId(keycloakId);
    const addresses = await this.listUserAddresses(user.id);

    this.logProvider.info({
      message: USER_SERVICE_LOG_MESSAGES.LIST_ADDRESSES_BY_KEYCLOAK_SUCCESS,
      context: USER_SERVICE_LOG_CONTEXT,
      meta: { keycloakId, userId: user.id, addressesCount: addresses.length },
    });

    return addresses;
  }

  async addUserAddressByKeycloakId(
    keycloakId: string,
    params: Omit<AddUserAddressParams, 'userId'>,
  ): Promise<UserAddress> {
    this.logProvider.info({
      message: USER_SERVICE_LOG_MESSAGES.ADD_ADDRESS_BY_KEYCLOAK_START,
      context: USER_SERVICE_LOG_CONTEXT,
      meta: { keycloakId },
    });

    const user = await this.getUserByKeycloakId(keycloakId);
    const userAddress = await this.addUserAddress({ ...params, userId: user.id });

    this.logProvider.info({
      message: USER_SERVICE_LOG_MESSAGES.ADD_ADDRESS_BY_KEYCLOAK_SUCCESS,
      context: USER_SERVICE_LOG_CONTEXT,
      meta: { keycloakId, userId: user.id, userAddressId: userAddress.id },
    });

    return userAddress;
  }

  async removeUserAddressByKeycloakId(keycloakId: string, addressId: string): Promise<void> {
    this.logProvider.info({
      message: USER_SERVICE_LOG_MESSAGES.REMOVE_ADDRESS_BY_KEYCLOAK_START,
      context: USER_SERVICE_LOG_CONTEXT,
      meta: { keycloakId, addressId },
    });

    const user = await this.getUserByKeycloakId(keycloakId);
    await this.removeUserAddress(user.id, addressId);

    this.logProvider.info({
      message: USER_SERVICE_LOG_MESSAGES.REMOVE_ADDRESS_BY_KEYCLOAK_SUCCESS,
      context: USER_SERVICE_LOG_CONTEXT,
      meta: { keycloakId, userId: user.id, addressId },
    });
  }
}
