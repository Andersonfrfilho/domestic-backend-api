import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import type { PaymentMethodDetails } from './payment-method-details.types';
import { PaymentMethodType } from './payment-method-type.entity';
import { ProviderProfile } from './provider-profile.entity';

@Entity('provider_payment_methods')
@Unique(['providerId', 'paymentMethodTypeId'])
export class ProviderPaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'payment_method_type_id' })
  paymentMethodTypeId: string;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  details: PaymentMethodDetails | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @ManyToOne(() => PaymentMethodType)
  @JoinColumn({ name: 'payment_method_type_id' })
  paymentMethodType: PaymentMethodType;
}
