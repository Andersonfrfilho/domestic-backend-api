import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Version(VERSION_NEUTRAL)
  @ApiOperation({ summary: 'Health check (version-neutral) — responds on /health' })
  async health() {
    const payload = await this.healthService.getHealth();
    if (payload.status !== 'ok') {
      throw new HttpException(payload, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return payload;
  }
}
