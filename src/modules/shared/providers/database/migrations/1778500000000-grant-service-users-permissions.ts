import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates a shared group role `backend_services` and grants it to all service users.
 *
 * Why a group role instead of per-user grants:
 * - Each new service only needs `GRANT backend_services TO <new_user>` in init-database.sh
 * - No migration changes needed when new services are added
 * - ALTER DEFAULT PRIVILEGES on the role covers ALL future tables automatically
 *
 * Root cause fixed: migrations run as backend_api, so tables created by
 * migrations were only accessible to backend_api. Other service users
 * (backend_cron, backend_worker, etc.) got "permission denied" errors.
 *
 * DB users in this cluster:
 *   backend_api    — owner, runs migrations
 *   backend_cron   — member of backend_services
 *   backend_worker — member of backend_services
 */
export class GrantServiceUsersPermissions1778500000000 implements MigrationInterface {
  name = 'GrantServiceUsersPermissions1778500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create shared group role for all backend services
    // IF NOT EXISTS avoids error if migration is re-run or role already exists
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'backend_services') THEN
          CREATE ROLE backend_services;
        END IF;
      END $$;
    `);

    // Grant the group role to every service user that reads/writes the DB.
    // Wrapped in DO blocks so the migration does not fail if a user does not
    // yet exist in the cluster (e.g. during initial setup or staging environments).
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'backend_cron') THEN
          GRANT backend_services TO backend_cron;
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'backend_worker') THEN
          GRANT backend_services TO backend_worker;
        END IF;
      END $$;
    `);

    // Grant all existing tables and sequences to the group role
    await queryRunner.query(`
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO backend_services;
    `);
    await queryRunner.query(`
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO backend_services;
    `);

    // Set default privileges so every future table/sequence created by backend_api
    // (the migration runner) is automatically accessible to all members of backend_services
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT ALL ON TABLES TO backend_services;
    `);
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT ALL ON SEQUENCES TO backend_services;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        REVOKE ALL ON SEQUENCES FROM backend_services;
    `);
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        REVOKE ALL ON TABLES FROM backend_services;
    `);
    await queryRunner.query(`
      REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM backend_services;
    `);
    await queryRunner.query(`
      REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM backend_services;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'backend_worker') THEN
          REVOKE backend_services FROM backend_worker;
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'backend_cron') THEN
          REVOKE backend_services FROM backend_cron;
        END IF;
      END $$;
    `);
    await queryRunner.query(`DROP ROLE IF EXISTS backend_services;`);
  }
}
