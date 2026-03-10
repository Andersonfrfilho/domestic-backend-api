import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export default class Reviews1763600000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reviews',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuidv7()',
          }),
          new TableColumn({
            name: 'service_request_id',
            type: 'uuid',
            isNullable: false,
            isUnique: true,
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
            name: 'rating',
            type: 'int',
            isNullable: false,
          }),
          new TableColumn({
            name: 'comment',
            type: 'text',
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
            columnNames: ['service_request_id'],
            referencedTableName: 'service_requests',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
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
        ],
        indices: [
          {
            columnNames: ['service_request_id'],
            name: 'IDX_review_service_request_id',
          },
          {
            columnNames: ['contractor_id'],
            name: 'IDX_review_contractor_id',
          },
          {
            columnNames: ['provider_id'],
            name: 'IDX_review_provider_id',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reviews', true, true, true);
  }
}
