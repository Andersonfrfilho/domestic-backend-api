import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class UpdateCategoryRequestDto {
  @ApiProperty({ example: 'Limpeza Residencial', description: 'Nome da categoria', required: false })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Nome') })
  name?: string;

  @ApiProperty({ example: 'limpeza-residencial', description: 'Slug único para URL', required: false })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Slug') })
  slug?: string;

  @ApiProperty({
    example: 'https://cdn.example.com/icons/limpeza.png',
    description: 'URL do ícone',
    required: false,
  })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Ícone') })
  iconUrl?: string;
}
