import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentMethodTypes1778800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE payment_method_types (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name         VARCHAR NOT NULL UNIQUE,
        label        VARCHAR NOT NULL,
        icon         VARCHAR,
        is_enabled   BOOLEAN NOT NULL DEFAULT true,
        created_at   TIMESTAMP NOT NULL DEFAULT now(),
        updated_at   TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE provider_payment_methods (
        id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id             UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
        payment_method_type_id  UUID NOT NULL REFERENCES payment_method_types(id) ON DELETE CASCADE,
        is_enabled              BOOLEAN NOT NULL DEFAULT true,
        created_at              TIMESTAMP NOT NULL DEFAULT now(),
        updated_at              TIMESTAMP,
        UNIQUE (provider_id, payment_method_type_id)
      )
    `);

    await queryRunner.query(`
      INSERT INTO payment_method_types (name, label, icon) VALUES
        ('PIX',               'Pix',                    'qr-code'),
        ('CREDIT_CARD',       'Cartão de Crédito',      'card'),
        ('DEBIT_CARD',        'Cartão de Débito',       'card-outline'),
        ('CASH',              'Dinheiro',               'cash'),
        ('BANK_TRANSFER',     'Transferência Bancária', 'swap-horizontal')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS provider_payment_methods');
    await queryRunner.query('DROP TABLE IF EXISTS payment_method_types');
  }
}
