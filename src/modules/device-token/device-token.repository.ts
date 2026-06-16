import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { UserDeviceToken } from '@modules/shared/providers/database/entities/user-device-token.entity';

import { type DeviceTokenRepositoryInterface } from './device-token.repository.interface';

@Injectable()
export class DeviceTokenRepository implements DeviceTokenRepositoryInterface {
  constructor(
    @InjectRepository(UserDeviceToken, CONNECTIONS_NAMES.POSTGRES)
    private readonly repo: Repository<UserDeviceToken>,
  ) {}

  async upsert(params: { userId: string; token: string; platform: string }): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(UserDeviceToken)
      .values({ userId: params.userId, token: params.token, platform: params.platform })
      .orUpdate(['token', 'updated_at'], ['user_id', 'token'])
      .execute();
  }

  async findTokensByUserIds(userIds: string[]): Promise<Map<string, string>> {
    if (!userIds.length) return new Map();

    const rows = await this.repo
      .createQueryBuilder('udt')
      .select(['udt.user_id', 'udt.token'])
      .where('udt.user_id IN (:...userIds)', { userIds })
      .distinctOn(['udt.user_id'])
      .orderBy('udt.user_id')
      .addOrderBy('udt.updated_at', 'DESC')
      .getRawMany<{ udt_user_id: string; udt_token: string }>();

    return new Map(rows.map((row) => [row.udt_user_id, row.udt_token]));
  }
}
