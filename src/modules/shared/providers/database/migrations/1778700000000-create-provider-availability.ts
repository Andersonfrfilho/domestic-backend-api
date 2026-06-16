import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProviderAvailability1778700000000 implements MigrationInterface {
  name = 'CreateProviderAvailability1778700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "provider_availability" (
        "id"          uuid            NOT NULL DEFAULT gen_random_uuid(),
        "provider_id" uuid            NOT NULL,
        "day_of_week" smallint        NOT NULL,
        "start_time"  time            NOT NULL,
        "end_time"    time            NOT NULL,
        "is_active"             boolean         NOT NULL DEFAULT true,
        "additional_percentage" smallint        NOT NULL DEFAULT 0,
        "created_at"            timestamp       NOT NULL DEFAULT now(),
        "updated_at"            timestamp                DEFAULT now(),
        CONSTRAINT "PK_provider_availability" PRIMARY KEY ("id"),
        CONSTRAINT "FK_provider_availability_provider"
          FOREIGN KEY ("provider_id")
          REFERENCES "provider_profiles" ("id")
          ON DELETE CASCADE,
      )
    `);

    await queryRunner.query(`
      GRANT SELECT, INSERT, UPDATE, DELETE ON "provider_availability" TO domestic_api
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "provider_availability"`);
  }
}
