import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { Email } from '@modules/shared/providers/database/entities/email.entity';
import { Phone } from '@modules/shared/providers/database/entities/phone.entity';
import { UserEmail } from '@modules/shared/providers/database/entities/user-email.entity';
import { UserPhone } from '@modules/shared/providers/database/entities/user-phone.entity';
import { VerificationCode } from '@modules/shared/providers/database/entities/verification-code.entity';

import type { VerificationChannel } from './send-verification-code.use-case';

export interface VerifyCodeParams {
  type: VerificationChannel;
  destination: string;
  code: string;
}

export interface VerifyCodeResult {
  verified: boolean;
}

@Injectable()
export class VerifyCodeUseCase {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    @InjectRepository(VerificationCode, CONNECTIONS_NAMES.POSTGRES)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    @InjectRepository(Email, CONNECTIONS_NAMES.POSTGRES)
    private readonly emailRepository: Repository<Email>,
    @InjectRepository(Phone, CONNECTIONS_NAMES.POSTGRES)
    private readonly phoneRepository: Repository<Phone>,
    @InjectRepository(UserEmail, CONNECTIONS_NAMES.POSTGRES)
    private readonly userEmailRepository: Repository<UserEmail>,
    @InjectRepository(UserPhone, CONNECTIONS_NAMES.POSTGRES)
    private readonly userPhoneRepository: Repository<UserPhone>,
  ) {}

  async execute(params: VerifyCodeParams): Promise<VerifyCodeResult> {
    const activeCode = await this.verificationCodeRepository
      .createQueryBuilder('vc')
      .where('vc.destination = :destination', { destination: params.destination })
      .andWhere('vc.type = :type', { type: params.type })
      .andWhere('vc.is_used = false')
      .andWhere('vc.expires_at > NOW()')
      .orderBy('vc.created_at', 'DESC')
      .getOne();

    if (!activeCode || activeCode.code !== params.code) {
      this.logProvider.warn({
        message: 'Verification failed — invalid or expired code',
        context: this.logContext,
        meta: { type: params.type, destination: params.destination },
      });
      return { verified: false };
    }

    await this.verificationCodeRepository.update(activeCode.id, {
      isUsed: true,
      verifiedAt: new Date(),
    });

    await this.markRelationshipVerified(params.type, params.destination);

    this.logProvider.info({
      message: 'Verification succeeded',
      context: this.logContext,
      meta: { type: params.type, destination: params.destination, codeId: activeCode.id },
    });

    return { verified: true };
  }

  private async markRelationshipVerified(type: VerificationChannel, destination: string): Promise<void> {
    const now = new Date();

    if (type === 'email') {
      const emailRecord = await this.emailRepository.findOne({ where: { email: destination } });
      if (!emailRecord) return;

      await this.userEmailRepository.update(
        { emailId: emailRecord.id },
        { verifiedAt: now },
      );

      this.logProvider.info({
        message: 'user_emails.verified_at updated',
        context: this.logContext,
        meta: { emailId: emailRecord.id },
      });
      return;
    }

    const phoneRecord = await this.phoneRepository.findOne({ where: { number: destination } });
    if (!phoneRecord) return;

    await this.userPhoneRepository.update(
      { phoneId: phoneRecord.id },
      { verifiedAt: now },
    );

    this.logProvider.info({
      message: 'user_phones.verified_at updated',
      context: this.logContext,
      meta: { phoneId: phoneRecord.id },
    });
  }
}
