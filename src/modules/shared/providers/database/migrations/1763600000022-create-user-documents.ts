import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export default class CreateUserDocuments1763600000022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'document_number', type: 'varchar' },
          { name: 'document_type', type: 'varchar', comment: 'CPF, CNPJ, RG, etc' },
          { name: 'status', type: 'varchar', default: "'PENDING'" },
          { name: 'verified_at', type: 'timestamp', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          { name: 'updated_at', type: 'timestamp', isNullable: true },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'user_documents',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'user_documents',
      new TableIndex({
        name: 'user_documents_number_idx',
        columnNames: ['document_number'],
      }),
    );

    const hasDocumentColumn = await queryRunner.hasColumn('users', 'document');
    if (hasDocumentColumn) {
      await queryRunner.dropColumn('users', 'document');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user_documents');
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('user_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('user_documents', foreignKey);
      }
      const index = table.indices.find((idx) => idx.name === 'user_documents_number_idx');
      if (index) {
        await queryRunner.dropIndex('user_documents', index);
      }
    }

    await queryRunner.dropTable('user_documents');

    await queryRunner.addColumn(
      'users',
      new Table({
        name: 'document',
        columns: [{ name: 'document', type: 'varchar', isNullable: true }],
      }).columns[0],
    );
  }
}
