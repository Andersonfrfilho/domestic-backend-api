import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '@modules/shared/shared.module';
import { rabbitConnection } from '@modules/shared/providers/queue/producer/implementations/rabbitmq/rabbit.connection';
import { User } from '@modules/shared/providers/database/entities/user.entity';

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
import { CheckEmailExistsUseCase } from './use-cases/check-email-exists/check-email-exists.use-case';
import { CheckPhoneExistsUseCase } from './use-cases/check-phone-exists/check-phone-exists.use-case';
import { CheckDocumentExistsUseCase } from './use-cases/check-document-exists/check-document-exists.use-case';

@Module({
  imports: [SharedModule, rabbitConnection, TypeOrmModule.forFeature([User], CONNECTIONS_NAMES.POSTGRES)],
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
    CheckEmailExistsUseCase,
    CheckPhoneExistsUseCase,
    CheckDocumentExistsUseCase,
  ],
  exports: [
    SendVerificationCodeUseCase,
    VerifyCodeUseCase,
    LookupCepUseCase,
    AcceptTermsUseCase,
    GetCurrentTermsVersionUseCase,
    CheckPendingTermsUseCase,
    ListTermsVersionsUseCase,
    CheckEmailExistsUseCase,
    CheckPhoneExistsUseCase,
    CheckDocumentExistsUseCase,
  ],
})
export class AuthModule {}
