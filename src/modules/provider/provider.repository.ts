import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { ProviderService } from '@modules/shared/providers/database/entities/provider-service.entity';
import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderWorkLocation } from '@modules/shared/providers/database/entities/provider-work-location.entity';

import {
  AddProviderServiceParams,
  AddWorkLocationParams,
  CreateProviderParams,
  CreateVerificationParams,
  ProviderRepositoryInterface,
  UpdateProviderParams,
  UpdateVerificationParams,
} from './provider.repository.interface';
import { ProviderErrorFactory } from './factories/provider.error.factory';

export interface ProviderWithDetails {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  averageRating: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  city: string | null;
  state: string | null;
  latitude: string | null;
  longitude: string | null;
  services: {
    id: string;
    name: string;
    priceBase: number;
    priceType: string;
  }[];
  reviewCount: number;
}

@Injectable()
export class ProviderRepository implements ProviderRepositoryInterface {
  constructor(
    @InjectRepository(ProviderProfile, CONNECTIONS_NAMES.POSTGRES)
    private readonly profileRepo: Repository<ProviderProfile>,
    @InjectRepository(ProviderService, CONNECTIONS_NAMES.POSTGRES)
    private readonly serviceRepo: Repository<ProviderService>,
    @InjectRepository(ProviderVerification, CONNECTIONS_NAMES.POSTGRES)
    private readonly verificationRepo: Repository<ProviderVerification>,
    @InjectRepository(ProviderWorkLocation, CONNECTIONS_NAMES.POSTGRES)
    private readonly workLocationRepo: Repository<ProviderWorkLocation>,
  ) {}

  async create(params: CreateProviderParams): Promise<ProviderProfile> {
    const profile = this.profileRepo.create(params);
    return this.profileRepo.save(profile);
  }

