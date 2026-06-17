import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddEstimatedHoursToServiceRequests1778900000003 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE service_requests DROP COLUMN IF EXISTS estimated_hours`,
    );
  }
}
