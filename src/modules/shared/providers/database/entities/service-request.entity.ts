import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Address } from './address.entity';
import { ProviderProfile } from './provider-profile.entity';
import { Service } from './service.entity';
import { User } from './user.entity';

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contractor_id' })
  contractorId: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ name: 'address_id' })
  addressId: string;

  @Column()
  status: string;

  @Column({ name: 'contractor_confirmed', default: false })
  contractorConfirmed: boolean;

  @Column({ name: 'provider_confirmed', default: false })
  providerConfirmed: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ name: 'price_final', type: 'decimal', nullable: true })
  priceFinal: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contractor_id' })
  contractor: User;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => Address, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'address_id' })
  address: Address;
}
