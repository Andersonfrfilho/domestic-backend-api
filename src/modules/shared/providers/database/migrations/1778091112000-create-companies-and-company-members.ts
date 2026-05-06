import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateCompaniesAndCompanyMembers1778091112000 implements MigrationInterface {
  name = 'CreateCompaniesAndCompanyMembers1778091112000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create companies table
    await queryRunner.createTable(
      new Table({
        name: 'companies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'document',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'company_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'trade_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'state_registration',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'municipal_registration',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'pending'],
            default: "'pending'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for companies
    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'companies_document_idx',
        columnNames: ['document'],
      }),
    );
    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'companies_company_name_idx',
        columnNames: ['company_name'],
      }),
    );
    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'companies_trade_name_idx',
        columnNames: ['trade_name'],
      }),
    );
    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'companies_status_idx',
        columnNames: ['status'],
      }),
    );

    // Create company_members table
    await queryRunner.createTable(
      new Table({
        name: 'company_members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'partner', 'employee'],
            default: "'partner'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'pending'],
            default: "'active'",
          },
          {
            name: 'joined_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create unique constraint for company_members
    await queryRunner.createIndex(
      'company_members',
      new TableIndex({
        name: 'company_members_company_user_unique',
        columnNames: ['company_id', 'user_id'],
        isUnique: true,
      }),
    );

    // Create foreign keys for company_members
    await queryRunner.createForeignKey(
      'company_members',
      new TableForeignKey({
        name: 'fk_company_members_company',
        columnNames: ['company_id'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'company_members',
      new TableForeignKey({
        name: 'fk_company_members_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('company_members', 'fk_company_members_user');
    await queryRunner.dropForeignKey('company_members', 'fk_company_members_company');
    await queryRunner.dropIndex('company_members', 'company_members_company_user_unique');
    await queryRunner.dropTable('company_members');
    await queryRunner.dropIndex('companies', 'companies_status_idx');
    await queryRunner.dropIndex('companies', 'companies_trade_name_idx');
    await queryRunner.dropIndex('companies', 'companies_company_name_idx');
    await queryRunner.dropIndex('companies', 'companies_document_idx');
    await queryRunner.dropTable('companies');
  }
}
