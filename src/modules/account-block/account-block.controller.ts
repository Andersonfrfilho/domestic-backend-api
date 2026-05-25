import { AuthUser, B2CGuard } from '@adatechnology/nestjs-auth-keycloak';
import { Body, Controller, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';

import {
  ACCOUNT_BLOCK_GET_STATUS_USE_CASE,
  ACCOUNT_BLOCK_SELF_UNLOCK_INITIATE_USE_CASE,
  ACCOUNT_BLOCK_SELF_UNLOCK_VERIFY_USE_CASE,
} from './account-block.token';
import type { GetAccountBlockStatusUseCaseInterface, AccountBlockStatus } from './use-cases/get-status/get-status.interface';
import type { SelfUnlockInitiateUseCaseInterface } from './use-cases/self-unlock-initiate/self-unlock-initiate.interface';
import type { SelfUnlockVerifyUseCaseInterface } from './use-cases/self-unlock-verify/self-unlock-verify.interface';

@ApiTags('Account Block')
@Controller('users/me')
export class AccountBlockController {
  constructor(
    @Inject(ACCOUNT_BLOCK_GET_STATUS_USE_CASE)
    private readonly getStatusUseCase: GetAccountBlockStatusUseCaseInterface,
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
    @Inject(ACCOUNT_BLOCK_SELF_UNLOCK_INITIATE_USE_CASE)
    private readonly selfUnlockInitiateUseCase: SelfUnlockInitiateUseCaseInterface,
    @Inject(ACCOUNT_BLOCK_SELF_UNLOCK_VERIFY_USE_CASE)
    private readonly selfUnlockVerifyUseCase: SelfUnlockVerifyUseCaseInterface,
  ) {}

  @Get('account-status')
  @UseGuards(B2CGuard)
  @ApiOperation({ summary: 'Verificar status de bloqueio da conta' })
  @ApiHeader({ name: 'X-Access-Token', required: true, description: 'User JWT forwarded by Kong' })
  @ApiResponse({ status: 200, description: 'Status da conta' })
  async getStatus(@AuthUser() keycloakId: string): Promise<AccountBlockStatus> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.getStatusUseCase.execute({ userId: user.id });
  }

  @Post('account-block/:blockId/self-unlock')
  @UseGuards(B2CGuard)
  @ApiOperation({ summary: 'Iniciar auto-desbloqueio' })
  @ApiHeader({ name: 'X-Access-Token', required: true })
  @ApiResponse({ status: 200, description: 'Código enviado' })
  async initiateSelfUnlock(
    @Param('blockId') blockId: string,
    @AuthUser() keycloakId: string,
  ) {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.selfUnlockInitiateUseCase.execute({ blockId, userId: user.id });
  }

  @Post('account-block/:blockId/self-unlock/verify')
  @UseGuards(B2CGuard)
  @ApiOperation({ summary: 'Validar código de auto-desbloqueio' })
  @ApiHeader({ name: 'X-Access-Token', required: true })
  @ApiResponse({ status: 200, description: 'Conta desbloqueada' })
  async verifySelfUnlock(
    @Param('blockId') blockId: string,
    @Body() body: { code: string },
    @AuthUser() keycloakId: string,
  ) {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.selfUnlockVerifyUseCase.execute({ blockId, userId: user.id, code: body.code });
  }
}
