import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export default class UserPhones1763600000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM type for phone types
    await queryRunner.query(`
      CREATE TYPE phone_type_enum AS ENUM (
        'MOBILE',
        'LANDLINE',
        'WHATSAPP'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'user_phones',
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
            name: 'phone_id',
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
            columnNames: ['phone_id'],
            referencedTableName: 'phones',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            columnNames: ['user_id'],
            name: 'IDX_user_phone_user_id',
          },
          {
            columnNames: ['phone_id'],
            name: 'IDX_user_phone_phone_id',
          },
          {
            columnNames: ['user_id', 'is_primary'],
            name: 'IDX_user_phone_user_id_primary',
          },
          {
            columnNames: ['user_id', 'phone_id'],
            isUnique: true,
            name: 'UQ_user_phone_user_phone',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_phones', true, true, true);
    await queryRunner.query('DROP TYPE IF EXISTS phone_type_enum');
  }
}
