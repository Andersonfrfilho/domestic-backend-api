import { AuthUser, B2CGuard, Roles, RolesGuard } from '@adatechnology/nestjs-auth-keycloak';
import {
  Body,
  Controller,
  Delete,
  Get,
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
  ApiBody,
  ApiConflictResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { IsOptional } from "class-validator";

import { ROLES } from '@modules/shared/constants';

class ListProvidersQueryDto {
  @IsOptional() sort?: string;
  @IsOptional() limit?: string;
  @IsOptional() available?: string;
  @IsOptional() city?: string;
  @IsOptional() state?: string;
  @IsOptional() category_id?: string;
  @IsOptional() price_min?: string;
  @IsOptional() price_max?: string;
  @IsOptional() rating_min?: string;
  @IsOptional() payment_method_id?: string;
  @IsOptional() day_of_week?: string;
  @IsOptional() exclude_keycloak_id?: string;
}
import { PaymentMethodType } from '@modules/shared/providers/database/entities/payment-method-type.entity';
import { ProviderPaymentMethod } from '@modules/shared/providers/database/entities/provider-payment-method.entity';
import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { ProviderService as ProviderServiceEntity } from '@modules/shared/providers/database/entities/provider-service.entity';
import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderWorkLocation } from '@modules/shared/providers/database/entities/provider-work-location.entity';
import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';

import { type ProviderFullDetails, type ProviderWithDetails } from './provider.repository';
import { type ProviderServiceInterface } from './provider.service';
import { PROVIDER_SERVICE_PROVIDE } from './provider.token';
import { AddProviderServiceRequestDto } from './use-cases/add-provider-service/dtos/add-provider-service-request.dto';
import { AddWorkLocationRequestDto } from './use-cases/add-work-location/dtos/add-work-location-request.dto';
import { CreateProviderRequestDto } from './use-cases/create-provider/dtos/create-provider-request.dto';
import { RejectProviderRequestDto } from './use-cases/reject-provider/dtos/reject-provider-request.dto';
import { UpdateProviderRequestDto } from './use-cases/update-provider/dtos/update-provider-request.dto';

