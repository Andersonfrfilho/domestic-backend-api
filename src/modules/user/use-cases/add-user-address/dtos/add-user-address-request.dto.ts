import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsNotEmpty } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class AddUserAddressRequestDto {
  @ApiProperty({ example: 'Rua das Flores' })
  @IsString({ message: ErrorMessages['string.base']('Rua') })
  @IsNotEmpty({ message: ErrorMessages.empty('Rua') })
  street: string;

  @ApiProperty({ example: '123' })
  @IsString({ message: ErrorMessages['string.base']('Número') })
  @IsNotEmpty({ message: ErrorMessages.empty('Número') })
  number: string;

  @ApiProperty({ example: 'Apto 45', required: false })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Complemento') })
  complement?: string;

  @ApiProperty({ example: 'Centro' })
  @IsString({ message: ErrorMessages['string.base']('Bairro') })
  @IsNotEmpty({ message: ErrorMessages.empty('Bairro') })
  neighborhood: string;

  @ApiProperty({ example: 'Fortaleza' })
  @IsString({ message: ErrorMessages['string.base']('Cidade') })
  @IsNotEmpty({ message: ErrorMessages.empty('Cidade') })
  city: string;

  @ApiProperty({ example: 'CE' })
  @IsString({ message: ErrorMessages['string.base']('Estado') })
  @IsNotEmpty({ message: ErrorMessages.empty('Estado') })
  state: string;

  @ApiProperty({ example: '60010-000' })
  @IsString({ message: ErrorMessages['string.base']('CEP') })
  @IsNotEmpty({ message: ErrorMessages.empty('CEP') })
  zipCode: string;

  @ApiProperty({ example: '-3.7319', required: false })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Latitude') })
  latitude?: string;

  @ApiProperty({ example: '-38.5267', required: false })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Longitude') })
  longitude?: string;

  @ApiProperty({ example: 'Casa', required: false })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Label') })
  label?: string;

  @ApiProperty({ example: false, required: false, default: false })
  @IsOptional()
  @IsBoolean({ message: ErrorMessages['boolean.base']('Primary') })
  isPrimary?: boolean;
}
