import { HttpStatus } from '@nestjs/common';

import { AppError, ErrorType } from '@modules/error/app.error';
import type {
  AuthenticationErrorConfig,
  AuthorizationErrorConfig,
  BusinessLogicErrorConfig,
  ConflictErrorConfig,
  ErrorConfig,
  NotFoundErrorConfig,
  RateLimitErrorConfig,
} from '@modules/error/configs';
import { DEFAULT_ERROR_MESSAGES } from '@modules/error/constants';

export class AppErrorFactory {
  private static computeOriginFromStack(): string | undefined {
    try {
      const st = new Error().stack;
      if (!st) return undefined;
      const lines = st
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      // lines[0] = Error
      // find first stack frame that is not inside AppErrorFactory or AppError
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!/ErrorFactory|AppError|new Error\(\)/.test(line)) {
          const m = /at\s+([^\s(]+)/.exec(line);
          if (m && m[1]) return m[1];
        }
      }
      return undefined;
    } catch (e) {
      return undefined;
    }
  }
  static validation(config: ErrorConfig): AppError {
    return new AppError({
      type: ErrorType.VALIDATION,
      message: config.message,
      statusCode: HttpStatus.BAD_REQUEST,
      details: config.details,
    });
  }

  static authentication(config: AuthenticationErrorConfig): AppError {
    return new AppError({
      type: ErrorType.AUTHENTICATION,
      message: config.message,
      statusCode: HttpStatus.UNAUTHORIZED,
      code: config.code,
    });
  }

  static authorization(config: AuthorizationErrorConfig): AppError {
    return new AppError({
      type: ErrorType.AUTHORIZATION,
      message: config.message,
      statusCode: HttpStatus.FORBIDDEN,
      code: config.code,
    });
  }

  static notFound(config: NotFoundErrorConfig): AppError {
    return new AppError({
      type: ErrorType.NOT_FOUND,
      message: config.message,
      statusCode: HttpStatus.NOT_FOUND,
      code: config.code,
      details: config.details,
      origin: this.computeOriginFromStack(),
    });
  }

  static conflict(config: ConflictErrorConfig): AppError {
    return new AppError({
      type: ErrorType.CONFLICT,
      message: config.message,
      statusCode: HttpStatus.CONFLICT,
      code: config.code,
      details: config.details,
      origin: this.computeOriginFromStack(),
    });
  }

  static businessLogic(config: BusinessLogicErrorConfig): AppError {
    return new AppError({
      type: ErrorType.BUSINESS_LOGIC,
      message: config.message,
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      code: config.code,
      details: config.details,
      origin: this.computeOriginFromStack(),
    });
  }

  static rateLimit(config: RateLimitErrorConfig): AppError {
    return new AppError({
      type: ErrorType.BUSINESS_LOGIC,
      message: config.message,
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      code: config.code,
      details: config.details,
    });
  }

  static internalServer(config?: ErrorConfig): AppError {
    return new AppError({
      type: ErrorType.INTERNAL_SERVER,
      message: config?.message || DEFAULT_ERROR_MESSAGES.INTERNAL_SERVER,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }

  static fromValidationErrors(errors: unknown[]): AppError {
    const validationErrors = Array.isArray(errors)
      ? errors.map((error: any) => ({
          field: error.property,
          constraints: error.constraints,
          children: error.children && error.children.length > 0 ? error.children : undefined,
        }))
      : [];

    // Extract missing fields (properties that failed presence/emptiness checks)
    const missingConstraintKeys = new Set([
      'isDefined',
      'isNotEmpty',
      'isNotEmptyObject',
      'isNotEmptyArray',
    ]);

    const extractMissingFields = (errs: any[], parentPath = ''): string[] => {
      const result: string[] = [];
      for (const e of errs || []) {
        const path = parentPath ? `${parentPath}.${e.property}` : e.property;
        if (e.constraints) {
          const keys = Object.keys(e.constraints);
          if (keys.some((k) => missingConstraintKeys.has(k))) {
            result.push(path);
          }
        }
        if (e.children && e.children.length > 0) {
          result.push(...extractMissingFields(e.children, path));
        }
      }
      return result;
    };

    const missingFields = extractMissingFields(Array.isArray(errors) ? (errors as any[]) : []);

    const details = {
      validationErrors,
      count: validationErrors.length,
      missingFields: Array.from(new Set(missingFields)),
    };

    return this.validation({
      message: DEFAULT_ERROR_MESSAGES.VALIDATION_FAILED,
      details,
    });
  }
}
