import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdditionalPercentageToProviderAvailability1778700000001 implements MigrationInterface {
  name = 'AddAdditionalPercentageToProviderAvailability1778700000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "provider_availability"
      ADD COLUMN IF NOT EXISTS "additional_percentage" smallint NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "provider_availability"
      DROP COLUMN IF EXISTS "additional_percentage"
    `);
  }
}
