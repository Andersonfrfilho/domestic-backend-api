import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddDocumentToUsers1778260000000 implements MigrationInterface {
  name = 'AddDocumentToUsers1778260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'document',
        type: 'varchar',
        isNullable: true,
        comment: 'User document number (CPF)',
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_document_unique',
        columnNames: ['document'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'idx_users_document_unique');
    await queryRunner.dropColumn('users', 'document');
  }
}
