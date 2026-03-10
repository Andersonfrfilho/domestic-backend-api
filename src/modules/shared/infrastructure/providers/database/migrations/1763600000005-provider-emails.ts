import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export default class ProviderEmails1763600000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'provider_emails',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuidv7()',
          }),
          new TableColumn({
            name: 'provider_id',
            type: 'uuid',
            isNullable: false,
          }),
          new TableColumn({
            name: 'email_id',
            type: 'uuid',
            isNullable: false,
          }),
          new TableColumn({
            name: 'label',
            type: 'varchar',
            isNullable: true,
          }),
          new TableColumn({
            name: 'is_primary',
            type: 'boolean',
            default: false,
          }),
          new TableColumn({
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          }),
        ],
        foreignKeys: [
          {
            columnNames: ['provider_id'],
            referencedTableName: 'provider_profiles',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['email_id'],
            referencedTableName: 'emails',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            columnNames: ['provider_id'],
            name: 'IDX_provider_email_provider_id',
          },
          {
            columnNames: ['email_id'],
            name: 'IDX_provider_email_email_id',
          },
          {
            columnNames: ['provider_id', 'is_primary'],
            name: 'IDX_provider_email_provider_id_primary',
          },
          {
            columnNames: ['provider_id', 'email_id'],
            isUnique: true,
            name: 'UQ_provider_email_provider_email',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('provider_emails', true, true, true);
  }
}
