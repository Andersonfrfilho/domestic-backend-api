import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { CompanyModule } from '@modules/company/company.module';
import { UserModule } from '@modules/user/user.module';
import { Email } from '@modules/shared/providers/database/entities/email.entity';
import { Phone } from '@modules/shared/providers/database/entities/phone.entity';
import { TermsAcceptance } from '@modules/shared/providers/database/entities/terms-acceptance.entity';
import { TermsVersion } from '@modules/shared/providers/database/entities/terms-version.entity';
import { UserDocument } from '@modules/shared/providers/database/entities/user-document.entity';
import { User } from '@modules/shared/providers/database/entities/user.entity';
import { UserEmail } from '@modules/shared/providers/database/entities/user-email.entity';
import { UserPhone } from '@modules/shared/providers/database/entities/user-phone.entity';
import { VerificationCode } from '@modules/shared/providers/database/entities/verification-code.entity';

import { OnboardingController } from './onboarding.controller';
import { OnboardingRegisterUseCase } from './use-cases/register/onboarding-register.use-case';
import { SendVerificationCodeUseCase } from './use-cases/verification/send-verification-code.use-case';
import { VerifyCodeUseCase } from './use-cases/verification/verify-code.use-case';

@Module({
  imports: [
    UserModule,
    CompanyModule,
    TypeOrmModule.forFeature(
      [Email, Phone, TermsAcceptance, TermsVersion, User, UserDocument, UserEmail, UserPhone, VerificationCode],
      CONNECTIONS_NAMES.POSTGRES,
    ),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingRegisterUseCase, SendVerificationCodeUseCase, VerifyCodeUseCase],
})
export class OnboardingModule {}
