import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { AccountBlock } from '@app/modules/shared/providers/database/entities/account-block.entity';
import { UserModule } from '@modules/user/user.module';

import { AccountBlockController } from './account-block.controller';
import { ACCOUNT_BLOCK_GET_STATUS_USE_CASE } from './account-block.token';
import { GetAccountBlockStatusUseCase } from './use-cases/get-status/get-status.use-case';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([AccountBlock], CONNECTIONS_NAMES.POSTGRES),
  ],
  controllers: [AccountBlockController],
  providers: [{ provide: ACCOUNT_BLOCK_GET_STATUS_USE_CASE, useClass: GetAccountBlockStatusUseCase }],
})
export class AccountBlockModule {}
