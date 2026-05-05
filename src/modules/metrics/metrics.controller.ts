import type { FastifyReply } from 'fastify';
import { Controller, Get, VERSION_NEUTRAL, Version, Res } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly prometheusController: PrometheusController) {}

  @Get()
  @Version(VERSION_NEUTRAL)
  index(@Res() res: FastifyReply) {
    return this.prometheusController.index(res);
  }
}
