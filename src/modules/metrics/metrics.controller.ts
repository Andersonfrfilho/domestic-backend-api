import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { register } from 'prom-client';

@Controller('metrics')
export class PrometheusMetricsController {
  @Get()
  @Version(VERSION_NEUTRAL)
  async metrics(): Promise<string> {
    return register.metrics();
  }
}
