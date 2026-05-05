import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class UpdateProviderRequestDto {
  @ApiPropertyOptional()
  @IsString({ message: ErrorMessages['string.base']('Nome comercial') })
  @IsOptional()
  businessName?: string;

  @ApiPropertyOptional()
  @IsString({ message: ErrorMessages['string.base']('Descrição') })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsBoolean({ message: ErrorMessages['boolean.base']('Disponibilidade') })
  @IsOptional()
  isAvailable?: boolean;
}
