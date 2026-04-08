import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class CreateUserRequestDto {
  @ApiProperty({
    description: 'The full name of the user',
    example: faker.person.fullName(),
  })
  @IsString({ message: ErrorMessages['string.base']('Nome Completo') })
  fullName: string;

  @ApiProperty({
    description: 'The Keycloak ID linked to this user',
    example: faker.string.uuid(),
    required: false,
  })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Keycloak ID') })
  keycloakId?: string;

  @ApiProperty({
    description: 'The status of the user account',
    example: 'PENDING',
    required: false,
    default: 'PENDING',
    enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'],
  })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Status') })
  status?: string;
}
