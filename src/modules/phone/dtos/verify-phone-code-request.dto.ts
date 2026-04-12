import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class VerifyPhoneCodeRequestDto {
  @ApiProperty({ example: '123456', description: '6-digit verification code' })
  @IsString({ message: ErrorMessages['string.base']('Código') })
  @IsNotEmpty({ message: ErrorMessages.empty('Código') })
  @Length(6, 6)
  code: string;
}
