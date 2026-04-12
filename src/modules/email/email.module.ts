import { ApiAuthGuard } from '@adatechnology/auth-keycloak';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Email } from '@modules/shared/providers/database/entities/email.entity';
import { UserEmail } from '@modules/shared/providers/database/entities/user-email.entity';
import { SharedModule } from '@modules/shared/shared.module';
import { UserModule } from '@modules/user/user.module';

import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { EmailRepository } from './repositories/email.repository';
import { UserEmailRepository } from './repositories/user-email.repository';
import { AddUserEmailUseCase } from './use-cases/add-user-email/add-user-email.use-case';
import { ListUserEmailsUseCase } from './use-cases/list-user-emails/list-user-emails.use-case';
import { RemoveUserEmailUseCase } from './use-cases/remove-user-email/remove-user-email.use-case';
import { SendEmailVerificationUseCase } from './use-cases/send-email-verification/send-email-verification.use-case';
import { VerifyEmailCodeUseCase } from './use-cases/verify-email-code/verify-email-code.use-case';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import {
  ADD_USER_EMAIL_USE_CASE_PROVIDE,
  EMAIL_REPOSITORY_PROVIDE,
  EMAIL_SERVICE_PROVIDE,
  LIST_USER_EMAILS_USE_CASE_PROVIDE,
  REMOVE_USER_EMAIL_USE_CASE_PROVIDE,
  SEND_EMAIL_VERIFICATION_USE_CASE_PROVIDE,
  USER_EMAIL_REPOSITORY_PROVIDE,
  VERIFY_EMAIL_CODE_USE_CASE_PROVIDE,
} from './email.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([Email, UserEmail], CONNECTIONS_NAMES.POSTGRES),
    SharedModule,
    UserModule,
  ],
  controllers: [EmailController],
  providers: [
    ApiAuthGuard,
    { provide: EMAIL_REPOSITORY_PROVIDE, useClass: EmailRepository },
    { provide: USER_EMAIL_REPOSITORY_PROVIDE, useClass: UserEmailRepository },
    { provide: ADD_USER_EMAIL_USE_CASE_PROVIDE, useClass: AddUserEmailUseCase },
    { provide: LIST_USER_EMAILS_USE_CASE_PROVIDE, useClass: ListUserEmailsUseCase },
    { provide: REMOVE_USER_EMAIL_USE_CASE_PROVIDE, useClass: RemoveUserEmailUseCase },
    { provide: SEND_EMAIL_VERIFICATION_USE_CASE_PROVIDE, useClass: SendEmailVerificationUseCase },
    { provide: VERIFY_EMAIL_CODE_USE_CASE_PROVIDE, useClass: VerifyEmailCodeUseCase },
    { provide: EMAIL_SERVICE_PROVIDE, useClass: EmailService },
  ],
  exports: [EMAIL_SERVICE_PROVIDE],
})
export class EmailModule {}
