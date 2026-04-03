import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

import { ErrorMessages } from '@modules/shared/domain/constants/error-messages.constant';

export class CreateUserRequestDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João da Silva',
    required: false,
  })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Nome completo') })
  fullName?: string;

  @ApiProperty({
    description: 'ID correspondente no Keycloak',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Keycloak ID deve ser um UUID válido' })
  keycloakId?: string;

  @ApiProperty({
    description: 'Status atual do usuário',
    example: 'ACTIVE',
    required: false,
    default: 'PENDING',
  })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Status') })
  status?: string;
}
