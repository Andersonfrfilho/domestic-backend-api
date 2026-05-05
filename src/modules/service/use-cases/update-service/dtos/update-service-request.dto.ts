import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class UpdateServiceRequestDto {
  @ApiProperty({
    example: ' limpeza-residencial-id-uuid',
    description: 'ID da categoria vinculada',
    required: false,
  })
  @IsOptional()
  @IsUUID('all', { message: ErrorMessages.invalid('Category ID') })
  categoryId?: string;

  @ApiProperty({ example: 'Faxina Pesada', description: 'Nome do serviço', required: false })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Nome') })
  name?: string;

  @ApiProperty({
    example: 'Serviço de limpeza profunda de residências',
    description: 'Descrição detalhada do serviço',
    required: false,
  })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Descrição') })
  description?: string;
}
