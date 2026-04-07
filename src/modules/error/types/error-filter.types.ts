import type { HttpException } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import type { AppError } from '@modules/error';

export interface LogResponseParams {
  exception: AppError | HttpException | Error;
  request: FastifyRequest;
  status?: number;
  responseBody?: Record<string, unknown>;
  responseHeaders?: Record<string, string>;
}

export interface HandleNonAppErrorParams {
  exception: unknown;
  request: FastifyRequest;
  response: FastifyReply;
  requestId: string;
}
