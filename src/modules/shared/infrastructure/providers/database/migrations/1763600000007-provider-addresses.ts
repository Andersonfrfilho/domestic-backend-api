import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export default class ProviderAddresses1763600000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'provider_addresses',
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
            name: 'address_id',
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
            columnNames: ['address_id'],
            referencedTableName: 'addresses',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            columnNames: ['provider_id'],
            name: 'IDX_provider_address_provider_id',
          },
          {
            columnNames: ['address_id'],
            name: 'IDX_provider_address_address_id',
          },
          {
            columnNames: ['provider_id', 'is_primary'],
            name: 'IDX_provider_address_provider_id_primary',
          },
          {
            columnNames: ['provider_id', 'address_id'],
            isUnique: true,
            name: 'UQ_provider_address_provider_address',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('provider_addresses', true, true, true);
  }
}
