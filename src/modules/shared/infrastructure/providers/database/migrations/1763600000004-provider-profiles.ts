import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export default class ProviderProfiles1763600000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'provider_profiles',
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
            isUnique: true,
          }),
          new TableColumn({
            name: 'business_name',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'description',
            type: 'text',
            isNullable: true,
          }),
          new TableColumn({
            name: 'average_rating',
            type: 'numeric',
            precision: 3,
            scale: 2,
            default: 0,
          }),
          new TableColumn({
            name: 'is_available',
            type: 'boolean',
            default: true,
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
            name: 'IDX_provider_profile_user_id',
          },
          {
            columnNames: ['is_available'],
            name: 'IDX_provider_profile_is_available',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('provider_profiles', true, true, true);
  }
}
