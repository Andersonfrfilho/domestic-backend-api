import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { type DeviceTokenRepositoryInterface } from '@modules/device-token/device-token.repository.interface';
import { DEVICE_TOKEN_REPOSITORY_PROVIDE } from '@modules/device-token/device-token.token';
import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

import { ServiceRequestErrorFactory } from './factories/service-request.error.factory';
import {
  BusySlot,
  CreateServiceRequestParams,
  FindBusySlotsParams,
  FindConflictingRequestParams,
  ServiceRequestNotificationData,
  ServiceRequestRepositoryInterface,
} from './service-request.repository.interface';

@Injectable()
export class ServiceRequestRepository implements ServiceRequestRepositoryInterface {
  constructor(
    @InjectRepository(ServiceRequest, CONNECTIONS_NAMES.POSTGRES)
    private readonly repo: Repository<ServiceRequest>,
    @Inject(DEVICE_TOKEN_REPOSITORY_PROVIDE)
    private readonly deviceTokenRepository: DeviceTokenRepositoryInterface,
  ) {}

  async create(params: CreateServiceRequestParams): Promise<ServiceRequest> {
    const serviceRequest = this.repo.create({ ...params, status: 'PENDING' });
    return this.repo.save(serviceRequest);
  }

  async findById(id: string): Promise<ServiceRequest | null> {
    return this.repo.findOne({ where: { id } });
  }

  async listByContractor(contractorId: string): Promise<any[]> {
    const requests = await this.repo.find({
      where: { contractorId },
      order: { createdAt: 'DESC' },
      relations: ['service', 'provider', 'paymentMethodType', 'address', 'contractor'],
    });

    if (requests.length > 0) {
      const providerIds = [...new Set(requests.map((r) => r.providerId))];
      const serviceIds = [...new Set(requests.map((r) => r.serviceId))];
      const psRows = await this.repo.manager
        .createQueryBuilder()
        .select(['provider_id', 'service_id', 'price_type', 'price_base'])
        .from('provider_services', 'ps')
        .where('provider_id IN (:...providerIds)', { providerIds })
        .andWhere('service_id IN (:...serviceIds)', { serviceIds })
        .getRawMany();

      const psMap = new Map<string, { priceType: string; priceBase: number }>();
      for (const row of psRows) {
        psMap.set(`${row.provider_id}:${row.service_id}`, {
          priceType: row.price_type,
          priceBase: Number(row.price_base),
        });
      }

      for (const req of requests) {
        const ps = psMap.get(`${req.providerId}:${req.serviceId}`);
        (req as any).ps_price_type = ps?.priceType ?? null;
        (req as any).ps_price_base = ps?.priceBase ?? null;
      }
    }

    return requests;
  }

  async listByProvider(providerId: string): Promise<any[]> {
    const requests = await this.repo.find({
      where: { providerId },
      order: { createdAt: 'DESC' },
      relations: ['service', 'provider', 'paymentMethodType', 'address', 'contractor'],
    });

    if (requests.length > 0) {
      const serviceIds = [...new Set(requests.map((r) => r.serviceId))];
      const psRows = await this.repo.manager
        .createQueryBuilder()
        .select(['provider_id', 'service_id', 'price_type', 'price_base'])
        .from('provider_services', 'ps')
        .where('provider_id = :providerId', { providerId })
        .andWhere('service_id IN (:...serviceIds)', { serviceIds })
        .getRawMany();

      const psMap = new Map<string, { priceType: string; priceBase: number }>();
      for (const row of psRows) {
        psMap.set(`${row.provider_id}:${row.service_id}`, {
          priceType: row.price_type,
          priceBase: Number(row.price_base),
        });
      }

      for (const req of requests) {
        const ps = psMap.get(`${req.providerId}:${req.serviceId}`);
        (req as any).ps_price_type = ps?.priceType ?? null;
        (req as any).ps_price_base = ps?.priceBase ?? null;
      }
    }

    return requests;
  }

