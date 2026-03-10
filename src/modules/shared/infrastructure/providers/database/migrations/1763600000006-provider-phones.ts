import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export default class ProviderPhones1763600000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'provider_phones',
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
            name: 'phone_id',
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
            columnNames: ['phone_id'],
            referencedTableName: 'phones',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            columnNames: ['provider_id'],
            name: 'IDX_provider_phone_provider_id',
          },
          {
            columnNames: ['phone_id'],
            name: 'IDX_provider_phone_phone_id',
          },
          {
            columnNames: ['provider_id', 'is_primary'],
            name: 'IDX_provider_phone_provider_id_primary',
          },
          {
            columnNames: ['provider_id', 'phone_id'],
            isUnique: true,
            name: 'UQ_provider_phone_provider_phone',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('provider_phones', true, true, true);
  }
}
