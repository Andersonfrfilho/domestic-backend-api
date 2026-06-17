import { AuthUser, B2CGuard, Roles, RolesGuard } from '@adatechnology/nestjs-auth-keycloak';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { type ProviderRepositoryInterface } from '@modules/provider/provider.repository.interface';
import { PROVIDER_REPOSITORY_PROVIDE } from '@modules/provider/provider.token';
import { ROLES } from '@modules/shared/constants';
import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';
import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';

import { type BusySlot, type ServiceRequestRepositoryInterface } from './service-request.repository.interface';
import { type ServiceRequestServiceInterface } from './service-request.service';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE, SERVICE_REQUEST_SERVICE_PROVIDE } from './service-request.token';
import { CreateServiceRequestRequestDto } from './use-cases/create-service-request/dtos/create-service-request-request.dto';

@ApiTags('Service Requests')
@Controller('/service-requests')
export class ServiceRequestController {
  constructor(
    @Inject(SERVICE_REQUEST_SERVICE_PROVIDE)
    private readonly serviceRequestService: ServiceRequestServiceInterface,
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
    @Inject(PROVIDER_REPOSITORY_PROVIDE)
    private readonly providerRepository: ProviderRepositoryInterface,
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
  ) {}

  @Post()
  @Roles(ROLES.REQUEST.MANAGER)
  @UseGuards(B2CGuard, RolesGuard)
  @ApiOperation({ summary: 'Criar solicitação de serviço (CUSTOMER)' })
  @ApiHeader({ name: 'X-Access-Token', required: true, description: 'User JWT forwarded by Kong' })
  @ApiOkResponse({ type: ServiceRequest })
  @ApiBadRequestResponse({ description: 'Prestador não aprovado ou dados inválidos' })
  async create(
    @AuthUser() keycloakId: string,
    @Body() body: CreateServiceRequestRequestDto,
  ): Promise<ServiceRequest> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.serviceRequestService.create({ ...body, contractorId: user.id });
  }

  @Get()
  @Roles(ROLES.REQUEST.MANAGER)
  @UseGuards(B2CGuard, RolesGuard)
  @ApiOperation({ summary: 'Listar solicitações do usuário autenticado' })
  @ApiHeader({ name: 'X-Access-Token', required: true, description: 'User JWT forwarded by Kong' })
  @ApiHeader({ name: 'X-User-Type', required: false, description: 'CUSTOMER | PROVIDER' })
  @ApiOkResponse({ type: [ServiceRequest] })
  async list(
    @AuthUser() keycloakId: string,
    @Headers('x-user-type') userType: string,
  ): Promise<ServiceRequest[]> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);

    if (userType === 'PROVIDER') {
      const provider = await this.providerRepository.findByUserId(user.id);
      if (!provider) return [];
      return this.serviceRequestService.listByProvider(provider.id);
    }

    return this.serviceRequestService.listByContractor(user.id);
  }

  @Get('busy-slots')
  @ApiOperation({ summary: 'Horários ocupados do prestador em uma data' })
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'object', properties: { scheduledAt: { type: 'string' }, estimatedHours: { type: 'number' } } } } })
  async getBusySlots(
    @Query('providerId') providerId: string,
    @Query('date') date: string,
  ): Promise<BusySlot[]> {
    return this.serviceRequestRepository.findBusySlotsForDate({ providerId, date });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe da solicitação' })
  @ApiOkResponse({ type: ServiceRequest })
  @ApiNotFoundResponse()
  async findById(@Param('id') id: string): Promise<ServiceRequest> {
    return this.serviceRequestService.findById(id);
  }

  @Put(':id/accept')
  @Roles(ROLES.REQUEST.MANAGER)
  @UseGuards(B2CGuard, RolesGuard)
  @ApiOperation({ summary: 'Prestador aceita solicitação (PENDING → ACCEPTED)' })
  @ApiHeader({ name: 'X-Access-Token', required: true, description: 'User JWT forwarded by Kong' })
  @ApiOkResponse({ type: ServiceRequest })
  @ApiBadRequestResponse({ description: 'Status inválido ou não autorizado' })
  @ApiNotFoundResponse()
  async accept(@Param('id') id: string, @AuthUser() keycloakId: string): Promise<ServiceRequest> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    const provider = await this.providerRepository.findByUserId(user.id);
    return this.serviceRequestService.accept(id, provider?.id ?? '');
  }

  @Put(':id/reject')
  @Roles(ROLES.REQUEST.MANAGER)
  @UseGuards(B2CGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Prestador rejeita solicitação (PENDING → REJECTED)' })
  @ApiHeader({ name: 'X-Access-Token', required: true, description: 'User JWT forwarded by Kong' })
  @ApiOkResponse({ type: ServiceRequest })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async reject(@Param('id') id: string, @AuthUser() keycloakId: string): Promise<ServiceRequest> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    const provider = await this.providerRepository.findByUserId(user.id);
    return this.serviceRequestService.reject(id, provider?.id ?? '');
  }

  @Put(':id/complete')
  @Roles(ROLES.REQUEST.MANAGER)
  @UseGuards(B2CGuard, RolesGuard)
  @ApiOperation({ summary: 'Contratante confirma conclusão (ACCEPTED → COMPLETED)' })
  @ApiHeader({ name: 'X-Access-Token', required: true, description: 'User JWT forwarded by Kong' })
  @ApiOkResponse({ type: ServiceRequest })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async complete(@Param('id') id: string, @AuthUser() keycloakId: string): Promise<ServiceRequest> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.serviceRequestService.complete(id, user.id);
  }

  @Put(':id/cancel')
  @Roles(ROLES.REQUEST.MANAGER)
  @UseGuards(B2CGuard, RolesGuard)
  @ApiOperation({ summary: 'Contratante cancela solicitação (PENDING|ACCEPTED → CANCELLED)' })
  @ApiHeader({ name: 'X-Access-Token', required: true, description: 'User JWT forwarded by Kong' })
  @ApiOkResponse({ type: ServiceRequest })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async cancel(@Param('id') id: string, @AuthUser() keycloakId: string): Promise<ServiceRequest> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.serviceRequestService.cancel(id, user.id);
  }
}
