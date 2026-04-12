import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class AddUserEmailRequestDto {
  @ApiProperty({ example: 'usuario@exemplo.com' })
  @IsEmail()
  @IsNotEmpty({ message: ErrorMessages.empty('Email') })
  email: string;

  @ApiProperty({ example: 'Pessoal', required: false })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Label') })
  label?: string;

  @ApiProperty({ example: false, required: false, default: false })
  @IsOptional()
  @IsBoolean({ message: ErrorMessages['boolean.base']('Primary') })
  isPrimary?: boolean;
}
