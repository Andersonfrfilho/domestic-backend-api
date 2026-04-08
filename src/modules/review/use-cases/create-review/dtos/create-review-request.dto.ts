import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class CreateReviewRequestDto {
  @ApiProperty({ description: 'ID da solicitação de serviço concluída' })
  @IsUUID('all', { message: ErrorMessages.invalid('Service Request ID') })
  @IsNotEmpty({ message: ErrorMessages.empty('Service Request ID') })
  serviceRequestId: string;

  @ApiProperty({ description: 'Nota de 1 a 5', minimum: 1, maximum: 5 })
  @IsInt({ message: ErrorMessages['number.base']('Nota') })
  @Min(1, { message: ErrorMessages['number.min']('Nota', 1) })
  @Max(5, { message: ErrorMessages['number.max']('Nota', 5) })
  rating: number;

  @ApiPropertyOptional({ description: 'Comentário sobre o serviço' })
  @IsString({ message: ErrorMessages['string.base']('Comentário') })
  @IsOptional()
  comment?: string;
}
