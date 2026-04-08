import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class CreateUserDto {
  @IsString({ message: ErrorMessages['string.base']('Nome') })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @IsEmail({}, { message: ErrorMessages['email.base']('Email') })
  email: string;

  @IsString({ message: ErrorMessages['string.base']('Senha') })
  @MinLength(6, { message: ErrorMessages['string.min']('Senha', 6) })
  @MaxLength(128, { message: ErrorMessages['string.max']('Senha', 128) })
  password: string;
}
