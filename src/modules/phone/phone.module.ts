import { ApiAuthGuard } from '@adatechnology/auth-keycloak';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Phone } from '@modules/shared/providers/database/entities/phone.entity';
import { UserPhone } from '@modules/shared/providers/database/entities/user-phone.entity';
import { SharedModule } from '@modules/shared/shared.module';
import { UserModule } from '@modules/user/user.module';

import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { PhoneRepository } from './repositories/phone.repository';
import { UserPhoneRepository } from './repositories/user-phone.repository';
import { AddUserPhoneUseCase } from './use-cases/add-user-phone/add-user-phone.use-case';
import { ListUserPhonesUseCase } from './use-cases/list-user-phones/list-user-phones.use-case';
import { RemoveUserPhoneUseCase } from './use-cases/remove-user-phone/remove-user-phone.use-case';
import { SendPhoneVerificationUseCase } from './use-cases/send-phone-verification/send-phone-verification.use-case';
import { VerifyPhoneCodeUseCase } from './use-cases/verify-phone-code/verify-phone-code.use-case';
import { PhoneController } from './phone.controller';
import { PhoneService } from './phone.service';
import {
  ADD_USER_PHONE_USE_CASE_PROVIDE,
  LIST_USER_PHONES_USE_CASE_PROVIDE,
  PHONE_REPOSITORY_PROVIDE,
  PHONE_SERVICE_PROVIDE,
  REMOVE_USER_PHONE_USE_CASE_PROVIDE,
  SEND_PHONE_VERIFICATION_USE_CASE_PROVIDE,
  USER_PHONE_REPOSITORY_PROVIDE,
  VERIFY_PHONE_CODE_USE_CASE_PROVIDE,
} from './phone.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([Phone, UserPhone], CONNECTIONS_NAMES.POSTGRES),
    SharedModule,
    UserModule,
  ],
  controllers: [PhoneController],
  providers: [
    ApiAuthGuard,
    { provide: PHONE_REPOSITORY_PROVIDE, useClass: PhoneRepository },
    { provide: USER_PHONE_REPOSITORY_PROVIDE, useClass: UserPhoneRepository },
    { provide: ADD_USER_PHONE_USE_CASE_PROVIDE, useClass: AddUserPhoneUseCase },
    { provide: LIST_USER_PHONES_USE_CASE_PROVIDE, useClass: ListUserPhonesUseCase },
    { provide: REMOVE_USER_PHONE_USE_CASE_PROVIDE, useClass: RemoveUserPhoneUseCase },
    { provide: SEND_PHONE_VERIFICATION_USE_CASE_PROVIDE, useClass: SendPhoneVerificationUseCase },
    { provide: VERIFY_PHONE_CODE_USE_CASE_PROVIDE, useClass: VerifyPhoneCodeUseCase },
    { provide: PHONE_SERVICE_PROVIDE, useClass: PhoneService },
  ],
  exports: [PHONE_SERVICE_PROVIDE, PHONE_REPOSITORY_PROVIDE],
})
export class PhoneModule {}
