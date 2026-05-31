import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPricePerHourToProviderService1778600000001 implements MigrationInterface {
  name = 'AddPricePerHourToProviderService1778600000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_services" ADD COLUMN IF NOT EXISTS "price_per_hour" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_services" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "provider_services" DROP COLUMN IF EXISTS "is_active"`);
    await queryRunner.query(
      `ALTER TABLE "provider_services" DROP COLUMN IF EXISTS "price_per_hour"`,
    );
  }
}
