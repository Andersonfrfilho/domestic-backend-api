import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddDetailsToProviderPaymentMethods1778800000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE provider_payment_methods
        ADD COLUMN IF NOT EXISTS details JSONB NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE provider_payment_methods
        DROP COLUMN IF EXISTS details
    `);
  }
}
