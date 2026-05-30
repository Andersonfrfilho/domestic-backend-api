import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { CompanyModule } from '@modules/company/company.module';
import { DocumentModule } from '@modules/document/document.module';
import { Document } from '@modules/shared/providers/database/entities/document.entity';
import { Email } from '@modules/shared/providers/database/entities/email.entity';
import { Phone } from '@modules/shared/providers/database/entities/phone.entity';
import { ProviderAddress } from '@modules/shared/providers/database/entities/provider-address.entity';
import { ProviderDocument } from '@modules/shared/providers/database/entities/provider-document.entity';
import { ProviderEmail } from '@modules/shared/providers/database/entities/provider-email.entity';
import { ProviderPhone } from '@modules/shared/providers/database/entities/provider-phone.entity';
import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderWorkLocation } from '@modules/shared/providers/database/entities/provider-work-location.entity';
import { TermsAcceptance } from '@modules/shared/providers/database/entities/terms-acceptance.entity';
import { TermsVersion } from '@modules/shared/providers/database/entities/terms-version.entity';
import { UserDocument } from '@modules/shared/providers/database/entities/user-document.entity';
import { UserEmail } from '@modules/shared/providers/database/entities/user-email.entity';
import { UserPhone } from '@modules/shared/providers/database/entities/user-phone.entity';
import { User } from '@modules/shared/providers/database/entities/user.entity';
import { VerificationCode } from '@modules/shared/providers/database/entities/verification-code.entity';
import { UserModule } from '@modules/user/user.module';

import { OnboardingController } from './onboarding.controller';
import { OnboardingRegisterUseCase } from './use-cases/register/onboarding-register.use-case';
import { SendVerificationCodeUseCase } from './use-cases/verification/send-verification-code.use-case';
import { VerifyCodeUseCase } from './use-cases/verification/verify-code.use-case';

@Module({
  imports: [
    DocumentModule,
    UserModule,
    CompanyModule,
    TypeOrmModule.forFeature(
      [
        Document,
        Email,
        Phone,
        TermsAcceptance,
        TermsVersion,
        User,
        UserDocument,
        UserEmail,
        UserPhone,
        VerificationCode,
        ProviderProfile,
        ProviderEmail,
        ProviderPhone,
        ProviderVerification,
        ProviderDocument,
        ProviderAddress,
        ProviderWorkLocation,
      ],
      CONNECTIONS_NAMES.POSTGRES,
    ),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingRegisterUseCase, SendVerificationCodeUseCase, VerifyCodeUseCase],
})
export class OnboardingModule {}
