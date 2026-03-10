import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export default class UserEmails1763600000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_emails',
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
            name: 'email_id',
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
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['email_id'],
            referencedTableName: 'emails',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            columnNames: ['user_id'],
            name: 'IDX_user_email_user_id',
          },
          {
            columnNames: ['email_id'],
            name: 'IDX_user_email_email_id',
          },
          {
            columnNames: ['user_id', 'is_primary'],
            name: 'IDX_user_email_user_id_primary',
          },
          {
            columnNames: ['user_id', 'email_id'],
            isUnique: true,
            name: 'UQ_user_email_user_email',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_emails', true, true, true);
  }
}
