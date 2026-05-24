import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { ProviderService as ProviderServiceEntity } from '@modules/shared/providers/database/entities/provider-service.entity';
import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderWorkLocation } from '@modules/shared/providers/database/entities/provider-work-location.entity';

import { type ProviderWithDetails } from './provider.repository';
import { type ProviderRepositoryInterface } from './provider.repository.interface';
import {
  PROVIDER_ADD_SERVICE_USE_CASE_PROVIDE,
  PROVIDER_ADD_WORK_LOCATION_USE_CASE_PROVIDE,
  PROVIDER_APPROVE_USE_CASE_PROVIDE,
  PROVIDER_CREATE_USE_CASE_PROVIDE,
  PROVIDER_GET_BY_ID_USE_CASE_PROVIDE,
  PROVIDER_GET_VERIFICATION_USE_CASE_PROVIDE,
  PROVIDER_LIST_PENDING_USE_CASE_PROVIDE,
  PROVIDER_LIST_USE_CASE_PROVIDE,
  PROVIDER_REJECT_USE_CASE_PROVIDE,
  PROVIDER_REMOVE_SERVICE_USE_CASE_PROVIDE,
  PROVIDER_REMOVE_WORK_LOCATION_USE_CASE_PROVIDE,
  PROVIDER_SUBMIT_VERIFICATION_USE_CASE_PROVIDE,
  PROVIDER_UPDATE_USE_CASE_PROVIDE,
  PROVIDER_REPOSITORY_PROVIDE,
} from './provider.token';
import {
  type AddProviderServiceUseCaseInterface,
  AddProviderServiceUseCaseParams,
} from './use-cases/add-provider-service/add-provider-service.interface';
import {
  type AddWorkLocationUseCaseInterface,
  AddWorkLocationUseCaseParams,
} from './use-cases/add-work-location/add-work-location.interface';
import {
  type ApproveProviderUseCaseInterface,
  ApproveProviderUseCaseParams,
} from './use-cases/approve-provider/approve-provider.interface';
import {
  type CreateProviderUseCaseInterface,
  CreateProviderUseCaseParams,
} from './use-cases/create-provider/create-provider.interface';
import { type GetProviderByIdUseCaseInterface } from './use-cases/get-provider-by-id/get-provider-by-id.interface';
import { type GetProviderVerificationUseCaseInterface } from './use-cases/get-provider-verification/get-provider-verification.interface';
import { type ListPendingProvidersUseCaseInterface } from './use-cases/list-pending-providers/list-pending-providers.interface';
import { type ListProvidersUseCaseInterface } from './use-cases/list-providers/list-providers.interface';
import {
  type RejectProviderUseCaseInterface,
  RejectProviderUseCaseParams,
} from './use-cases/reject-provider/reject-provider.interface';
import { type RemoveProviderServiceUseCaseInterface } from './use-cases/remove-provider-service/remove-provider-service.interface';
import { type RemoveWorkLocationUseCaseInterface } from './use-cases/remove-work-location/remove-work-location.interface';
import { type SubmitVerificationUseCaseInterface } from './use-cases/submit-verification/submit-verification.interface';
import {
  type UpdateProviderUseCaseInterface,
  UpdateProviderUseCaseParams,
} from './use-cases/update-provider/update-provider.interface';

export interface ProviderServiceInterface {
  @TraceMethod()
  create(params: CreateProviderUseCaseParams): Promise<ProviderProfile>;
  @TraceMethod()
  findById(id: string): Promise<ProviderProfile>;
  @TraceMethod()
  findByUserId(userId: string): Promise<ProviderProfile | null>;
  @TraceMethod()
  list(): Promise<ProviderProfile[]>;
  @TraceMethod()
  listWithDetails(
    sort?: string,
    limit?: number,
    available?: boolean,
  ): Promise<ProviderWithDetails[]>;
  @TraceMethod()
  update(params: UpdateProviderUseCaseParams): Promise<ProviderProfile>;
  @TraceMethod()
  addService(params: AddProviderServiceUseCaseParams): Promise<ProviderServiceEntity>;
  @TraceMethod()
  removeService(providerId: string, serviceId: string): Promise<void>;
  @TraceMethod()
  listServices(providerId: string): Promise<ProviderServiceEntity[]>;
  @TraceMethod()
  addWorkLocation(params: AddWorkLocationUseCaseParams): Promise<ProviderWorkLocation>;
  @TraceMethod()
  removeWorkLocation(providerId: string, locationId: string): Promise<void>;
  @TraceMethod()
  listWorkLocations(providerId: string): Promise<ProviderWorkLocation[]>;
  @TraceMethod()
  submitVerification(providerId: string): Promise<ProviderVerification>;
  @TraceMethod()
  getVerification(providerId: string): Promise<ProviderVerification>;
  @TraceMethod()
  approve(params: ApproveProviderUseCaseParams): Promise<ProviderVerification>;
  @TraceMethod()
  reject(params: RejectProviderUseCaseParams): Promise<ProviderVerification>;
  @TraceMethod()
  listPending(): Promise<ProviderProfile[]>;
}

