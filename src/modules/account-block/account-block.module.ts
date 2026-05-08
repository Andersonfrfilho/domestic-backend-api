import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { AccountBlock } from '@app/modules/shared/providers/database/entities/account-block.entity';
import { EmailModule } from '@modules/email/email.module';
import { UserModule } from '@modules/user/user.module';

import { AccountBlockController } from './account-block.controller';
import {
  ACCOUNT_BLOCK_CREATE_USE_CASE,
  ACCOUNT_BLOCK_GET_STATUS_USE_CASE,
  ACCOUNT_BLOCK_LIST_USE_CASE,
  ACCOUNT_BLOCK_RESOLVE_USE_CASE,
  ACCOUNT_BLOCK_SELF_UNLOCK_INITIATE_USE_CASE,
  ACCOUNT_BLOCK_SELF_UNLOCK_VERIFY_USE_CASE,
} from './account-block.token';
import { CreateAccountBlockUseCase } from './use-cases/create-block/create-block.use-case';
import { GetAccountBlockStatusUseCase } from './use-cases/get-status/get-status.use-case';
import { ListAccountBlocksUseCase } from './use-cases/list-blocks/list-blocks.use-case';
import { ResolveAccountBlockUseCase } from './use-cases/resolve-block/resolve-block.use-case';
import { SelfUnlockInitiateUseCase } from './use-cases/self-unlock-initiate/self-unlock-initiate.use-case';
import { SelfUnlockVerifyUseCase } from './use-cases/self-unlock-verify/self-unlock-verify.use-case';

@Module({
  imports: [
    UserModule,
    EmailModule,
    TypeOrmModule.forFeature([AccountBlock], CONNECTIONS_NAMES.POSTGRES),
  ],
  controllers: [AccountBlockController],
  providers: [
    { provide: ACCOUNT_BLOCK_GET_STATUS_USE_CASE, useClass: GetAccountBlockStatusUseCase },
    { provide: ACCOUNT_BLOCK_CREATE_USE_CASE, useClass: CreateAccountBlockUseCase },
    { provide: ACCOUNT_BLOCK_RESOLVE_USE_CASE, useClass: ResolveAccountBlockUseCase },
    { provide: ACCOUNT_BLOCK_LIST_USE_CASE, useClass: ListAccountBlocksUseCase },
    { provide: ACCOUNT_BLOCK_SELF_UNLOCK_INITIATE_USE_CASE, useClass: SelfUnlockInitiateUseCase },
    { provide: ACCOUNT_BLOCK_SELF_UNLOCK_VERIFY_USE_CASE, useClass: SelfUnlockVerifyUseCase },
  ],
})
export class AccountBlockModule {}
