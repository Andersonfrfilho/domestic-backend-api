import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAccountBlocks1778256000000 implements MigrationInterface {
  name = 'CreateAccountBlocks1778256000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'account_blocks',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'reason', type: 'varchar', length: '50' },
          { name: 'message', type: 'text', isNullable: true },
          { name: 'blocked_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'resolved_at', type: 'timestamp', isNullable: true },
          { name: 'resolved_by', type: 'uuid', isNullable: true },
          { name: 'can_retry_at', type: 'timestamp', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'account_blocks',
      new TableIndex({ name: 'idx_account_blocks_user', columnNames: ['user_id'] }),
    );
    await queryRunner.createIndex(
      'account_blocks',
      new TableIndex({ name: 'idx_account_blocks_reason', columnNames: ['reason'] }),
    );

    await queryRunner.createForeignKey(
      'account_blocks',
      new TableForeignKey({
        name: 'fk_account_blocks_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('account_blocks', 'fk_account_blocks_user');
    await queryRunner.dropIndex('account_blocks', 'idx_account_blocks_reason');
    await queryRunner.dropIndex('account_blocks', 'idx_account_blocks_user');
    await queryRunner.dropTable('account_blocks');
  }
}
