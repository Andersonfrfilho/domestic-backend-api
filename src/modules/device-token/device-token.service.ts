import { Inject, Injectable } from '@nestjs/common';

import { type DeviceTokenRepositoryInterface } from './device-token.repository.interface';
import { DEVICE_TOKEN_REPOSITORY_PROVIDE } from './device-token.token';

export interface DeviceTokenServiceInterface {
  register(params: { userId: string; token: string; platform: string }): Promise<void>;
}

@Injectable()
export class DeviceTokenService implements DeviceTokenServiceInterface {
  constructor(
    @Inject(DEVICE_TOKEN_REPOSITORY_PROVIDE)
    private readonly repository: DeviceTokenRepositoryInterface,
  ) {}

  register(params: { userId: string; token: string; platform: string }): Promise<void> {
    return this.repository.upsert(params);
  }
}
