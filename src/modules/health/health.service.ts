import type { CacheProviderInterface } from '@adatechnology/nestjs-cache';
import { CACHE_PROVIDER } from '@adatechnology/nestjs-cache';
import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { DATABASE_POSTGRES_SOURCE } from '@app/modules/shared/providers/database/database.token';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { GetHealthResult, HealthPayload, TimeoutParams, CheckResult } from './types/health.types';

function timeout<T>({ ms, message = 'timeout' }: TimeoutParams): Promise<T> {
  return new Promise((_, rej) => setTimeout(() => rej(new Error(message)), ms));
}

@Injectable()
export class HealthService {
  constructor(
    @Inject(LOGGER_PROVIDER) private readonly logProvider: LogProviderInterface,
    @Inject(DATABASE_POSTGRES_SOURCE) private readonly dataSource: DataSource,
    @Inject(CACHE_PROVIDER) private readonly cacheProvider: CacheProviderInterface,
  ) {}

  private async checkDatabase(): Promise<CheckResult> {
    try {
      const start = Date.now();
      // Run a simple lightweight query with timeout
      const q = this.dataSource.query('SELECT 1');
      await Promise.race([q, timeout({ ms: 1000, message: 'db timeout' })]);
      const elapsed = Date.now() - start;
      return { status: 'up', details: { responseMs: elapsed } };
    } catch (err: any) {
      this.logProvider.warn({
        message: 'Database health check failed',
        context: 'HealthService.checkDatabase',
        meta: { error: err?.message },
      });
      return { status: 'down', details: { error: err?.message } };
    }
  }

  private async checkRedis(): Promise<CheckResult> {
    const key = `health:ping:${Date.now()}`;
    try {
      const start = Date.now();
      // Attempt to set/get a short-lived key. Use 1 second TTL.
      // Some cache providers accept (key, value, ttlSeconds)
      // We'll race with a timeout to avoid hanging.
      const setPromise = this.cacheProvider.set({ key, value: '1', ttlInSeconds: 1 });
      await Promise.race([setPromise, timeout({ ms: 800, message: 'redis timeout' })]);
      const getPromise = this.cacheProvider.get<string>({ key });
      const val = await Promise.race([getPromise, timeout({ ms: 800, message: 'redis timeout' })]);
      const elapsed = Date.now() - start;
      // best-effort cleanup
      this.cacheProvider.del({ key }).catch(() => null);
      return { status: val ? 'up' : 'down', details: { responseMs: elapsed } };
    } catch (err: any) {
      this.logProvider.warn({
        message: 'Redis health check failed',
        context: 'HealthService.checkRedis',
        meta: { error: err?.message },
      });
      return { status: 'down', details: { error: err?.message } };
    }
  }

  async getHealth(): Promise<GetHealthResult> {
    const [db, redis] = await Promise.all([this.checkDatabase(), this.checkRedis()]);

    const allUp = db.status === 'up' && redis.status === 'up';

    const payload: HealthPayload = {
      status: allUp ? 'ok' : 'fail',
      info: {
        database: { status: db.status },
        redis: { status: redis.status },
      },
      error: {},
      details: {
        database: db.details ?? {},
        redis: redis.details ?? {},
      },
    };

    if (!allUp) {
      payload.error = { message: 'One or more critical dependencies are down' };
    }

    return payload;
  }
}
