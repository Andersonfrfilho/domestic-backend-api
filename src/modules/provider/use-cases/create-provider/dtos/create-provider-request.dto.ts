import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class CreateProviderRequestDto {
  @ApiProperty({ description: 'ID interno do usuário' })
  @IsUUID('all', { message: ErrorMessages.invalid('User ID') })
  @IsNotEmpty({ message: ErrorMessages.empty('User ID') })
  userId: string;

  @ApiPropertyOptional({ description: 'Nome comercial do prestador' })
  @IsString({ message: ErrorMessages['string.base']('Nome comercial') })
  @IsOptional()
  businessName?: string;

  @ApiPropertyOptional({ description: 'Descrição do prestador' })
  @IsString({ message: ErrorMessages['string.base']('Descrição') })
  @IsOptional()
  description?: string;
}
