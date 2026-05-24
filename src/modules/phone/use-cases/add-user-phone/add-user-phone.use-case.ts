import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { UserErrorFactory } from '@modules/user/factories';
import { type UserRepositoryInterface } from '@modules/user/user.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';

import { PhoneErrorFactory } from '../../factories/phone.error.factory';
import { type PhoneRepositoryInterface } from '../../phone.repository.interface';
import { PHONE_REPOSITORY_PROVIDE, USER_PHONE_REPOSITORY_PROVIDE } from '../../phone.token';
import { type UserPhoneRepositoryInterface } from '../../user-phone.repository.interface';

import { ADD_USER_PHONE_LOG_MESSAGES } from './add-user-phone.constants';
import {
  AddUserPhoneUseCaseInterface,
  AddUserPhoneUseCaseParams,
  AddUserPhoneUseCaseResponse,
} from './add-user-phone.interface';

@Injectable()
export class AddUserPhoneUseCase implements AddUserPhoneUseCaseInterface {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(PHONE_REPOSITORY_PROVIDE)
    private readonly phoneRepository: PhoneRepositoryInterface,
    @Inject(USER_PHONE_REPOSITORY_PROVIDE)
    private readonly userPhoneRepository: UserPhoneRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: AddUserPhoneUseCaseParams): Promise<AddUserPhoneUseCaseResponse> {
    this.logProvider.info({
      message: ADD_USER_PHONE_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId, number: params.number, label: params.label },
    });

    const user = await this.userRepository.findById(params.userId);
    if (!user) {
      this.logProvider.warn({
        message: ADD_USER_PHONE_LOG_MESSAGES.USER_NOT_FOUND,
        context: this.logContext,
        meta: { userId: params.userId },
      });
      throw UserErrorFactory.notFound(params.userId);
    }

    let phone = await this.phoneRepository.findByNumber(params.number);

    if (phone) {
      const existing = await this.userPhoneRepository.findByUserIdAndPhoneId(
        params.userId,
        phone.id,
      );
      if (existing) {
        this.logProvider.warn({
          message: ADD_USER_PHONE_LOG_MESSAGES.PHONE_ALREADY_EXISTS,
          context: this.logContext,
          meta: { userId: params.userId, number: params.number },
        });
        throw PhoneErrorFactory.alreadyExists(params.number);
      }
    } else {
      phone = await this.phoneRepository.create({ number: params.number, type: params.type });
      this.logProvider.info({
        message: ADD_USER_PHONE_LOG_MESSAGES.PHONE_CREATED,
        context: this.logContext,
        meta: { phoneId: phone.id, number: params.number },
      });
    }

    const userPhone = await this.userPhoneRepository.create({
      userId: params.userId,
      phoneId: phone.id,
      label: params.label,
      isPrimary: params.isPrimary ?? false,
    });

    this.logProvider.info({
      message: ADD_USER_PHONE_LOG_MESSAGES.USER_PHONE_LINKED,
      context: this.logContext,
      meta: { userPhoneId: userPhone.id, userId: params.userId, phoneId: phone.id },
    });

    return userPhone;
  }
}
