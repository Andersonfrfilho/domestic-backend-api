import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddPaymentMethodToServiceRequests1778900000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE service_requests
        ADD COLUMN IF NOT EXISTS payment_method_type_id UUID NULL
          REFERENCES payment_method_types(id) ON DELETE SET NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE service_requests
        DROP COLUMN IF EXISTS payment_method_type_id
    `);
  }
}