  async findForNotification(id: string): Promise<ServiceRequestNotificationData | null> {
    const rows = await this.repo.manager.query(
      `SELECT
        sr.id,
        sr.contractor_id,
        sr.provider_id,
        sr.scheduled_at,
        u_contractor.id          AS contractor_user_id,
        u_contractor.full_name   AS contractor_name,
        e_contractor.email       AS contractor_email,
        pp.user_id               AS provider_user_id,
        COALESCE(pp.business_name, u_provider.full_name) AS provider_name,
        e_provider.email         AS provider_email,
        s.name                   AS service_name
       FROM service_requests sr
       LEFT JOIN users u_contractor
              ON u_contractor.id = sr.contractor_id
       LEFT JOIN user_emails ue_contractor
              ON ue_contractor.user_id = sr.contractor_id
             AND ue_contractor.is_primary = true
             AND ue_contractor.deleted_at IS NULL
       LEFT JOIN emails e_contractor
              ON e_contractor.id = ue_contractor.email_id
       LEFT JOIN provider_profiles pp
              ON pp.id = sr.provider_id
       LEFT JOIN users u_provider
              ON u_provider.id = pp.user_id
       LEFT JOIN provider_emails pe
              ON pe.provider_id = sr.provider_id
             AND pe.is_primary = true
             AND pe.deleted_at IS NULL
       LEFT JOIN emails e_provider
              ON e_provider.id = pe.email_id
       LEFT JOIN services s
              ON s.id = sr.service_id
       WHERE sr.id = $1`,
      [id],
    );

    if (!rows.length) return null;
    const row = rows[0] as {
      id: string;
      contractor_id: string;
      provider_id: string;
      contractor_user_id: string;
      contractor_name: string | null;
      contractor_email: string | null;
      provider_user_id: string;
      provider_name: string | null;
      provider_email: string | null;
      service_name: string | null;
      scheduled_at: string | null;
    };

    const userIds = [row.contractor_id, row.provider_user_id].filter((v): v is string =>
      Boolean(v),
    );
    const fcmMap = await this.deviceTokenRepository.findTokensByUserIds(userIds);

    return {
      id: row.id,
      contractorId: row.contractor_id,
      providerId: row.provider_id,
      contractorUserId: row.contractor_user_id,
      contractorName: row.contractor_name ?? '',
      contractorEmail: row.contractor_email ?? '',
      contractorFcmToken: fcmMap.get(row.contractor_id) ?? null,
      providerUserId: row.provider_user_id,
      providerName: row.provider_name ?? '',
      providerEmail: row.provider_email ?? '',
      providerFcmToken: fcmMap.get(row.provider_user_id) ?? null,
      serviceName: row.service_name ?? '',
      scheduledAt: row.scheduled_at ? new Date(row.scheduled_at).toISOString() : null,
    };
  }

  async findConflictingRequest(params: FindConflictingRequestParams): Promise<ServiceRequest | null> {
    const { providerId, scheduledAt, estimatedHours } = params;
    const durationMs = (estimatedHours ?? 1) * 60 * 60 * 1000;
    const newEnd = new Date(scheduledAt.getTime() + durationMs);

    const rows = await this.repo.manager.query<{ id: string }[]>(
      `SELECT sr.id FROM service_requests sr
       WHERE sr.provider_id = $1
         AND sr.status = 'ACCEPTED'
         AND sr.scheduled_at IS NOT NULL
         AND sr.scheduled_at < $3
         AND sr.scheduled_at + COALESCE(sr.estimated_hours, 1) * interval '1 hour' > $2
       LIMIT 1`,
      [providerId, scheduledAt, newEnd],
    );

    if (!rows.length) return null;
    return this.repo.findOne({ where: { id: rows[0].id } });
  }

  async findBusySlotsForDate(params: FindBusySlotsParams): Promise<BusySlot[]> {
    const { providerId, date } = params;
    const rows = await this.repo.manager.query<{ scheduled_at: Date; estimated_hours: string }[]>(
      `SELECT scheduled_at, COALESCE(estimated_hours, 1) AS estimated_hours
       FROM service_requests
       WHERE provider_id = $1
         AND status = 'ACCEPTED'
         AND scheduled_at IS NOT NULL
         AND DATE(scheduled_at AT TIME ZONE 'UTC') = $2::date`,
      [providerId, date],
    );
    return rows.map((row) => ({
      scheduledAt: new Date(row.scheduled_at),
      estimatedHours: Number(row.estimated_hours),
    }));
  }

  async updateStatus(id: string, status: string): Promise<ServiceRequest> {
    await this.repo.update(id, { status });
    const updated = await this.findById(id);
    if (!updated) throw ServiceRequestErrorFactory.notFound(id);
    return updated;
  }
}
