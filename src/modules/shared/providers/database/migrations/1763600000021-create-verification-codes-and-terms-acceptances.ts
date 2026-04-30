import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export default class CreateVerificationCodesAndTermsAcceptances1763600000021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'verification_codes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'destination',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '6',
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'verified_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_used',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'verification_codes',
      new TableIndex({
        name: 'IDX_VERIFICATION_CODE_DESTINATION_TYPE',
        columnNames: ['destination', 'type'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'terms_versions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'version',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'content_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: false,
          },
          {
            name: 'effective_date',
            type: 'timestamp',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'terms_acceptances',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'terms_version_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'accepted_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'terms_acceptances',
      new TableForeignKey({
        name: 'FK_TERMS_ACCEPTANCE_VERSION',
        columnNames: ['terms_version_id'],
        referencedTableName: 'terms_versions',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createIndex(
      'terms_acceptances',
      new TableIndex({
        name: 'IDX_TERMS_ACCEPTANCE_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.query(`
      INSERT INTO terms_versions (id, version, title, content_url, is_active, effective_date, created_at)
      VALUES (
        gen_random_uuid(),
        '1.0.0',
        'Termos de Uso - Versão Inicial',
        NULL,
        true,
        NOW(),
        NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('terms_acceptances');
    await queryRunner.dropTable('terms_versions');
    await queryRunner.dropTable('verification_codes');
  }
}
