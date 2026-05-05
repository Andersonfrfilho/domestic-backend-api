import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class RejectProviderRequestDto {
  @ApiProperty({ description: 'Motivo da rejeição' })
  @IsString({ message: ErrorMessages['string.base']('Motivo') })
  @IsNotEmpty({ message: ErrorMessages.empty('Motivo') })
  reason: string;
}
