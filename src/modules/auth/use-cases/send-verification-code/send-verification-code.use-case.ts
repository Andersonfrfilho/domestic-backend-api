import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { VerificationCodeRepository } from '@modules/shared/providers/database/repositories/verification-code.repository';

import { SEND_VERIFICATION_CODE_LOG_MESSAGES } from './send-verification-code.constants';
import {
  SendVerificationCodeParams,
  SendVerificationCodeResponse,
  SendVerificationCodeUseCaseInterface,
} from './send-verification-code.interface';

@Injectable()
export class SendVerificationCodeUseCase implements SendVerificationCodeUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly verificationCodeRepo: VerificationCodeRepository,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async execute(params: SendVerificationCodeParams): Promise<SendVerificationCodeResponse> {
    this.logProvider.info({
      message: SEND_VERIFICATION_CODE_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { destination: params.destination, type: params.type },
    });

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.verificationCodeRepo.create({
      destination: params.destination,
      type: params.type,
      code,
      expiresAt,
    });

    this.logProvider.info({
      message: SEND_VERIFICATION_CODE_LOG_MESSAGES.CODE_GENERATED,
      context: this.logContext,
      meta: { destination: params.destination, type: params.type },
    });

    const routingKey = params.type === 'email' ? 'notifications.email' : 'notifications.sms';

    await this.amqpConnection.publish('zolve.events', routingKey, {
      to: params.destination,
      template_id: params.type === 'email' ? 'verification_code' : 'verification_code_sms',
      params: { code, expiresIn: '5 minutos' },
    });

    this.logProvider.info({
      message: SEND_VERIFICATION_CODE_LOG_MESSAGES.CODE_SENT,
      context: this.logContext,
      meta: { destination: params.destination, routingKey },
    });

    return {
      success: true,
      message: 'Código de verificação enviado',
      expiresIn: 300,
    };
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
