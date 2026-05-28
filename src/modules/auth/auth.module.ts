import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '@modules/email/email.module';
import { PhoneModule } from '@modules/phone/phone.module';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { Category } from '@modules/shared/providers/database/entities/category.entity';
import { ProviderAvailability } from '@modules/shared/providers/database/entities/provider-availability.entity';
import { ProviderService } from '@modules/shared/providers/database/entities/provider-service.entity';
import { UserDocument } from '@modules/shared/providers/database/entities/user-document.entity';
import { User } from '@modules/shared/providers/database/entities/user.entity';
import { TermsAcceptanceRepository } from '@modules/shared/providers/database/repositories/terms-acceptance.repository';
import { TermsVersionRepository } from '@modules/shared/providers/database/repositories/terms-version.repository';
import { VerificationCodeRepository } from '@modules/shared/providers/database/repositories/verification-code.repository';
import { SharedModule } from '@modules/shared/shared.module';

import { AuthController } from './auth.controller';
import { CategoryRepository } from './repositories/category.repository';
import { ProviderAvailabilityRepository } from './repositories/provider-availability.repository';
import { ProviderServiceRepository } from './repositories/provider-service.repository';
import { AcceptTermsUseCase } from './use-cases/accept-terms/accept-terms.use-case';
import { CheckDocumentExistsUseCase } from './use-cases/check-document-exists/check-document-exists.use-case';
import { CheckEmailExistsUseCase } from './use-cases/check-email-exists/check-email-exists.use-case';
import { CheckPendingTermsUseCase } from './use-cases/check-pending-terms/check-pending-terms.use-case';
import { CheckPhoneExistsUseCase } from './use-cases/check-phone-exists/check-phone-exists.use-case';
import { ForgotPasswordUseCase } from './use-cases/forgot-password/forgot-password.use-case';
import { GetCurrentTermsVersionUseCase } from './use-cases/get-current-terms/get-current-terms.use-case';
import { ListTermsVersionsUseCase } from './use-cases/list-terms-versions/list-terms-versions.use-case';
import { LookupCepUseCase } from './use-cases/lookup-cep/lookup-cep.use-case';
import { CreateProviderServiceUseCase } from './use-cases/provider-profile/create-provider-service.use-case';
import { DeleteProviderServiceUseCase } from './use-cases/provider-profile/delete-provider-service.use-case';
import { GetCategoriesUseCase } from './use-cases/provider-profile/get-categories.use-case';
import { GetProviderAvailabilityUseCase } from './use-cases/provider-profile/get-provider-availability.use-case';
import { GetProviderServicesUseCase } from './use-cases/provider-profile/get-provider-services.use-case';
import { SetProviderAvailabilityUseCase } from './use-cases/provider-profile/set-provider-availability.use-case';
import { UpdateProviderAvailabilityUseCase } from './use-cases/provider-profile/update-provider-availability.use-case';
import { UpdateProviderServiceUseCase } from './use-cases/provider-profile/update-provider-service.use-case';
import { SendVerificationCodeUseCase } from './use-cases/send-verification-code/send-verification-code.use-case';
import { VerifyCodeUseCase } from './use-cases/verify-code/verify-code.use-case';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature(
      [User, UserDocument, Category, ProviderService, ProviderAvailability],
      CONNECTIONS_NAMES.POSTGRES,
    ),
    EmailModule,
    PhoneModule,
  ],
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
    ForgotPasswordUseCase,
    CategoryRepository,
    ProviderServiceRepository,
    ProviderAvailabilityRepository,
    GetCategoriesUseCase,
    CreateProviderServiceUseCase,
    GetProviderServicesUseCase,
    UpdateProviderServiceUseCase,
    DeleteProviderServiceUseCase,
    SetProviderAvailabilityUseCase,
    GetProviderAvailabilityUseCase,
    UpdateProviderAvailabilityUseCase,
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
    ForgotPasswordUseCase,
    GetCategoriesUseCase,
    CreateProviderServiceUseCase,
    GetProviderServicesUseCase,
    UpdateProviderServiceUseCase,
    DeleteProviderServiceUseCase,
    SetProviderAvailabilityUseCase,
    GetProviderAvailabilityUseCase,
    UpdateProviderAvailabilityUseCase,
  ],
})
export class AuthModule {}
