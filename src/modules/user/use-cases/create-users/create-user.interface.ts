import { UserAddress } from '@app/modules/shared/providers/database/entities/user-address.entity';
import { User } from '@app/modules/shared/providers/database/entities/user.entity';

import { UserStats } from '../../user.repository.interface';

export interface UserCreateUseCaseParams {
  fullName: string;
  keycloakId?: string;
  status?: string;
}

export interface UserCreateUseCaseResponse extends User {}

export interface UserCreateUseCaseInterface {
  execute(dto: UserCreateUseCaseParams): Promise<UserCreateUseCaseResponse>;
}

export interface UserServiceParams {
  fullName: string;
  keycloakId?: string;
  status?: string;
}

export interface UserServiceResponse extends User {}

export interface AddUserAddressParams {
  userId: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: string;
  longitude?: string;
  label?: string;
  isPrimary?: boolean;
}

export interface UserServiceInterface {
  createUser(dto: UserServiceParams): Promise<UserServiceResponse>;
  getUserById(id: string): Promise<UserServiceResponse>;
  getUserByKeycloakId(keycloakId: string): Promise<UserServiceResponse>;
  updateUser(
    id: string,
    params: { fullName?: string; status?: string },
  ): Promise<UserServiceResponse>;
  deleteUser(id: string): Promise<void>;
  restoreUser(id: string): Promise<UserServiceResponse>;
  getUserStats(): Promise<UserStats>;
  addUserAddress(params: AddUserAddressParams): Promise<UserAddress>;
  removeUserAddress(userId: string, addressId: string): Promise<void>;
  listUserAddresses(userId: string): Promise<UserAddress[]>;
  // Convenience orchestration methods that accept Keycloak ID and perform lookup internally
  listUserAddressesByKeycloakId(keycloakId: string): Promise<UserAddress[]>;
  addUserAddressByKeycloakId(
    keycloakId: string,
    params: Omit<AddUserAddressParams, 'userId'>,
  ): Promise<UserAddress>;
  removeUserAddressByKeycloakId(keycloakId: string, addressId: string): Promise<void>;
}
