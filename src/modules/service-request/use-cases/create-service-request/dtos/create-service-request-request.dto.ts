import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class CreateServiceRequestRequestDto {
  @ApiProperty({ description: 'ID do prestador' })
  @IsUUID('all', { message: ErrorMessages.invalid('Provider ID') })
  @IsNotEmpty({ message: ErrorMessages.empty('Provider ID') })
  providerId: string;

  @ApiProperty({ description: 'ID do serviço do catálogo' })
  @IsUUID('all', { message: ErrorMessages.invalid('Service ID') })
  @IsNotEmpty({ message: ErrorMessages.empty('Service ID') })
  serviceId: string;

  @ApiProperty({ description: 'ID do endereço onde o serviço será realizado' })
  @IsUUID('all', { message: ErrorMessages.invalid('Address ID') })
  @IsNotEmpty({ message: ErrorMessages.empty('Address ID') })
  addressId: string;

  @ApiPropertyOptional({ description: 'Descrição adicional da solicitação' })
  @IsString({ message: ErrorMessages['string.base']('Descrição') })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Data/hora agendada para o serviço' })
  @IsDateString({}, { message: ErrorMessages['date.base']('Data/hora agendada') })
  @IsOptional()
  scheduledAt?: Date;

  @ApiPropertyOptional({ description: 'Preço combinado' })
  @IsNumber({}, { message: ErrorMessages['number.base']('Preço') })
  @Min(0, { message: ErrorMessages['number.min']('Preço', 0) })
  @IsOptional()
  priceFinal?: number;
}
