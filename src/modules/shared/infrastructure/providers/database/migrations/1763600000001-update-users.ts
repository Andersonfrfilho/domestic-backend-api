import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class UpdateUsers1763600000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types
    await queryRunner.query(`
      CREATE TYPE user_status_enum AS ENUM (
        'PENDING',
        'ACTIVE',
        'INACTIVE',
        'BLOCKED'
      )
    `);

    // Add new columns to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'keycloak_id',
        type: 'uuid',
        isUnique: true,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'full_name',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'is_contractor',
        type: 'boolean',
        default: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'is_provider',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'status',
        type: 'user_status_enum',
        default: "'PENDING'",
      }),
    );

    // Create index for keycloak_id
    await queryRunner.query('CREATE INDEX "IDX_users_keycloak_id" ON "users" ("keycloak_id")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'status');
    await queryRunner.dropColumn('users', 'is_provider');
    await queryRunner.dropColumn('users', 'is_contractor');
    await queryRunner.dropColumn('users', 'full_name');
    await queryRunner.dropColumn('users', 'keycloak_id');
    await queryRunner.query('DROP TYPE IF EXISTS user_status_enum');
  }
}
