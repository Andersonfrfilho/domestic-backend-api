import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { PaymentMethodType } from '@modules/shared/providers/database/entities/payment-method-type.entity';
import { ProviderPaymentMethod } from '@modules/shared/providers/database/entities/provider-payment-method.entity';
import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { ProviderService } from '@modules/shared/providers/database/entities/provider-service.entity';
import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderWorkLocation } from '@modules/shared/providers/database/entities/provider-work-location.entity';

import { ProviderErrorFactory } from './factories/provider.error.factory';
import {
  AddProviderServiceParams,
  AddWorkLocationParams,
  CreateProviderParams,
  CreateVerificationParams,
  ProviderRepositoryInterface,
  UpdateProviderParams,
  UpdateVerificationParams,
} from './provider.repository.interface';

export interface ProviderWithDetails {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  averageRating: string;
  isAvailable: boolean;
  avatarUrl: string | null;
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
  activeDays: number[];
  paymentMethods: { id: string; name: string; label: string; icon: string | null }[];
}

export interface ProviderAvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ProviderFullDetails {
  id: string;
  userId: string;
  businessName: string;
  description: string | null;
  averageRating: number;
  isAvailable: boolean;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  verificationStatus: string;
  services: {
    id: string;
    name: string;
    category: { id: string; name: string };
    priceBase: number;
    priceType: string;
  }[];
  workLocations: {
    city: string;
    state: string;
    isPrimary: boolean;
  }[];
  paymentMethods: {
    id: string;
    name: string;
    label: string;
    icon: string | null;
    isEnabled: boolean;
  }[];
  reviewCount: number;
  availability: ProviderAvailabilitySlot[];
}

export interface SetProviderPaymentMethodsParams {
  paymentMethodTypeId: string;
  isEnabled: boolean;
}

