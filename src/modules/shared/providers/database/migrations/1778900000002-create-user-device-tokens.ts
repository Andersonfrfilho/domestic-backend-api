import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateUserDeviceTokens1778900000002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_device_tokens (
        id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      TEXT        NOT NULL,
        platform   VARCHAR(10) NOT NULL DEFAULT 'unknown',
        created_at TIMESTAMP   NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP   NULL
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS user_device_tokens_user_token_idx
        ON user_device_tokens (user_id, token)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS user_device_tokens_user_idx
        ON user_device_tokens (user_id)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_device_tokens`);
  }
}
