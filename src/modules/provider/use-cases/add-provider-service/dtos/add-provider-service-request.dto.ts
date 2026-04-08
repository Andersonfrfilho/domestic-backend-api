import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class AddProviderServiceRequestDto {
  @ApiProperty({ description: 'ID do serviço do catálogo' })
  @IsUUID('all', { message: ErrorMessages.invalid('Service ID') })
  @IsNotEmpty({ message: ErrorMessages.empty('Service ID') })
  serviceId: string;

  @ApiPropertyOptional({ description: 'Preço base cobrado pelo prestador' })
  @IsNumber({}, { message: ErrorMessages['number.base']('Preço base') })
  @Min(0, { message: ErrorMessages['number.min']('Preço base', 0) })
  @IsOptional()
  priceBase?: number;

  @ApiPropertyOptional({ description: 'Tipo de cobrança (ex: HOUR, FIXED)' })
  @IsString({ message: ErrorMessages['string.base']('Tipo de cobrança') })
  @IsOptional()
  priceType?: string;
}
