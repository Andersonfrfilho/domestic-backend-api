import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentNumberToDocuments1778700000003 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_number VARCHAR NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE documents DROP COLUMN IF EXISTS document_number`);
  }
}
