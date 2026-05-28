import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUES,
} from '@modules/shared/constants/rabbitmq-queues.constant';
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

export interface ExpirationInfo {
  value: number;
  unit: 'minutos' | 'horas' | 'segundos';
}

export interface SendVerificationCodeResult {
  success: boolean;
  message: string;
  codeId: string;
  expiresIn: ExpirationInfo;
  expiresAt: string;
  destination: string;
  type: VerificationChannel;
}

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
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const savedCode = await this.verificationCodeRepository.save({
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
        codeId: savedCode.id,
        expiresAt,
        ttlMinutes: 5,
        // log code only in non-production for debugging
        ...(process.env.NODE_ENV !== 'production' ? { code } : {}),
      },
    });

    // Format response
    const expirationInfo: ExpirationInfo = {
      value: 5,
      unit: 'minutos',
    };

    const expiresAtFormatted = expiresAt.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });

    // Send via appropriate channel (email or SMS)
    if (params.type === 'email') {
      const emailPayload = {
        body: {
          to: params.destination,
          template_id: 'verification_code',
          variables: {
            code,
            expiresIn: `${5} minutos`,
            expiresAt: expiresAtFormatted,
          },
        },
        metadata: {
          source: 'onboarding-verification',
          destination: params.destination,
          type: 'email',
          codeId: savedCode.id,
        },
      };

      await this.messageProducer.send(RABBITMQ_QUEUES.NOTIFICATIONS.NAME, emailPayload, {
        exchange: RABBITMQ_EXCHANGE,
        routingKey: RABBITMQ_QUEUES.NOTIFICATIONS.ROUTING_KEYS.EMAIL,
        persistent: true,
      });

      this.logProvider.info({
        message: 'Verification email queued for sending',
        context: this.logContext,
        meta: {
          destination: params.destination,
          type: 'email',
          codeId: savedCode.id,
        },
      });
    } else if (params.type === 'phone') {
      const smsPayload = {
        body: {
          to: params.destination,
          template_id: 'verification_code_sms', // matches SMS_TEMPLATES.VERIFICATION_CODE in worker
          variables: {
            code,
            expiresIn: `${5} minutos`,
          },
        },
        metadata: {
          source: 'onboarding-verification',
          destination: params.destination,
          type: 'sms',
          codeId: savedCode.id,
        },
      };

      await this.messageProducer.send(RABBITMQ_QUEUES.NOTIFICATIONS.NAME, smsPayload, {
        exchange: RABBITMQ_EXCHANGE,
        routingKey: RABBITMQ_QUEUES.NOTIFICATIONS.ROUTING_KEYS.SMS,
        persistent: true,
      });

      this.logProvider.info({
        message: 'Verification SMS queued for sending',
        context: this.logContext,
        meta: {
          destination: params.destination,
          type: 'sms',
          codeId: savedCode.id,
        },
      });
    }

    return {
      success: true,
      message: 'Código de verificação enviado com sucesso',
      codeId: savedCode.id,
      expiresIn: expirationInfo,
      expiresAt: expiresAtFormatted,
      destination: params.destination,
      type: params.type,
    };
  }

  private generateCode(params: SendVerificationCodeParams): string {
    if (process.env.NODE_ENV !== 'production') {
      if (params.type === 'email') return '0000';
      return params.destination.replace(/\D/g, '').slice(-4).padStart(4, '0');
    }
    return Math.floor(Math.random() * 10 ** 4)
      .toString()
      .padStart(4, '0');
  }
}
