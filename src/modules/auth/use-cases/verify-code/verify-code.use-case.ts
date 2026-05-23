import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { TraceMethod } from '@adatechnology/logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { VerificationCodeRepository } from '@modules/shared/providers/database/repositories/verification-code.repository';

import {
  VerifyCodeParams,
  VerifyCodeResponse,
  VerifyCodeUseCaseInterface,
} from './verify-code.interface';

@Injectable()
export class VerifyCodeUseCase implements VerifyCodeUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly verificationCodeRepo: VerificationCodeRepository,
  ) {}

  @TraceMethod()
  async execute(params: VerifyCodeParams): Promise<VerifyCodeResponse> {
    const activeCode = await this.verificationCodeRepo.findActiveCode(
      params.destination,
      params.type,
    );

    if (!activeCode) {
      throw new BadRequestException('Nenhum código ativo encontrado. Solicite um novo código.');
    }

    if (activeCode.code !== params.code) {
      throw new BadRequestException('Código inválido');
    }

    await this.verificationCodeRepo.markAsUsed(activeCode.id);

    this.logProvider.info({
      message: 'Verification code verified successfully',
      context: this.logContext,
      meta: { destination: params.destination, type: params.type },
    });

    return {
      success: true,
      verified: true,
      message: 'Código verificado com sucesso',
    };
  }
}
