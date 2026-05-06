import { Module } from '@nestjs/common';

import { CompanyModule } from '@modules/company/company.module';
import { UserModule } from '@modules/user/user.module';

import { OnboardingController } from './onboarding.controller';
import { OnboardingRegisterUseCase } from './use-cases/register/onboarding-register.use-case';

@Module({
  imports: [UserModule, CompanyModule],
  controllers: [OnboardingController],
  providers: [OnboardingRegisterUseCase],
})
export class OnboardingModule {}
