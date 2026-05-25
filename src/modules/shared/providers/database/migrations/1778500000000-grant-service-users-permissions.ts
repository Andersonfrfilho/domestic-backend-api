import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Grants ALL PRIVILEGES on all existing tables/sequences to domestic_cron and domestic_worker.
 * Also sets DEFAULT PRIVILEGES so every future table created by domestic_api
 * is automatically accessible to these service users — without needing to re-run
 * any external init script after each migration.
 *
 * Root cause: migrations run as domestic_api; new tables created by domestic_api
 * are only accessible to their owner by default. domestic_cron and domestic_worker
 * would get "permission denied for table <new_table>" until an explicit GRANT was applied.
 */
export class GrantServiceUsersPermissions1778500000000 implements MigrationInterface {
  name = 'GrantServiceUsersPermissions1778500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Grant on all currently existing tables and sequences
    await queryRunner.query(`
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO domestic_cron;
    `);
    await queryRunner.query(`
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO domestic_worker;
    `);
    await queryRunner.query(`
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO domestic_cron;
    `);
    await queryRunner.query(`
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO domestic_worker;
    `);

    // Set default privileges so every future table/sequence created by domestic_api
    // is automatically accessible — no manual intervention needed after new migrations
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT ALL ON TABLES TO domestic_cron;
    `);
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT ALL ON TABLES TO domestic_worker;
    `);
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT ALL ON SEQUENCES TO domestic_cron;
    `);
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT ALL ON SEQUENCES TO domestic_worker;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        REVOKE ALL ON SEQUENCES FROM domestic_worker;
    `);
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        REVOKE ALL ON SEQUENCES FROM domestic_cron;
    `);
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        REVOKE ALL ON TABLES FROM domestic_worker;
    `);
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        REVOKE ALL ON TABLES FROM domestic_cron;
    `);
    await queryRunner.query(`
      REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM domestic_worker;
    `);
    await queryRunner.query(`
      REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM domestic_cron;
    `);
    await queryRunner.query(`
      REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM domestic_worker;
    `);
    await queryRunner.query(`
      REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM domestic_cron;
    `);
  }
}
