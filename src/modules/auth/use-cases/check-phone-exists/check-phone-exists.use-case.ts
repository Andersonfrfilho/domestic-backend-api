import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import type { PhoneRepositoryInterface } from '@modules/phone/phone.repository.interface';
import { PHONE_REPOSITORY_PROVIDE } from '@modules/phone/phone.token';

export interface CheckPhoneExistsParams {
  phone: string;
}

export const CHECK_PHONE_EXISTS_LOG_MESSAGES = {
  START_FLOW: 'Starting check phone exists flow',
  PHONE_FOUND: 'Phone already registered',
  SUCCESS: 'Phone is available',
} as const;

@Injectable()
export class CheckPhoneExistsUseCase {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(PHONE_REPOSITORY_PROVIDE)
    private readonly phoneRepository: PhoneRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: CheckPhoneExistsParams): Promise<void> {
    this.logProvider.info({
      message: CHECK_PHONE_EXISTS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { phone: params.phone },
    });

    const phone = await this.phoneRepository.findByNumber(params.phone);
    if (phone) {
      this.logProvider.warn({
        message: CHECK_PHONE_EXISTS_LOG_MESSAGES.PHONE_FOUND,
        context: this.logContext,
        meta: { phone: params.phone },
      });
      throw new ConflictException('Telefone já está cadastrado');
    }

    this.logProvider.info({
      message: CHECK_PHONE_EXISTS_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { phone: params.phone },
    });
  }
}
