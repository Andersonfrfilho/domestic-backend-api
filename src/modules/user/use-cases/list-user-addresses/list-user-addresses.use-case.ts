import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserErrorFactory } from '@modules/user/factories';
import { USER_ADDRESS_REPOSITORY_PROVIDE, USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { type UserAddressRepositoryInterface } from '../../user-address.repository.interface';
import { type UserRepositoryInterface } from '../../user.repository.interface';

import { LIST_USER_ADDRESSES_LOG_MESSAGES } from './list-user-addresses.constants';
import {
  type ListUserAddressesUseCaseInterface,
  type ListUserAddressesUseCaseParams,
  type ListUserAddressesUseCaseResponse,
} from './list-user-addresses.interface';

@Injectable()
export class ListUserAddressesUseCase implements ListUserAddressesUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(USER_ADDRESS_REPOSITORY_PROVIDE)
    private readonly userAddressRepository: UserAddressRepositoryInterface,
    @Inject(LOGGER_PROVIDER) private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: ListUserAddressesUseCaseParams): Promise<ListUserAddressesUseCaseResponse> {
    this.logProvider.info({
      message: LIST_USER_ADDRESSES_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId },
    });

    const user = await this.userRepository.findById(params.userId);
    if (!user) {
      this.logProvider.warn({
        message: LIST_USER_ADDRESSES_LOG_MESSAGES.USER_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId },
      });
      throw UserErrorFactory.notFound(params.userId);
    }

    const addresses = await this.userAddressRepository.findByUserId(params.userId);

    this.logProvider.info({
      message: LIST_USER_ADDRESSES_LOG_MESSAGES.ADDRESSES_RETRIEVED,
      context: this.logContext,
      meta: { userId: params.userId, addressesCount: addresses.length },
    });

    return addresses;
  }
}
