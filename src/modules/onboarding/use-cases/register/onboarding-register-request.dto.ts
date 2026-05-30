import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class OnboardingRegisterRequestDto {
  @ApiProperty({ example: 'user@example.com', description: 'E-mail do usuário' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Senha do usuário', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'João', description: 'Nome do usuário' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Silva', description: 'Sobrenome do usuário' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '11999999999', description: 'Telefone com DDD' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: '12345678900',
    description: 'Documento (CPF 11 dígitos, CNPJ 14 dígitos, RG 6-9 dígitos, ou Passaporte)',
    required: false,
  })
  @IsString()
  @IsOptional()
  document?: string;

  @ApiProperty({
    example: 'Empresa LTDA',
    description: 'Razão Social (para CNPJ)',
    required: false,
  })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ example: 'Empresa', description: 'Nome Fantasia (para CNPJ)', required: false })
  @IsString()
  @IsOptional()
  tradeName?: string;

  @ApiProperty({ example: true, description: 'Aceite dos termos de uso' })
  @IsBoolean()
  @IsOptional()
  termsAccepted?: boolean;

  @ApiProperty({
    example: 'provider',
    description: 'Tipo de usuário: contractor (contratante) ou provider (prestador)',
    required: false,
    enum: ['contractor', 'provider'],
  })
  @IsIn(['contractor', 'provider'])
  @IsOptional()
  userType?: 'contractor' | 'provider';
}
