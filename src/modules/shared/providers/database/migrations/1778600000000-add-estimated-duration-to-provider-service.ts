import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEstimatedDurationToProviderService1778600000000 implements MigrationInterface {
  name = 'AddEstimatedDurationToProviderService1778600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_services" ADD COLUMN IF NOT EXISTS "estimated_duration_minutes" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_services" DROP COLUMN IF EXISTS "estimated_duration_minutes"`,
    );
  }
}
