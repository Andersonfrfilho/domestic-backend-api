import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@app/config/config.module';

import { CONNECTIONS_NAMES } from '../../database.constant';
import { DATABASE_POSTGRES_SOURCE } from '../../database.token';

import PostgresDataSource from './postgres.database-connection';

let initPromise: Promise<void> | null = null;

function ensureInitialized(): Promise<void> {
  if (PostgresDataSource.isInitialized) return Promise.resolve();
  if (!initPromise) {
    initPromise = PostgresDataSource.initialize().then(() => undefined);
  }
  return initPromise;
}

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      name: CONNECTIONS_NAMES.POSTGRES,
      imports: [ConfigModule],
      useFactory: async () => {
        await ensureInitialized();
        return PostgresDataSource.options;
      },
    }),
  ],
  providers: [
    {
      provide: DATABASE_POSTGRES_SOURCE,
      useFactory: async () => {
        await ensureInitialized();
        return PostgresDataSource;
      },
    },
  ],
  exports: [DATABASE_POSTGRES_SOURCE, TypeOrmModule],
})
export class SharedProviderDatabaseImplementationsPostgresModule {}
