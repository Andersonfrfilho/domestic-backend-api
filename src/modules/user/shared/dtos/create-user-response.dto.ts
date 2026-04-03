import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResponseDto {
  @ApiProperty({
    description: 'The ID of the user',
    example: faker.string.uuid(),
  })
  id: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'João da Silva',
    nullable: true,
  })
  fullName: string | null;

  @ApiProperty({
    description: 'The keycloak ID of the user',
    example: faker.string.uuid(),
    nullable: true,
  })
  keycloakId: string | null;

  @ApiProperty({
    description: 'Inidicates the status of the user',
    example: 'ACTIVE',
  })
  status: string;

  @ApiProperty({
    description: 'The creation date of the user',
    example: faker.date.past().toISOString(),
  })
  createdAt: Date;
}
