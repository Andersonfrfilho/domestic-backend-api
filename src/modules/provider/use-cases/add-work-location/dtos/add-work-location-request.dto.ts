import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class AddWorkLocationRequestDto {
  @ApiProperty({ description: 'ID do endereço existente' })
  @IsUUID('all', { message: ErrorMessages.invalid('Address ID') })
  @IsNotEmpty({ message: ErrorMessages.empty('Address ID') })
  addressId: string;

  @ApiPropertyOptional({ description: 'Nome/rótulo do local de atendimento' })
  @IsString({ message: ErrorMessages['string.base']('Nome') })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Define como local principal' })
  @IsBoolean({ message: ErrorMessages['boolean.base']('Local principal') })
  @IsOptional()
  isPrimary?: boolean;
}
