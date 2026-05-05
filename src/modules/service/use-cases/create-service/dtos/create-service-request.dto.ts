import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class CreateServiceRequestDto {
  @ApiProperty({
    example: ' limpeza-residencial-id-uuid',
    description: 'ID da categoria vinculada',
  })
  @IsUUID('all', { message: ErrorMessages.invalid('Category ID') })
  categoryId: string;

  @ApiProperty({ example: 'Faxina Geral', description: 'Nome do serviço' })
  @IsString({ message: ErrorMessages['string.base']('Nome') })
  name: string;

  @ApiProperty({
    example: 'Serviço de limpeza completa de residências',
    description: 'Descrição detalhada do serviço',
    required: false,
  })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Descrição') })
  description?: string;
}
