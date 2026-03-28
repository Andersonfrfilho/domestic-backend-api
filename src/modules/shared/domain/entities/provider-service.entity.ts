import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ProviderProfile } from './provider-profile.entity';
import { Service } from './service.entity';

@Entity('provider_services')
export class ProviderService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ name: 'price_base', type: 'decimal', nullable: true })
  priceBase: number;

  @Column({ name: 'price_type', nullable: true })
  priceType: string;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
