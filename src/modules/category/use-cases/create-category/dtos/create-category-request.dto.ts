import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class CreateCategoryRequestDto {
  @ApiProperty({ example: 'Limpeza', description: 'Nome da categoria' })
  @IsString({ message: ErrorMessages['string.base']('Nome') })
  name: string;

  @ApiProperty({ example: 'limpeza', description: 'Slug único para URL' })
  @IsString({ message: ErrorMessages['string.base']('Slug') })
  slug: string;

  @ApiProperty({
    example: 'https://cdn.example.com/icons/limpeza.png',
    description: 'URL do ícone (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Ícone') })
  iconUrl?: string;
}
