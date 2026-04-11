import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class Addresses1763450000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'addresses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'street', type: 'varchar' },
          { name: 'number', type: 'varchar' },
          { name: 'complement', type: 'varchar', isNullable: true },
          { name: 'neighborhood', type: 'varchar' },
          { name: 'city', type: 'varchar' },
          { name: 'state', type: 'varchar' },
          { name: 'zipcode', type: 'varchar' },
          { name: 'latitude', type: 'varchar', isNullable: true },
          { name: 'longitude', type: 'varchar', isNullable: true },
          { name: 'is_verified', type: 'boolean', default: false },
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('addresses');
  }
}
