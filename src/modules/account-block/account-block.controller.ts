import { AuthUser, B2CGuard } from '@adatechnology/auth-keycloak';
import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';

import { ACCOUNT_BLOCK_GET_STATUS_USE_CASE } from './account-block.token';
import type { GetAccountBlockStatusUseCaseInterface, AccountBlockStatus } from './use-cases/get-status/get-status.interface';

@ApiTags('Account Block')
@Controller('users/me')
export class AccountBlockController {
  constructor(
    @Inject(ACCOUNT_BLOCK_GET_STATUS_USE_CASE)
    private readonly getStatusUseCase: GetAccountBlockStatusUseCaseInterface,
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
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
}
