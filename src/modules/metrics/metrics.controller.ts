import { Controller, Get, Res, VERSION_NEUTRAL, Version } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
  @Get()
  @Version(VERSION_NEUTRAL)
  async index(@Res() res: FastifyReply): Promise<string> {
    res.type('text/plain');
    return register.metrics();
  }
}