  async findById(id: string): Promise<ProviderProfile | null> {
    return this.profileRepo.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<ProviderProfile | null> {
    return this.profileRepo.findOne({ where: { userId } });
  }

  async listApproved(): Promise<ProviderProfile[]> {
    return this.profileRepo
      .createQueryBuilder('p')
      .innerJoin(
        (qb) =>
          qb
            .select('v.provider_id', 'provider_id')
            .addSelect('MAX(v.submitted_at)', 'last_submitted')
            .from('provider_verifications', 'v')
            .groupBy('v.provider_id'),
        'latest',
        'latest.provider_id = p.id',
      )
      .innerJoin(
        'provider_verifications',
        'v',
        'v.provider_id = p.id AND v.submitted_at = latest.last_submitted',
      )
      .where('v.status = :status', { status: 'APPROVED' })
      .getMany();
  }

  async listApprovedWithDetails(sort?: string, limit?: number, available?: boolean): Promise<ProviderWithDetails[]> {
    let query = this.profileRepo
      .createQueryBuilder('p')
      .leftJoin(
        (qb) =>
          qb
            .select('v.provider_id', 'provider_id')
            .addSelect('MAX(v.submitted_at)', 'last_submitted')
            .from('provider_verifications', 'v')
            .groupBy('v.provider_id'),
        'latest',
        'latest.provider_id = p.id',
      )
      .leftJoin(
        'provider_verifications',
        'v',
        'v.provider_id = p.id AND v.submitted_at = latest.last_submitted',
      )
      .leftJoin('provider_addresses', 'pa', 'pa.provider_id = p.id')
      .leftJoin('addresses', 'a', 'a.id = pa.address_id')
      .leftJoin('provider_services', 'ps', 'ps.provider_id = p.id')
      .leftJoin('services', 's', 's.id = ps.service_id')
      .where('v.status = :status', { status: 'APPROVED' });

    if (available) {
      query = query.andWhere('p.is_available = :available', { available: true });
    }

    if (sort === 'rating') {
      query = query.orderBy('p.average_rating', 'DESC');
    } else {
      query = query.orderBy('p.created_at', 'DESC');
    }

    if (limit) {
      query = query.limit(limit);
    }

    const rawResults = await query.getRawMany();

    const providerMap = new Map<string, ProviderWithDetails>();

    for (const row of rawResults) {
      const id = row.p_id;
      if (!providerMap.has(id)) {
        providerMap.set(id, {
          id,
          userId: row.p_user_id,
          businessName: row.p_business_name,
          description: row.p_description,
          averageRating: row.p_average_rating,
          isAvailable: row.p_is_available,
          createdAt: row.p_created_at,
          updatedAt: row.p_updated_at,
          deletedAt: row.p_deleted_at,
          city: row.a_city ?? row.city ?? null,
          state: row.a_state ?? row.state ?? null,
          latitude: row.a_latitude ?? row.latitude ?? null,
          longitude: row.a_longitude ?? row.longitude ?? null,
          services: [],
          reviewCount: 0,
        });
      }

      if (row.s_id) {
        const provider = providerMap.get(id)!;
        const alreadyExists = provider.services.some((svc) => svc.id === row.s_id);
        if (!alreadyExists) {
          provider.services.push({
            id: row.s_id,
            name: row.s_name,
            priceBase: Number(row.ps_price_base ?? 0),
            priceType: row.ps_price_type ?? 'FIXED',
          });
        }
      }
    }

    const providers = Array.from(providerMap.values());

    const reviewCounts = await this.profileRepo
      .createQueryBuilder('p')
      .select('p.id', 'id')
      .addSelect('COUNT(r.id)', 'count')
      .leftJoin('reviews', 'r', 'r.provider_id = p.id')
      .where('p.id IN (:...ids)', { ids: providers.map((p) => p.id) })
      .groupBy('p.id')
      .getRawMany();

    const countMap = new Map<string, number>();
    for (const rc of reviewCounts) {
      countMap.set(rc.id, Number(rc.count));
    }

    for (const provider of providers) {
      provider.reviewCount = countMap.get(provider.id) ?? 0;
    }

    return providers;
  }

  async update(id: string, params: UpdateProviderParams): Promise<ProviderProfile> {
    await this.profileRepo.update(id, params);
    const updated = await this.findById(id);
    if (!updated) throw ProviderErrorFactory.notFound(id);
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    await this.profileRepo.softDelete(id);
  }

  async addService(params: AddProviderServiceParams): Promise<ProviderService> {
    const providerService = this.serviceRepo.create(params);
    return this.serviceRepo.save(providerService);
  }

  async removeService(providerId: string, serviceId: string): Promise<void> {
    await this.serviceRepo.delete({ providerId, serviceId });
  }

  async listServices(providerId: string): Promise<ProviderService[]> {
    return this.serviceRepo.find({ where: { providerId } });
  }

  async findProviderService(providerId: string, serviceId: string): Promise<ProviderService | null> {
    return this.serviceRepo.findOne({ where: { providerId, serviceId } });
  }

  async addWorkLocation(params: AddWorkLocationParams): Promise<ProviderWorkLocation> {
    const location = this.workLocationRepo.create(params);
    return this.workLocationRepo.save(location);
  }

  async removeWorkLocation(providerId: string, locationId: string): Promise<void> {
    await this.workLocationRepo.delete({ id: locationId, providerId });
  }

  async listWorkLocations(providerId: string): Promise<ProviderWorkLocation[]> {
    return this.workLocationRepo.find({ where: { providerId, isActive: true } });
  }

  async findWorkLocation(providerId: string, locationId: string): Promise<ProviderWorkLocation | null> {
    return this.workLocationRepo.findOne({ where: { id: locationId, providerId } });
  }

  async getLatestVerification(providerId: string): Promise<ProviderVerification | null> {
    return this.verificationRepo.findOne({
      where: { providerId },
      order: { submittedAt: 'DESC' },
    });
  }

  async createVerification(params: CreateVerificationParams): Promise<ProviderVerification> {
    const verification = this.verificationRepo.create(params);
    return this.verificationRepo.save(verification);
  }

  async updateVerification(id: string, params: UpdateVerificationParams): Promise<ProviderVerification> {
    await this.verificationRepo.update(id, params);
    return this.verificationRepo.findOne({ where: { id } }) as Promise<ProviderVerification>;
  }

  async listUnderReview(): Promise<ProviderProfile[]> {
    return this.profileRepo
      .createQueryBuilder('p')
      .innerJoin(
        (qb) =>
          qb
            .select('v.provider_id', 'provider_id')
            .addSelect('MAX(v.submitted_at)', 'last_submitted')
            .from('provider_verifications', 'v')
            .groupBy('v.provider_id'),
        'latest',
        'latest.provider_id = p.id',
      )
      .innerJoin(
        'provider_verifications',
        'v',
        'v.provider_id = p.id AND v.submitted_at = latest.last_submitted',
      )
      .where('v.status = :status', { status: 'UNDER_REVIEW' })
      .getMany();
  }
}