@Injectable()
export class ProviderService implements ProviderServiceInterface {
  @TraceMethod()
  constructor(
    @Inject(PROVIDER_CREATE_USE_CASE_PROVIDE)
    private readonly createUseCase: CreateProviderUseCaseInterface,
    @Inject(PROVIDER_GET_BY_ID_USE_CASE_PROVIDE)
    private readonly getByIdUseCase: GetProviderByIdUseCaseInterface,
    @Inject(PROVIDER_LIST_USE_CASE_PROVIDE)
    private readonly listUseCase: ListProvidersUseCaseInterface,
    @Inject(PROVIDER_UPDATE_USE_CASE_PROVIDE)
    private readonly updateUseCase: UpdateProviderUseCaseInterface,
    @Inject(PROVIDER_ADD_SERVICE_USE_CASE_PROVIDE)
    private readonly addServiceUseCase: AddProviderServiceUseCaseInterface,
    @Inject(PROVIDER_REMOVE_SERVICE_USE_CASE_PROVIDE)
    private readonly removeServiceUseCase: RemoveProviderServiceUseCaseInterface,
    @Inject(PROVIDER_ADD_WORK_LOCATION_USE_CASE_PROVIDE)
    private readonly addWorkLocationUseCase: AddWorkLocationUseCaseInterface,
    @Inject(PROVIDER_REMOVE_WORK_LOCATION_USE_CASE_PROVIDE)
    private readonly removeWorkLocationUseCase: RemoveWorkLocationUseCaseInterface,
    @Inject(PROVIDER_SUBMIT_VERIFICATION_USE_CASE_PROVIDE)
    private readonly submitVerificationUseCase: SubmitVerificationUseCaseInterface,
    @Inject(PROVIDER_GET_VERIFICATION_USE_CASE_PROVIDE)
    private readonly getVerificationUseCase: GetProviderVerificationUseCaseInterface,
    @Inject(PROVIDER_APPROVE_USE_CASE_PROVIDE)
    private readonly approveUseCase: ApproveProviderUseCaseInterface,
    @Inject(PROVIDER_REJECT_USE_CASE_PROVIDE)
    private readonly rejectUseCase: RejectProviderUseCaseInterface,
    @Inject(PROVIDER_LIST_PENDING_USE_CASE_PROVIDE)
    private readonly listPendingUseCase: ListPendingProvidersUseCaseInterface,
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
  ) {}

  @TraceMethod()
  create(params: CreateProviderUseCaseParams): Promise<ProviderProfile> {
    return this.createUseCase.execute(params);
  }

  @TraceMethod()
  findById(id: string): Promise<ProviderProfile> {
    return this.getByIdUseCase.execute({ id });
  }

  @TraceMethod()
  findByUserId(userId: string): Promise<ProviderProfile | null> {
    return this.providerRepository.findByUserId(userId);
  }

  @TraceMethod()
  list(): Promise<ProviderProfile[]> {
    return this.listUseCase.execute();
  }

  @TraceMethod()
  listWithDetails(
    sort?: string,
    limit?: number,
    available?: boolean,
  ): Promise<ProviderWithDetails[]> {
    return this.providerRepository.listApprovedWithDetails(sort, limit, available);
  }

  @TraceMethod()
  update(params: UpdateProviderUseCaseParams): Promise<ProviderProfile> {
    return this.updateUseCase.execute(params);
  }

  @TraceMethod()
  addService(params: AddProviderServiceUseCaseParams): Promise<ProviderServiceEntity> {
    return this.addServiceUseCase.execute(params);
  }

  @TraceMethod()
  removeService(providerId: string, serviceId: string): Promise<void> {
    return this.removeServiceUseCase.execute({ providerId, serviceId });
  }

  @TraceMethod()
  listServices(providerId: string): Promise<ProviderServiceEntity[]> {
    return this.providerRepository.listServices(providerId);
  }

  @TraceMethod()
  addWorkLocation(params: AddWorkLocationUseCaseParams): Promise<ProviderWorkLocation> {
    return this.addWorkLocationUseCase.execute(params);
  }

  @TraceMethod()
  removeWorkLocation(providerId: string, locationId: string): Promise<void> {
    return this.removeWorkLocationUseCase.execute({ providerId, locationId });
  }

  @TraceMethod()
  listWorkLocations(providerId: string): Promise<ProviderWorkLocation[]> {
    return this.providerRepository.listWorkLocations(providerId);
  }

  @TraceMethod()
  submitVerification(providerId: string): Promise<ProviderVerification> {
    return this.submitVerificationUseCase.execute({ providerId });
  }

  @TraceMethod()
  getVerification(providerId: string): Promise<ProviderVerification> {
    return this.getVerificationUseCase.execute({ providerId });
  }

  @TraceMethod()
  approve(params: ApproveProviderUseCaseParams): Promise<ProviderVerification> {
    return this.approveUseCase.execute(params);
  }

  @TraceMethod()
  reject(params: RejectProviderUseCaseParams): Promise<ProviderVerification> {
    return this.rejectUseCase.execute(params);
  }

  @TraceMethod()
  listPending(): Promise<ProviderProfile[]> {
    return this.listPendingUseCase.execute();
  }
}
