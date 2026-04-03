import { LoggerModule } from '@adatechnology/logger';
import { Module } from '@nestjs/common';

import { SharedProviderDatabaseModule } from './database/database.module';
import { SharedInfrastructureProviderQueueModule } from './queue/queue.module';

@Module({
  imports: [LoggerModule, SharedProviderDatabaseModule, SharedInfrastructureProviderQueueModule],
  exports: [LoggerModule, SharedProviderDatabaseModule, SharedInfrastructureProviderQueueModule],
})
export class SharedProviderModule {}
