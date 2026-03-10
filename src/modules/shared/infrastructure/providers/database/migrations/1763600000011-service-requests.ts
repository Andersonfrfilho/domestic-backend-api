import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export default class ServiceRequests1763600000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM type for service request status
    await queryRunner.query(`
      CREATE TYPE service_request_status_enum AS ENUM (
        'PENDING',
        'ACCEPTED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'REJECTED'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'service_requests',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuidv7()',
          }),
          new TableColumn({
            name: 'contractor_id',
            type: 'uuid',
            isNullable: false,
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
            name: 'address_id',
            type: 'uuid',
            isNullable: false,
          }),
          new TableColumn({
            name: 'status',
            type: 'service_request_status_enum',
            default: "'PENDING'",
          }),
          new TableColumn({
            name: 'contractor_confirmed',
            type: 'boolean',
            default: false,
          }),
          new TableColumn({
            name: 'provider_confirmed',
            type: 'boolean',
            default: false,
          }),
          new TableColumn({
            name: 'description',
            type: 'text',
            isNullable: true,
          }),
          new TableColumn({
            name: 'scheduled_at',
            type: 'timestamp',
            isNullable: true,
          }),
          new TableColumn({
            name: 'price_final',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: true,
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
            columnNames: ['contractor_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
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
            onDelete: 'RESTRICT',
          },
          {
            columnNames: ['address_id'],
            referencedTableName: 'addresses',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
        indices: [
          {
            columnNames: ['contractor_id'],
            name: 'IDX_service_request_contractor_id',
          },
          {
            columnNames: ['provider_id'],
            name: 'IDX_service_request_provider_id',
          },
          {
            columnNames: ['service_id'],
            name: 'IDX_service_request_service_id',
          },
          {
            columnNames: ['address_id'],
            name: 'IDX_service_request_address_id',
          },
          {
            columnNames: ['status'],
            name: 'IDX_service_request_status',
          },
          {
            columnNames: ['scheduled_at'],
            name: 'IDX_service_request_scheduled_at',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('service_requests', true, true, true);
    await queryRunner.query('DROP TYPE IF EXISTS service_request_status_enum');
  }
}
