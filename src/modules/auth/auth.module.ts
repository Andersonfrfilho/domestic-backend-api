import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VerificationCode } from '@modules/shared/providers/database/entities/verification-code.entity';
import { TermsAcceptance } from '@modules/shared/providers/database/entities/terms-acceptance.entity';
import { TermsVersion } from '@modules/shared/providers/database/entities/terms-version.entity';
import { VerificationCodeRepository } from '@modules/shared/providers/database/repositories/verification-code.repository';
import { TermsAcceptanceRepository } from '@modules/shared/providers/database/repositories/terms-acceptance.repository';
import { TermsVersionRepository } from '@modules/shared/providers/database/repositories/terms-version.repository';

import { AuthController } from './auth.controller';
import { SendVerificationCodeUseCase } from './use-cases/send-verification-code/send-verification-code.use-case';
import { VerifyCodeUseCase } from './use-cases/verify-code/verify-code.use-case';
import { LookupCepUseCase } from './use-cases/lookup-cep/lookup-cep.use-case';
import { AcceptTermsUseCase } from './use-cases/accept-terms/accept-terms.use-case';
import { GetCurrentTermsVersionUseCase } from './use-cases/get-current-terms/get-current-terms.use-case';
import { CheckPendingTermsUseCase } from './use-cases/check-pending-terms/check-pending-terms.use-case';
import { ListTermsVersionsUseCase } from './use-cases/list-terms-versions/list-terms-versions.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationCode, TermsAcceptance, TermsVersion])],
  controllers: [AuthController],
  providers: [
    VerificationCodeRepository,
    TermsAcceptanceRepository,
    TermsVersionRepository,
    SendVerificationCodeUseCase,
    VerifyCodeUseCase,
    LookupCepUseCase,
    AcceptTermsUseCase,
    GetCurrentTermsVersionUseCase,
    CheckPendingTermsUseCase,
    ListTermsVersionsUseCase,
  ],
  exports: [
    SendVerificationCodeUseCase,
    VerifyCodeUseCase,
    LookupCepUseCase,
    AcceptTermsUseCase,
    GetCurrentTermsVersionUseCase,
    CheckPendingTermsUseCase,
    ListTermsVersionsUseCase,
  ],
})
export class AuthModule {}
