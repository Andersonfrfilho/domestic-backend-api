import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { type AddressRepositoryInterface } from '@modules/shared/providers/database/repositories/address.repository.interface';
import { UserErrorFactory } from '@modules/user/factories';
import {
  ADDRESS_REPOSITORY_PROVIDE,
  USER_ADDRESS_REPOSITORY_PROVIDE,
  USER_REPOSITORY_PROVIDE,
} from '@modules/user/user.token';

import { type UserAddressRepositoryInterface } from '../../user-address.repository.interface';
import { type UserRepositoryInterface } from '../../user.repository.interface';

import {
  ADD_USER_ADDRESS_LOG_MESSAGES,
} from './add-user-address.constants';
import {
  AddUserAddressUseCaseInterface,
  AddUserAddressUseCaseParams,
  AddUserAddressUseCaseResponse,
} from './add-user-address.interface';

@Injectable()
export class AddUserAddressUseCase implements AddUserAddressUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(ADDRESS_REPOSITORY_PROVIDE)
    private readonly addressRepository: AddressRepositoryInterface,
    @Inject(USER_ADDRESS_REPOSITORY_PROVIDE)
    private readonly userAddressRepository: UserAddressRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: AddUserAddressUseCaseParams): Promise<AddUserAddressUseCaseResponse> {
    this.logProvider.info({
      message: ADD_USER_ADDRESS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: {
        userId: params.userId,
        zipCode: params.zipCode,
        city: params.city,
        state: params.state,
        label: params.label,
        isPrimary: params.isPrimary ?? false,
      },
    });

    const user = await this.userRepository.findById(params.userId);
    if (!user) {
      this.logProvider.warn({
        message: ADD_USER_ADDRESS_LOG_MESSAGES.USER_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId },
      });
      throw UserErrorFactory.notFound(params.userId);
    }

    const address = await this.addressRepository.createAddress({
      street: params.street,
      number: params.number,
      complement: params.complement ?? null,
      neighborhood: params.neighborhood,
      city: params.city,
      state: params.state,
      zipCode: params.zipCode,
      latitude: params.latitude ?? null,
      longitude: params.longitude ?? null,
      isVerified: false,
    });

    this.logProvider.info({
      message: ADD_USER_ADDRESS_LOG_MESSAGES.ADDRESS_CREATED,
      context: this.logContext,
      meta: { addressId: address.id, userId: params.userId },
    });

    const userAddress = await this.userAddressRepository.linkUserToAddress(
      params.userId,
      address.id,
      params.label,
      params.isPrimary ?? false,
    );

    this.logProvider.info({
      message: ADD_USER_ADDRESS_LOG_MESSAGES.USER_ADDRESS_LINKED,
      context: this.logContext,
      meta: {
        userAddressId: userAddress.id,
        userId: params.userId,
        addressId: address.id,
        isPrimary: params.isPrimary ?? false,
      },
    });

    return userAddress;
  }
}
