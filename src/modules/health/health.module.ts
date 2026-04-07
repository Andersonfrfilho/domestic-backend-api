import { Module } from '@nestjs/common';

import { SharedModule } from '@modules/shared/shared.module';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [SharedModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
