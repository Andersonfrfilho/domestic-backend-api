import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserAddressErrorFactory } from '@modules/user/factories/user-address.error.factory';
import { USER_ADDRESS_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { type UserAddressRepositoryInterface } from '../../user-address.repository.interface';

import { REMOVE_USER_ADDRESS_LOG_MESSAGES } from './remove-user-address.constants';
import {
  RemoveUserAddressUseCaseInterface,
  RemoveUserAddressUseCaseParams,
} from './remove-user-address.interface';

@Injectable()
export class RemoveUserAddressUseCase implements RemoveUserAddressUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_ADDRESS_REPOSITORY_PROVIDE)
    private readonly userAddressRepository: UserAddressRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: RemoveUserAddressUseCaseParams): Promise<void> {
    this.logProvider.info({
      message: REMOVE_USER_ADDRESS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId, userAddressId: params.userAddressId },
    });

    const userAddress = await this.userAddressRepository.findById(params.userAddressId);
    if (!userAddress || userAddress.userId !== params.userId) {
      this.logProvider.warn({
        message: REMOVE_USER_ADDRESS_LOG_MESSAGES.USER_ADDRESS_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId, userAddressId: params.userAddressId },
      });
      throw UserAddressErrorFactory.notFound(params.userAddressId);
    }

    await this.userAddressRepository.delete(params.userAddressId);

    this.logProvider.info({
      message: REMOVE_USER_ADDRESS_LOG_MESSAGES.USER_ADDRESS_REMOVED,
      context: this.logContext,
      meta: { userId: params.userId, userAddressId: params.userAddressId },
    });
  }
}
