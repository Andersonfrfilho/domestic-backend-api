import { Controller, Get } from '@nestjs/common';
import { register } from 'prom-client';

@Controller('metrics')
export class PrometheusMetricsController {
  @Get()
  async metrics(): Promise<string> {
    return register.metrics();
  }
}
