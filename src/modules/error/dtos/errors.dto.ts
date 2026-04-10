import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppErrorDto {
  @ApiProperty({ description: 'HTTP status code', example: 409 })
  statusCode: number;

  @ApiProperty({ description: 'ISO timestamp of the error', example: '2025-11-01T17:16:42.226Z' })
  timestamp: string;

  @ApiProperty({ description: 'Request path', example: '/v1/users/abc-123' })
  path: string;

  @ApiProperty({ description: 'Human-readable error message', example: 'User not found' })
  message: string;

  @ApiProperty({
    description: 'Machine-readable domain error code — use this in the BFF for routing to specific screens',
    example: 'ACCOUNT_DELETED',
  })
  code: string;

  @ApiProperty({
    description: 'Error category',
    example: 'CONFLICT',
    enum: ['VALIDATION', 'AUTHENTICATION', 'AUTHORIZATION', 'NOT_FOUND', 'CONFLICT', 'BUSINESS_LOGIC', 'INTERNAL_SERVER'],
  })
  type: string;

  @ApiPropertyOptional({
    description: 'Additional context (present on VALIDATION errors)',
    example: { validationErrors: [] },
  })
  details?: Record<string, unknown>;
}

export class InternalServerErrorDto extends AppErrorDto {
  @ApiProperty({ example: HttpStatus.INTERNAL_SERVER_ERROR })
  declare statusCode: number;

  @ApiProperty({ example: 'Internal server error' })
  declare message: string;

  @ApiProperty({ example: 'INTERNAL_SERVER' })
  declare type: string;
}

export class BadRequestErrorValidationRequestDto extends AppErrorDto {
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  declare statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  declare message: string;

  @ApiProperty({ example: 'VALIDATION' })
  declare type: string;

  @ApiProperty({
    description: 'Validation error details',
    example: [{ field: 'email', constraints: { isEmail: 'email must be an email' } }],
  })
  declare details: Record<string, unknown>;
}
