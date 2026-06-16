import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class VerifyPhoneCodeRequestDto {
  @ApiProperty({ example: '1234', description: '4-digit verification code' })
  @IsString({ message: ErrorMessages['string.base']('Código') })
  @IsNotEmpty({ message: ErrorMessages.empty('Código') })
  @Length(4, 4)
  code: string;
}
