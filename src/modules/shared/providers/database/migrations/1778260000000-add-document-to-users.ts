import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

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
      {
        columnNames: ['document'],
        isUnique: true,
        name: 'idx_users_document_unique',
      },
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'idx_users_document_unique');
    await queryRunner.dropColumn('users', 'document');
  }
}
