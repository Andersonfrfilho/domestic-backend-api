import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AppError } from '@modules/error';
import { APP_ERROR_TYPE } from '@modules/error/filters/error-filter.constant';
import type {
  HandleNonAppErrorParams,
  LogResponseParams,
} from '@modules/error/types/error-filter.types';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(this.constructor.name);

  constructor(@Inject(LOGGER_PROVIDER) private readonly logProvider: LogProviderInterface) {}

  logResponse({ exception, request, status, responseBody, responseHeaders }: LogResponseParams) {
    try {
      const rawRequestId = request.headers['x-request-id'];
      const headerRequestId = (Array.isArray(rawRequestId) ? rawRequestId[0] : rawRequestId) ?? '';
      const exceptionMessage = exception instanceof Error ? exception.message : String(exception);

      this.logProvider.error({
        message: `Exception caught in filter: ${exceptionMessage}`,
        context: 'HttpExceptionFilter.logResponse',
        meta: {
          requestId: headerRequestId,
          request: {
            path: request.url,
            method: request.method,
            headers: request.headers,
            params: request.params,
            query: request.query,
            body: request.body,
          },
          response: {
            status: status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            headers: responseHeaders ?? { 'x-request-id': headerRequestId },
            messages: [exceptionMessage],
          },
          error: {
            type: exception instanceof AppError ? exception.type : 'Error',
            message: exceptionMessage,
            status: status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            body: responseBody,
            details: exception instanceof AppError ? exception.details : undefined,
          },
        },
      });
    } catch (logError) {
      this.logger.error(`Logging failed: ${String(logError)}`);
    }
  }
  private getRequestId(request: FastifyRequest): string {
    // 1. Try to get requestId from request object (set by LoggingInterceptor)
    const requestIdFromRequest = (request as any).requestId;
    if (requestIdFromRequest) {
      return requestIdFromRequest;
    }

    // 2. Try to get from x-request-id header (fallback)
    const rawRequestId = request.headers['x-request-id'];
    return (Array.isArray(rawRequestId) ? rawRequestId[0] : rawRequestId) ?? '';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    if (!response?.raw) {
      return;
    }

    const requestId = this.getRequestId(request);
    response.header('x-request-id', requestId);

    let details: unknown;

    try {
      if (exception instanceof AppError) {
        const status = exception.statusCode;
        const message = exception.message;

        if ((exception.type as string) === APP_ERROR_TYPE.VALIDATION) {
          details = exception.details;
        }

        const responseBody: Record<string, unknown> = {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message,
          code: exception.code,
          type: exception.type,
        };

        if (details) {
          responseBody.details = details;
        }

        if (exception.details && !details) {
          responseBody.details = exception.details;
        }

        this.logResponse({
          exception,
          request,
          status,
          responseBody,
          responseHeaders: { 'x-request-id': requestId },
        });
        response.status(status).send(responseBody);
        return;
      }

      this.handleNonAppError({ exception, request, response, requestId });
    } catch (sendError) {
      this.handleFilterError(sendError);
    }
  }

  private handleNonAppError({ exception, request, response, requestId }: HandleNonAppErrorParams) {
    const status = this.getStatus(exception);
    const message = this.getMessage(exception);

    const errorResponseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };
    this.logResponse({
      exception: exception as Error,
      request,
      status,
      responseBody: errorResponseBody,
      responseHeaders: { 'x-request-id': requestId },
    });
    response.status(status).send(errorResponseBody);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    // BaseAppError (from @adatechnology/shared) uses `.status` instead of `.statusCode`
    if (exception instanceof Error) {
      const maybeStatusHolder = exception as unknown as { status?: unknown };
      if (typeof maybeStatusHolder.status === 'number') {
        return maybeStatusHolder.status;
      }
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      return typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as Record<string, unknown>).message as string | undefined) || 'Error';
    }
    if (exception instanceof Error) {
      return exception.message || 'Internal server error';
    }
    return 'Internal server error';
  }

  private handleFilterError(sendError: unknown) {
    try {
      this.logProvider.error({
        message: 'Failed to send error response',
        context: 'HttpExceptionFilter.handleFilterError',
      });
    } catch (logError) {
      this.logger.error(`Failed to send response: ${String(sendError)}. Logging error: ${String(logError)}`);
    }
  }
}
