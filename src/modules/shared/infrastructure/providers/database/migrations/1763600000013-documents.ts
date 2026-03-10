import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export default class Documents1763600000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM type for document status
    await queryRunner.query(`
      CREATE TYPE document_status_enum AS ENUM (
        'PENDING_VERIFICATION',
        'VERIFIED',
        'REJECTED',
        'EXPIRED'
      )
    `);

    // Create ENUM type for document types
    await queryRunner.query(`
      CREATE TYPE document_type_enum AS ENUM (
        'CPF',
        'CNPJ',
        'RG',
        'PASSPORT',
        'DRIVER_LICENSE',
        'PROFESSIONAL_LICENSE',
        'CERTIFICATE',
        'OTHER'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'documents',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuidv7()',
          }),
          new TableColumn({
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          }),
          new TableColumn({
            name: 'document_type',
            type: 'document_type_enum',
            isNullable: false,
          }),
          new TableColumn({
            name: 'document_url',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'status',
            type: 'document_status_enum',
            default: "'PENDING_VERIFICATION'",
          }),
          new TableColumn({
            name: 'verified_at',
            type: 'timestamp',
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
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            columnNames: ['user_id'],
            name: 'IDX_document_user_id',
          },
          {
            columnNames: ['status'],
            name: 'IDX_document_status',
          },
          {
            columnNames: ['user_id', 'document_type'],
            isUnique: true,
            name: 'UQ_document_user_document_type',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('documents', true, true, true);
    await queryRunner.query('DROP TYPE IF EXISTS document_status_enum');
    await queryRunner.query('DROP TYPE IF EXISTS document_type_enum');
  }
}