export interface ListApprovedWithDetailsParams {
  sort?: string;
  limit?: number;
  available?: boolean;
  city?: string;
  state?: string;
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  paymentMethodId?: string;
  dayOfWeek?: number;
  excludeKeycloakId?: string;
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
    @InjectRepository(PaymentMethodType, CONNECTIONS_NAMES.POSTGRES)
    private readonly paymentMethodTypeRepo: Repository<PaymentMethodType>,
    @InjectRepository(ProviderPaymentMethod, CONNECTIONS_NAMES.POSTGRES)
    private readonly providerPaymentMethodRepo: Repository<ProviderPaymentMethod>,
  ) {}

  async create(params: CreateProviderParams): Promise<ProviderProfile> {
    const profile = this.profileRepo.create(params);
    return this.profileRepo.save(profile);
  }

  async findById(id: string): Promise<ProviderProfile | null> {
    return this.profileRepo.findOne({ where: { id } });
  }

  async findByIdWithDetails(id: string): Promise<ProviderFullDetails | null> {
    const rows = await this.profileRepo
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
      .leftJoin('provider_work_locations', 'pwl', 'pwl.provider_id = p.id AND pwl.is_active = true')
      .leftJoin('addresses', 'a', 'a.id = pwl.address_id')
      .leftJoin('provider_services', 'ps', 'ps.provider_id = p.id')
      .leftJoin('services', 's', 's.id = ps.service_id')
      .leftJoin('categories', 'cat', 'cat.id = s.category_id')
      .addSelect(['a.city', 'a.state'])
      .addSelect('pwl.isPrimary', 'pwl_is_primary')
      .addSelect(['s.id', 's.name'])
      .addSelect('cat.id', 'cat_id')
      .addSelect('cat.name', 'cat_name')
      .addSelect('ps.price_base', 'ps_price_base')
      .addSelect('ps.price_type', 'ps_price_type')
      .addSelect('v.status', 'verification_status')
      .where('p.id = :id', { id })
      .getRawMany();

    if (!rows.length) return null;

    const first = rows[0];
    const provider: ProviderFullDetails = {
      id: first.p_id,
      userId: first.p_user_id,
      businessName: first.p_business_name,
      description: first.p_description ?? null,
      averageRating: Number(first.p_average_rating ?? 0),
      isAvailable: Boolean(first.p_is_available),
      avatarUrl: first.p_avatar_url ?? null,
      createdAt: first.p_created_at,
      updatedAt: first.p_updated_at ?? null,
      deletedAt: first.p_deleted_at ?? null,
      verificationStatus: first.verification_status ?? 'PENDING',
      services: [],
      workLocations: [],
      paymentMethods: [],
      reviewCount: 0,
      availability: [],
    };

    const seenServices = new Set<string>();
    const seenLocations = new Set<string>();

    for (const row of rows) {
      if (row.s_id && !seenServices.has(row.s_id)) {
        seenServices.add(row.s_id);
        provider.services.push({
          id: row.s_id,
          name: row.s_name,
          category: { id: row.cat_id ?? '', name: row.cat_name ?? '' },
          priceBase: Number(row.ps_price_base ?? 0),
          priceType: row.ps_price_type ?? 'FIXED',
        });
      }
      const locKey = `${row.a_city}:${row.a_state}`;
      if (row.a_city && !seenLocations.has(locKey)) {
        seenLocations.add(locKey);
        provider.workLocations.push({
          city: row.a_city,
          state: row.a_state,
          isPrimary: Boolean(row.pwl_is_primary),
        });
      }
    }

    const reviewResult = await this.profileRepo
      .createQueryBuilder('p')
      .select('COUNT(r.id)', 'count')
      .leftJoin('reviews', 'r', 'r.provider_id = p.id')
      .where('p.id = :id', { id })
      .getRawOne();
    provider.reviewCount = Number(reviewResult?.count ?? 0);

    const paymentRows = await this.providerPaymentMethodRepo
      .createQueryBuilder('ppm')
      .innerJoin('ppm.paymentMethodType', 'pmt')
      .select(['pmt.id', 'pmt.name', 'pmt.label', 'pmt.icon', 'ppm.isEnabled'])
      .where('ppm.providerId = :id', { id })
      .andWhere('pmt.isEnabled = true')
      .getMany();

    provider.paymentMethods = paymentRows.map((row) => ({
      id: row.paymentMethodType.id,
      name: row.paymentMethodType.name,
      label: row.paymentMethodType.label,
      icon: row.paymentMethodType.icon,
      isEnabled: row.isEnabled,
    }));

    const availabilityRows = await this.profileRepo.manager.query<
      { day_of_week: number; start_time: string; end_time: string }[]
    >(
      `SELECT day_of_week, start_time, end_time
       FROM provider_availability
       WHERE provider_id = $1 AND is_active = true
       ORDER BY day_of_week, start_time`,
      [id],
    );

    provider.availability = availabilityRows.map((row) => ({
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
    }));

    return provider;
  }

  async findByUserId(userId: string): Promise<ProviderProfile | null> {
    return this.profileRepo.findOne({ where: { userId } });
  }

  async listApproved(excludeKeycloakId?: string): Promise<ProviderProfile[]> {
    let query = this.profileRepo
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
      .andWhere(
        'EXISTS (SELECT 1 FROM provider_payment_methods ppm WHERE ppm.provider_id = p.id AND ppm.is_enabled = true)',
      );

    if (excludeKeycloakId) {
      query = query.andWhere(
        'p.user_id NOT IN (SELECT u.id FROM "users" u WHERE u.keycloak_id = :excludeKeycloakId)',
        { excludeKeycloakId },
      );
    }

    return query.getMany();
  }

  async listApprovedWithDetails(params: ListApprovedWithDetailsParams = {}): Promise<ProviderWithDetails[]> {
    const { sort, limit, available, city, state, categoryId, priceMin, priceMax, ratingMin, paymentMethodId, dayOfWeek, excludeKeycloakId } = params;
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
      .leftJoin('provider_work_locations', 'pwl', 'pwl.provider_id = p.id AND pwl.is_active = true')
      .leftJoin('addresses', 'a', 'a.id = pwl.address_id')
      .leftJoin('provider_services', 'ps', 'ps.provider_id = p.id')
      .leftJoin('services', 's', 's.id = ps.service_id')
      .addSelect([
        'p.avatar_url',
        'a.city',
        'a.state',
        'a.latitude',
        'a.longitude',
        's.id',
        's.name',
      ])
      .addSelect('ps.price_base', 'ps_price_base')
      .addSelect('ps.price_type', 'ps_price_type')
      .where('v.status = :status', { status: 'APPROVED' })
      .andWhere(
        'EXISTS (SELECT 1 FROM provider_payment_methods ppm WHERE ppm.provider_id = p.id AND ppm.is_enabled = true)',
      );

    if (available) {
      query = query.andWhere('p.is_available = :available', { available: true });
    }

    if (city) {
      query = query.andWhere('LOWER(a.city) = LOWER(:city)', { city });
    }

    if (state) {
      query = query.andWhere('UPPER(a.state) = UPPER(:state)', { state });
    }

    if (categoryId) {
      query = query.andWhere('s.category_id = :categoryId', { categoryId });
    }

    if (priceMin != null) {
      query = query.andWhere('ps.price_base >= :priceMin', { priceMin });
    }

    if (priceMax != null) {
      query = query.andWhere('ps.price_base <= :priceMax', { priceMax });
    }

    if (ratingMin != null) {
      query = query.andWhere('p.average_rating >= :ratingMin', { ratingMin });
    }

    if (paymentMethodId) {
      query = query.andWhere(
        'EXISTS (SELECT 1 FROM provider_payment_methods ppm2 WHERE ppm2.provider_id = p.id AND ppm2.payment_method_type_id = :paymentMethodId AND ppm2.is_enabled = true)',
        { paymentMethodId },
      );
    }

    if (dayOfWeek != null) {
      query = query.andWhere(
        'EXISTS (SELECT 1 FROM provider_availability pa WHERE pa.provider_id = p.id AND pa.day_of_week = :dayOfWeek AND pa.is_active = true)',
        { dayOfWeek },
      );
    }

    if (excludeKeycloakId) {
      query = query.andWhere(
        'p.user_id NOT IN (SELECT u.id FROM "users" u WHERE u.keycloak_id = :excludeKeycloakId)',
        { excludeKeycloakId },
      );
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
          avatarUrl: row.p_avatar_url ?? null,
          createdAt: row.p_created_at,
          updatedAt: row.p_updated_at,
          deletedAt: row.p_deleted_at,
          city: row.a_city ?? row.city ?? null,
          state: row.a_state ?? row.state ?? null,
          latitude: row.a_latitude ?? row.latitude ?? null,
          longitude: row.a_longitude ?? row.longitude ?? null,
          services: [],
          reviewCount: 0,
          activeDays: [],
          paymentMethods: [],
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

    if (providers.length > 0) {
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

      const availabilityRows = await this.profileRepo.manager.query<
        { provider_id: string; days_csv: string | null }[]
      >(
        `SELECT provider_id,
                string_agg(day_of_week::text, ',' ORDER BY day_of_week) AS days_csv
         FROM provider_availability
         WHERE provider_id = ANY($1) AND is_active = true
         GROUP BY provider_id`,
        [providers.map((p) => p.id)],
      );

      const daysMap = new Map<string, number[]>();
      for (const row of availabilityRows) {
        const days = row.days_csv ? row.days_csv.split(',').map(Number) : [];
        daysMap.set(row.provider_id, days);
      }

      for (const provider of providers) {
        provider.activeDays = daysMap.get(provider.id) ?? [];
      }

      const paymentMethodRows = await this.profileRepo.manager.query<{
        provider_id: string;
        type_id: string;
        name: string;
        label: string;
        icon: string | null;
      }[]>(
        `SELECT ppm.provider_id, pmt.id as type_id, pmt.name, pmt.label, pmt.icon
         FROM provider_payment_methods ppm
         INNER JOIN payment_method_types pmt ON pmt.id = ppm.payment_method_type_id
         WHERE ppm.provider_id = ANY($1)
           AND pmt.is_enabled = true
           AND ppm.is_enabled = true`,
        [providers.map((p) => p.id)],
      );

      const paymentMap = new Map<string, ProviderWithDetails['paymentMethods']>();
      for (const row of paymentMethodRows) {
        if (!paymentMap.has(row.provider_id)) paymentMap.set(row.provider_id, []);
        paymentMap.get(row.provider_id)!.push({ id: row.type_id, name: row.name, label: row.label, icon: row.icon });
      }
      for (const provider of providers) {
        provider.paymentMethods = paymentMap.get(provider.id) ?? [];
      }
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

  async findProviderService(
    providerId: string,
    serviceId: string,
  ): Promise<ProviderService | null> {
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

  async findWorkLocation(
    providerId: string,
    locationId: string,
  ): Promise<ProviderWorkLocation | null> {
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

  async updateVerification(
    id: string,
    params: UpdateVerificationParams,
  ): Promise<ProviderVerification> {
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

  async listPaymentMethodTypes(): Promise<PaymentMethodType[]> {
    return this.paymentMethodTypeRepo.find({
      where: { isEnabled: true },
      order: { name: 'ASC' },
    });
  }

  async listProviderPaymentMethods(providerId: string): Promise<ProviderPaymentMethod[]> {
    return this.providerPaymentMethodRepo.find({
      where: { providerId },
      relations: ['paymentMethodType'],
    });
  }

  async setProviderPaymentMethods(
    providerId: string,
    methods: SetProviderPaymentMethodsParams[],
  ): Promise<ProviderPaymentMethod[]> {
    await this.providerPaymentMethodRepo.delete({ providerId });

    if (methods.length === 0) return [];

    const entities = methods.map((method) =>
      this.providerPaymentMethodRepo.create({
        providerId,
        paymentMethodTypeId: method.paymentMethodTypeId,
        isEnabled: method.isEnabled,
      }),
    );

    return this.providerPaymentMethodRepo.save(entities);
  }
}
