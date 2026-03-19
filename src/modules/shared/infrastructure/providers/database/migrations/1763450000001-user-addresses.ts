import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export default class UserAddresses1763450000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_addresses',
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
            name: 'street',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'number',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'complement',
            type: 'varchar',
            isNullable: true,
          }),
          new TableColumn({
            name: 'neighborhood',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'city',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'state',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'zipcode',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'latitude',
            type: 'decimal',
            isNullable: true,
          }),
          new TableColumn({
            name: 'longitude',
            type: 'decimal',
            isNullable: true,
          }),
          new TableColumn({
            name: 'label',
            type: 'varchar',
            isNullable: true,
          }),
          new TableColumn({
            name: 'is_primary',
            type: 'boolean',
            isNullable: false,
            default: false,
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
          new TableColumn({
            name: 'deleted_at',
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
            name: 'IDX_user_address_user_id',
          },
          {
            columnNames: ['user_id', 'is_primary'],
            name: 'IDX_user_address_user_id_primary',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_addresses', true, true, true);
  }
}
