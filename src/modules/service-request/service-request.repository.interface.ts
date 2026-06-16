import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';

export interface CreateServiceRequestParams {
  contractorId: string;
  providerId: string;
  serviceId: string;
  addressId: string;
  description?: string;
  scheduledAt?: Date;
  priceFinal?: number;
  paymentMethodTypeId?: string;
}

export interface ServiceRequestNotificationData {
  id: string;
  contractorId: string;
  providerId: string;
  contractorUserId: string;
  contractorName: string;
  contractorEmail: string;
  contractorFcmToken: string | null;
  providerUserId: string;
  providerName: string;
  providerEmail: string;
  providerFcmToken: string | null;
  serviceName: string;
  scheduledAt: string | null;
}

export interface ServiceRequestRepositoryInterface {
  create(params: CreateServiceRequestParams): Promise<ServiceRequest>;
  findById(id: string): Promise<ServiceRequest | null>;
  findForNotification(id: string): Promise<ServiceRequestNotificationData | null>;
  listByContractor(contractorId: string): Promise<ServiceRequest[]>;
  listByProvider(providerId: string): Promise<ServiceRequest[]>;
  updateStatus(id: string, status: string): Promise<ServiceRequest>;
}
