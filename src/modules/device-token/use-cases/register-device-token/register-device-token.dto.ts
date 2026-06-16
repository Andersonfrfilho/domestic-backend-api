import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDeviceTokenDto {
  @ApiProperty({ description: 'Token FCM do dispositivo' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ enum: ['ios', 'android', 'unknown'], default: 'unknown' })
  @IsIn(['ios', 'android', 'unknown'])
  platform: 'ios' | 'android' | 'unknown';
}
