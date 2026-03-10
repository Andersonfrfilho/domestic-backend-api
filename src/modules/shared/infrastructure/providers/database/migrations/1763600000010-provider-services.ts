import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export default class ProviderServices1763600000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM type for price types
    await queryRunner.query(`
      CREATE TYPE price_type_enum AS ENUM (
        'FIXED',
        'HOURLY',
        'DAILY',
        'MONTHLY',
        'BY_PROJECT'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'provider_services',
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
            name: 'service_id',
            type: 'uuid',
            isNullable: false,
          }),
          new TableColumn({
            name: 'price_base',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          }),
          new TableColumn({
            name: 'price_type',
            type: 'price_type_enum',
            isNullable: false,
          }),
          new TableColumn({
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          }),
          new TableColumn({
            name: 'updated_at',
            type: 'timestamp',
            isNullable: true,
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
            columnNames: ['service_id'],
            referencedTableName: 'services',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            columnNames: ['provider_id'],
            name: 'IDX_provider_service_provider_id',
          },
          {
            columnNames: ['service_id'],
            name: 'IDX_provider_service_service_id',
          },
          {
            columnNames: ['provider_id', 'service_id'],
            isUnique: true,
            name: 'UQ_provider_service_provider_service',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('provider_services', true, true, true);
    await queryRunner.query('DROP TYPE IF EXISTS price_type_enum');
  }
}
