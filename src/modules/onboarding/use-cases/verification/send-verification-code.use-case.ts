import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { VerificationCode } from '@modules/shared/providers/database/entities/verification-code.entity';
import type { QueueProducerMessageProviderInterface } from '@modules/shared/providers/queue/producer/producer.interface';
import { MESSAGE_PRODUCER } from '@modules/shared/providers/queue/producer/producer.token';

export type VerificationChannel = 'email' | 'phone';

export interface SendVerificationCodeParams {
  type: VerificationChannel;
  destination: string;
}

export interface SendVerificationCodeResult {
  success: boolean;
  message: string;
}

const CODE_TTL_MINUTES = 10;
const CODE_LENGTH = 4;

@Injectable()
export class SendVerificationCodeUseCase {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    @InjectRepository(VerificationCode, CONNECTIONS_NAMES.POSTGRES)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    @Inject(MESSAGE_PRODUCER)
    private readonly messageProducer: QueueProducerMessageProviderInterface,
  ) {}

  async execute(params: SendVerificationCodeParams): Promise<SendVerificationCodeResult> {
    const code = this.generateCode(params);
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

    await this.verificationCodeRepository.save({
      destination: params.destination,
      type: params.type,
      code,
      expiresAt,
      isUsed: false,
      verifiedAt: null,
    });

    this.logProvider.info({
      message: `Verification code saved for ${params.type}`,
      context: this.logContext,
      meta: {
        type: params.type,
        destination: params.destination,
        expiresAt,
        // log code only in non-production for debugging
        ...(process.env.NODE_ENV !== 'production' ? { code } : {}),
      },
    });

    // Send via appropriate channel (email or SMS)
    if (params.type === 'email') {
      const emailPayload = {
        body: {
          to: params.destination,
          template_id: 'verification_code',
          variables: {
            code,
          },
        },
        metadata: {
          source: 'onboarding-verification',
          destination: params.destination,
          type: 'email',
        },
      };

      await this.messageProducer.send('notifications', emailPayload, {
        exchange: 'zolve.events',
        routingKey: 'notifications.email',
        persistent: true,
      });

      this.logProvider.info({
        message: 'Verification email queued for sending',
        context: this.logContext,
        meta: {
          destination: params.destination,
          type: 'email',
        },
      });
    } else if (params.type === 'phone') {
      // SMS sending would be implemented here
      // For now, just log that it was queued
      this.logProvider.info({
        message: 'SMS verification would be queued here (not yet implemented)',
        context: this.logContext,
        meta: {
          destination: params.destination,
          type: 'phone',
          code,
        },
      });
    }

    return { success: true, message: 'Código de verificação enviado com sucesso' };
  }

  private generateCode(params: SendVerificationCodeParams): string {
    if (process.env.NODE_ENV !== 'production') {
      if (params.type === 'email') return '0000';
      return params.destination.replace(/\D/g, '').slice(-4).padStart(4, '0');
    }
    return Math.floor(Math.random() * 10 ** CODE_LENGTH)
      .toString()
      .padStart(CODE_LENGTH, '0');
  }
}
