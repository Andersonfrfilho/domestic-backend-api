import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateCompanyRelatedTables1778091959 implements MigrationInterface {
  name = 'CreateCompanyRelatedTables1778091959';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // company_addresses
    await queryRunner.createTable(
      new Table({
        name: 'company_addresses',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'company_id', type: 'uuid' },
          { name: 'type', type: 'enum', enum: ['headquarters', 'branch', 'billing', 'delivery'], default: "'headquarters'" },
          { name: 'zip_code', type: 'varchar', length: '10' },
          { name: 'street', type: 'varchar', length: '255' },
          { name: 'number', type: 'varchar', length: '20' },
          { name: 'complement', type: 'varchar', length: '100', isNullable: true },
          { name: 'neighborhood', type: 'varchar', length: '100' },
          { name: 'city', type: 'varchar', length: '100' },
          { name: 'state', type: 'varchar', length: '2' },
          { name: 'country', type: 'varchar', length: '2', default: "'BR'" },
          { name: 'latitude', type: 'decimal', precision: 10, scale: 8, isNullable: true },
          { name: 'longitude', type: 'decimal', precision: 11, scale: 8, isNullable: true },
          { name: 'is_default', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'company_addresses',
      new TableForeignKey({ name: 'fk_company_addresses_company', columnNames: ['company_id'], referencedTableName: 'companies', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    // company_emails
    await queryRunner.createTable(
      new Table({
        name: 'company_emails',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'company_id', type: 'uuid' },
          { name: 'email', type: 'varchar', length: '255' },
          { name: 'type', type: 'enum', enum: ['commercial', 'billing', 'support', 'sales', 'general'], default: "'general'" },
          { name: 'is_default', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'company_emails',
      new TableForeignKey({ name: 'fk_company_emails_company', columnNames: ['company_id'], referencedTableName: 'companies', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    // company_phones
    await queryRunner.createTable(
      new Table({
        name: 'company_phones',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'company_id', type: 'uuid' },
          { name: 'phone', type: 'varchar', length: '20' },
          { name: 'type', type: 'enum', enum: ['landline', 'mobile', 'whatsapp', 'fax'], default: "'landline'" },
          { name: 'is_default', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'company_phones',
      new TableForeignKey({ name: 'fk_company_phones_company', columnNames: ['company_id'], referencedTableName: 'companies', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    // company_business_hours
    await queryRunner.createTable(
      new Table({
        name: 'company_business_hours',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'company_id', type: 'uuid' },
          { name: 'day_of_week', type: 'smallint' },
          { name: 'is_open', type: 'boolean', default: true },
          { name: 'open_time', type: 'time', isNullable: true },
          { name: 'close_time', type: 'time', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'company_business_hours',
      new TableForeignKey({ name: 'fk_company_business_hours_company', columnNames: ['company_id'], referencedTableName: 'companies', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    // company_providers
    await queryRunner.createTable(
      new Table({
        name: 'company_providers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'company_id', type: 'uuid' },
          { name: 'provider_id', type: 'uuid' },
          { name: 'role', type: 'enum', enum: ['employee', 'manager', 'freelancer'], default: "'employee'" },
          { name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'fixed_salary', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'status', type: 'enum', enum: ['active', 'inactive', 'pending'], default: "'pending'" },
          { name: 'assigned_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'company_providers',
      new TableForeignKey({ name: 'fk_company_providers_company', columnNames: ['company_id'], referencedTableName: 'companies', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );
    await queryRunner.createForeignKey(
      'company_providers',
      new TableForeignKey({ name: 'fk_company_providers_provider', columnNames: ['provider_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('company_providers', 'fk_company_providers_provider');
    await queryRunner.dropForeignKey('company_providers', 'fk_company_providers_company');
    await queryRunner.dropTable('company_providers');

    await queryRunner.dropForeignKey('company_business_hours', 'fk_company_business_hours_company');
    await queryRunner.dropTable('company_business_hours');

    await queryRunner.dropForeignKey('company_phones', 'fk_company_phones_company');
    await queryRunner.dropTable('company_phones');

    await queryRunner.dropForeignKey('company_emails', 'fk_company_emails_company');
    await queryRunner.dropTable('company_emails');

    await queryRunner.dropForeignKey('company_addresses', 'fk_company_addresses_company');
    await queryRunner.dropTable('company_addresses');
  }
}