@ApiTags('Providers')
@Controller('/providers')
export class ProviderController {
  constructor(
    @Inject(PROVIDER_SERVICE_PROVIDE)
    private readonly providerService: ProviderServiceInterface,
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar perfil de prestador' })
  @ApiHeader({ name: 'X-User-Id', required: false })
  @ApiOkResponse({ type: ProviderProfile })
  @ApiConflictResponse({ description: 'Perfil já existe para este usuário' })
  async create(@Body() body: CreateProviderRequestDto): Promise<ProviderProfile> {
    return this.providerService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar prestadores aprovados' })
  @ApiOkResponse({ type: [ProviderProfile] })
  async list(@Query() query: ListProvidersQueryDto): Promise<ProviderProfile[] | ProviderWithDetails[]> {
    const { sort, limit, available, city, state, category_id, price_min, price_max, rating_min, payment_method_id, day_of_week, exclude_keycloak_id } = query;
    if (sort || limit || available || city || state || category_id || price_min || price_max || rating_min || payment_method_id || day_of_week || exclude_keycloak_id) {
      return this.providerService.listWithDetails({
        sort,
        limit: limit ? Number.parseInt(limit, 10) : undefined,
        available: available === 'true',
        city,
        state,
        categoryId: category_id,
        priceMin: price_min != null && price_min !== '' ? Number(price_min) : undefined,
        priceMax: price_max != null && price_max !== '' ? Number(price_max) : undefined,
        ratingMin: rating_min != null && rating_min !== '' ? Number(rating_min) : undefined,
        paymentMethodId: payment_method_id,
        dayOfWeek: day_of_week != null && day_of_week !== '' ? Number(day_of_week) : undefined,
        excludeKeycloakId: exclude_keycloak_id,
      });
    }
    return this.providerService.list();
  }

  @Get('admin/pending')
  @ApiOperation({ summary: 'Listar prestadores aguardando aprovação (Admin)' })
  @ApiOkResponse({ type: [ProviderProfile] })
  async listPending(): Promise<ProviderProfile[]> {
    return this.providerService.listPending();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Buscar prestador pelo ID do usuário' })
  @ApiOkResponse({ type: ProviderProfile })
  @ApiNotFoundResponse({ description: 'Prestador não encontrado' })
  async findByUserId(@Param('userId') userId: string): Promise<ProviderProfile | null> {
    return this.providerService.findByUserId(userId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Buscar perfil do prestador autenticado' })
  @ApiOkResponse({ type: ProviderProfile })
  @ApiNotFoundResponse({ description: 'Prestador não encontrado' })
  async findMe(@AuthUser() keycloakId: string): Promise<ProviderFullDetails | null> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    const provider = await this.providerService.findByUserId(user.id);
    if (!provider) return null;
    return this.providerService.findById(provider.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar prestador por ID' })
  @ApiOkResponse({ type: ProviderProfile })
  @ApiNotFoundResponse({ description: 'Prestador não encontrado' })
  async findById(@Param('id') id: string): Promise<ProviderFullDetails> {
    return this.providerService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar perfil do prestador' })
  @ApiOkResponse({ type: ProviderProfile })
  @ApiNotFoundResponse()
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProviderRequestDto,
  ): Promise<ProviderProfile> {
    return this.providerService.update({ id, ...body });
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'Listar serviços do prestador' })
  @ApiOkResponse({ type: [ProviderServiceEntity] })
  async listServices(@Param('id') id: string): Promise<ProviderServiceEntity[]> {
    return this.providerService.listServices(id);
  }

  @Get(':id/work-locations')
  @ApiOperation({ summary: 'Listar locais de atendimento do prestador' })
  @ApiOkResponse({ type: [ProviderWorkLocation] })
  async listWorkLocations(@Param('id') id: string): Promise<ProviderWorkLocation[]> {
    return this.providerService.listWorkLocations(id);
  }

  @Post(':id/services')
  @ApiOperation({ summary: 'Adicionar serviço ao prestador' })
  @ApiOkResponse({ type: ProviderServiceEntity })
  @ApiConflictResponse({ description: 'Serviço já vinculado' })
  @ApiNotFoundResponse()
  async addService(
    @Param('id') id: string,
    @Body() body: AddProviderServiceRequestDto,
  ): Promise<ProviderServiceEntity> {
    return this.providerService.addService({ providerId: id, ...body });
  }

  @Delete(':id/services/:serviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover serviço do prestador' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async removeService(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
  ): Promise<void> {
    await this.providerService.removeService(id, serviceId);
  }

  @Post(':id/work-locations')
  @ApiOperation({ summary: 'Adicionar local de atendimento' })
  @ApiOkResponse({ type: ProviderWorkLocation })
  @ApiNotFoundResponse()
  async addWorkLocation(
    @Param('id') id: string,
    @Body() body: AddWorkLocationRequestDto,
  ): Promise<ProviderWorkLocation> {
    return this.providerService.addWorkLocation({ providerId: id, ...body });
  }

  @Delete(':id/work-locations/:locationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover local de atendimento' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async removeWorkLocation(
    @Param('id') id: string,
    @Param('locationId') locationId: string,
  ): Promise<void> {
    await this.providerService.removeWorkLocation(id, locationId);
  }

  @Post(':id/verification')
  @ApiOperation({ summary: 'Submeter perfil para verificação (PENDING → UNDER_REVIEW)' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiOkResponse({ type: ProviderVerification })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse({ description: 'Status de verificação inválido' })
  async submitVerification(@Param('id') id: string): Promise<ProviderVerification> {
    return this.providerService.submitVerification(id);
  }

  @Get(':id/verification')
  @ApiOperation({ summary: 'Status da verificação do prestador' })
  @ApiOkResponse({ type: ProviderVerification })
  @ApiNotFoundResponse()
  async getVerification(@Param('id') id: string): Promise<ProviderVerification> {
    return this.providerService.getVerification(id);
  }

  @Put(':id/verification/approve')
  @Roles(ROLES.SERVICE.MANAGER)
  @UseGuards(B2CGuard, RolesGuard)
  @ApiOperation({ summary: 'Aprovar prestador (Admin)' })
  @ApiHeader({
    name: 'X-Access-Token',
    required: true,
    description: 'Admin user JWT forwarded by Kong',
  })
  @ApiOkResponse({ type: ProviderVerification })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse({ description: 'Status de verificação inválido' })
  async approve(
    @Param('id') id: string,
    @AuthUser() reviewedBy: string,
  ): Promise<ProviderVerification> {
    return this.providerService.approve({ providerId: id, reviewedBy });
  }

  @Put(':id/verification/reject')
  @Roles(ROLES.SERVICE.MANAGER)
  @UseGuards(B2CGuard, RolesGuard)
  @ApiOperation({ summary: 'Rejeitar prestador (Admin)' })
  @ApiHeader({
    name: 'X-Access-Token',
    required: true,
    description: 'Admin user JWT forwarded by Kong',
  })
  @ApiOkResponse({ type: ProviderVerification })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  async reject(
    @Param('id') id: string,
    @AuthUser() reviewedBy: string,
    @Body() body: RejectProviderRequestDto,
  ): Promise<ProviderVerification> {
    return this.providerService.reject({ providerId: id, reviewedBy, reason: body.reason });
  }

  @Get('payment-method-types')
  @ApiOperation({ summary: 'Listar tipos de formas de pagamento disponíveis' })
  @ApiOkResponse({ type: [PaymentMethodType] })
  async listPaymentMethodTypes(): Promise<PaymentMethodType[]> {
    return this.providerService.listPaymentMethodTypes();
  }

  @Get(':id/payment-methods')
  @ApiOperation({ summary: 'Listar formas de pagamento aceitas pelo prestador' })
  @ApiOkResponse({ type: [ProviderPaymentMethod] })
  @ApiNotFoundResponse()
  async listProviderPaymentMethods(@Param('id') id: string): Promise<ProviderPaymentMethod[]> {
    return this.providerService.listProviderPaymentMethods(id);
  }

  @Put(':id/payment-methods')
  @ApiOperation({ summary: 'Definir formas de pagamento aceitas pelo prestador' })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          paymentMethodTypeId: { type: 'string', format: 'uuid' },
          isEnabled: { type: 'boolean' },
        },
        required: ['paymentMethodTypeId', 'isEnabled'],
      },
    },
  })
  @ApiOkResponse({ type: [ProviderPaymentMethod] })
  @ApiNotFoundResponse()
  async setProviderPaymentMethods(
    @Param('id') id: string,
    @Body() body: { paymentMethodTypeId: string; isEnabled: boolean }[],
  ): Promise<ProviderPaymentMethod[]> {
    return this.providerService.setProviderPaymentMethods(id, body);
  }
}
