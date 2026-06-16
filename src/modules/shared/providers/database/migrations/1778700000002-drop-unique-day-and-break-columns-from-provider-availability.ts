import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUniqueDayAndBreakColumnsFromProviderAvailability1778700000002 implements MigrationInterface {
  name = 'DropUniqueDayAndBreakColumnsFromProviderAvailability1778700000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "provider_availability"
      DROP CONSTRAINT IF EXISTS "UQ_provider_availability_day"
    `);

    await queryRunner.query(`
      ALTER TABLE "provider_availability"
      DROP COLUMN IF EXISTS "break_start",
      DROP COLUMN IF EXISTS "break_end"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "provider_availability"
      ADD COLUMN IF NOT EXISTS "break_start" time,
      ADD COLUMN IF NOT EXISTS "break_end" time
    `);

    await queryRunner.query(`
      ALTER TABLE "provider_availability"
      ADD CONSTRAINT "UQ_provider_availability_day" UNIQUE ("provider_id", "day_of_week")
    `);
  }
}
