import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class AddUserPhoneRequestDto {
  @ApiProperty({ example: '+5585999990000' })
  @IsString({ message: ErrorMessages['string.base']('Número') })
  @IsNotEmpty({ message: ErrorMessages.empty('Número') })
  number: string;

  @ApiProperty({ example: 'MOBILE', enum: ['MOBILE', 'LANDLINE', 'WHATSAPP'], required: false })
  @IsOptional()
  @IsIn(['MOBILE', 'LANDLINE', 'WHATSAPP'])
  type?: string;

  @ApiProperty({ example: 'Pessoal', required: false })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Label') })
  label?: string;

  @ApiProperty({ example: false, required: false, default: false })
  @IsOptional()
  @IsBoolean({ message: ErrorMessages['boolean.base']('Primary') })
  isPrimary?: boolean;
}
