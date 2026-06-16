import { AuthUser, B2CGuard } from '@adatechnology/nestjs-auth-keycloak';
import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';

import { type DeviceTokenServiceInterface } from './device-token.service';
import { DEVICE_TOKEN_SERVICE_PROVIDE } from './device-token.token';
import { RegisterDeviceTokenDto } from './use-cases/register-device-token/register-device-token.dto';

@ApiTags('Device Tokens')
@Controller('/device-tokens')
export class DeviceTokenController {
  constructor(
    @Inject(DEVICE_TOKEN_SERVICE_PROVIDE)
    private readonly deviceTokenService: DeviceTokenServiceInterface,
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
  ) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(B2CGuard)
  @ApiOperation({ summary: 'Registrar ou atualizar token FCM do dispositivo' })
  @ApiHeader({ name: 'X-Access-Token', required: true, description: 'User JWT forwarded by Kong' })
  @ApiNoContentResponse()
  async register(
    @AuthUser() keycloakId: string,
    @Body() body: RegisterDeviceTokenDto,
  ): Promise<void> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    await this.deviceTokenService.register({
      userId: user.id,
      token: body.token,
      platform: body.platform,
    });
  }
}
