import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { UserDeviceToken } from '@modules/shared/providers/database/entities/user-device-token.entity';
import { SharedModule } from '@modules/shared/shared.module';
import { UserModule } from '@modules/user/user.module';

import { DeviceTokenController } from './device-token.controller';
import { DeviceTokenRepository } from './device-token.repository';
import { DeviceTokenService } from './device-token.service';
import {
  DEVICE_TOKEN_REPOSITORY_PROVIDE,
  DEVICE_TOKEN_SERVICE_PROVIDE,
} from './device-token.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDeviceToken], CONNECTIONS_NAMES.POSTGRES),
    SharedModule,
    UserModule,
  ],
  controllers: [DeviceTokenController],
  providers: [
    { provide: DEVICE_TOKEN_REPOSITORY_PROVIDE, useClass: DeviceTokenRepository },
    { provide: DEVICE_TOKEN_SERVICE_PROVIDE, useClass: DeviceTokenService },
  ],
  exports: [DEVICE_TOKEN_REPOSITORY_PROVIDE, DEVICE_TOKEN_SERVICE_PROVIDE],
})
export class DeviceTokenModule {}
