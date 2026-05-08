import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { CompanyModule } from '@modules/company/company.module';
import { UserModule } from '@modules/user/user.module';
import { UserDocument } from '@modules/shared/providers/database/entities/user-document.entity';

import { OnboardingController } from './onboarding.controller';
import { OnboardingRegisterUseCase } from './use-cases/register/onboarding-register.use-case';

@Module({
  imports: [
    UserModule,
    CompanyModule,
    TypeOrmModule.forFeature([UserDocument], CONNECTIONS_NAMES.POSTGRES),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingRegisterUseCase],
})
export class OnboardingModule {}
