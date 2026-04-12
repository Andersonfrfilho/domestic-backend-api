import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class VerifyEmailCodeRequestDto {
  @ApiProperty({ example: '0000', description: 'Verification code sent to email' })
  @IsString({ message: ErrorMessages['string.base']('Código') })
  @IsNotEmpty({ message: ErrorMessages.empty('Código') })
  code: string;
}
