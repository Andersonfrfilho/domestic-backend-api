import { Controller, Get, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';

@Controller('metrics')
export class PrometheusMetricsController extends PrometheusController {
  @Get()
  @Version([VERSION_NEUTRAL, '1', '2', '3', '4', '5'])
  index(response: unknown) {
    return super.index(response);
  }
}
