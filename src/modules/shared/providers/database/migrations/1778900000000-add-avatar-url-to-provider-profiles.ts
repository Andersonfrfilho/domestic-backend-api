import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddAvatarUrlToProviderProfiles1778900000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE provider_profiles
        ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512) NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE provider_profiles
        DROP COLUMN IF EXISTS avatar_url
    `);
  }
}
