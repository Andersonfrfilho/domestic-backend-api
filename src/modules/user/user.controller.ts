import { ApiAuthGuard, AuthUser, Roles, RolesGuard } from '@adatechnology/nestjs-auth-keycloak';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Injectable,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { UserAddress } from '@app/modules/shared/providers/database/entities/user-address.entity';
import { UserDocument } from '@modules/shared/providers/database/entities/user-document.entity';
import { ROLES } from '@modules/shared/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AddUserAddressRequestDto } from './use-cases/add-user-address/dtos/add-user-address-request.dto';
import { type UserServiceInterface } from './use-cases/create-users/create-user.interface';
import { CreateUserRequestDto } from './use-cases/create-users/dtos/create-user-request.dto';
import { CreateUserResponseDto } from './use-cases/create-users/dtos/create-user-response.dto';
import { UpdateUserRequestDto } from './use-cases/update-user/dtos/update-user-request.dto';
import { UserStats } from './user.repository.interface';
import { USER_SERVICE_PROVIDE } from './user.token';

@ApiTags('Users')
@Injectable()
@Controller('/users')
export class UserController {
  constructor(
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
    @InjectRepository(UserDocument, CONNECTIONS_NAMES.POSTGRES)
    private readonly userDocumentRepository: Repository<UserDocument>,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar usuário',
    description: 'Cria usuário após registro no Keycloak. Público — não requer autenticação.',
  })
  @ApiCreatedResponse({ type: CreateUserResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({
    description: 'keycloakId já existe. Se a conta foi deletada, use POST /users/:id/restore',
  })
  @ApiInternalServerErrorResponse()
  async create(@Body() params: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    return this.userService.createUser(params);
  }

  @Post(':id/restore')
  @ApiOperation({
    summary: 'Restaurar usuário deletado',
    description: 'Reativa uma conta que foi removida via soft delete.',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID interno do usuário' })
  @ApiOkResponse({ type: CreateUserResponseDto })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @ApiConflictResponse({ description: 'Usuário não está deletado' })
  async restore(@Param('id') id: string): Promise<CreateUserResponseDto> {
    return this.userService.restoreUser(id);
  }

  @Get('me')
  @Roles(ROLES.USER.MANAGER)
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Perfil do usuário autenticado',
    description: 'Retorna o usuário com base no X-User-Id injetado pelo Kong.',
  })
  @ApiHeader({ name: 'X-Access-Token', description: 'User JWT forwarded by Kong', required: true })
  @ApiOkResponse({ type: CreateUserResponseDto })
  @ApiNotFoundResponse()
  async getMe(@AuthUser() keycloakId: string): Promise<CreateUserResponseDto> {
    return this.userService.getUserByKeycloakId(keycloakId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID interno' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: CreateUserResponseDto })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  async findById(@Param('id') id: string): Promise<CreateUserResponseDto> {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: CreateUserResponseDto })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    return this.userService.updateUser(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar usuário (soft delete — status = DELETED)' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }

  @Get('admin/stats')
  @ApiOperation({ summary: 'Contagem de usuários por tipo (Admin apenas)' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number' },
        customers: { type: 'number' },
        providers: { type: 'number' },
      },
    },
  })
  async getStats(): Promise<UserStats> {
    return this.userService.getUserStats();
  }

  @Get('me/addresses')
  @Roles(ROLES.USER.MANAGER)
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Listar endereços do usuário autenticado' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiOkResponse({ type: [UserAddress] })
  async listAddresses(@AuthUser() keycloakId: string): Promise<UserAddress[]> {
    return this.userService.listUserAddressesByKeycloakId(keycloakId);
  }

  @Post('me/addresses')
  @Roles(ROLES.USER.MANAGER)
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Adicionar endereço ao usuário autenticado' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiOkResponse({ type: UserAddress })
  async addAddress(
    @AuthUser() keycloakId: string,
    @Body() body: AddUserAddressRequestDto,
  ): Promise<UserAddress> {
    return this.userService.addUserAddressByKeycloakId(keycloakId, body);
  }

  @Delete('me/addresses/:addressId')
  @Roles(ROLES.USER.MANAGER)
  @UseGuards(ApiAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover endereço do usuário autenticado' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'addressId', type: String })
  @ApiNoContentResponse()
  async removeAddress(
    @AuthUser() keycloakId: string,
    @Param('addressId') addressId: string,
  ): Promise<void> {
    await this.userService.removeUserAddressByKeycloakId(keycloakId, addressId);
  }

  @Get('me/documents')
  @Roles(ROLES.USER.MANAGER)
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Listar documentos do usuário autenticado' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiOkResponse({ type: [UserDocument] })
  async listDocuments(@AuthUser() keycloakId: string): Promise<UserDocument[]> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.userDocumentRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });
  }

  @Get('me/onboarding-status')
  @Roles(ROLES.USER.MANAGER)
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Status do onboarding do usuário autenticado' })
  @ApiHeader({ name: 'X-Access-Token', description: 'User JWT forwarded by Kong', required: true })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        hasAddress: { type: 'boolean' },
        hasDocument: { type: 'boolean' },
      },
    },
  })
  async getOnboardingStatus(
    @AuthUser() keycloakId: string,
  ): Promise<{ hasAddress: boolean; hasDocument: boolean }> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    const [addresses, documents] = await Promise.all([
      this.userService.listUserAddressesByKeycloakId(keycloakId),
      this.userDocumentRepository.find({
        where: { userId: user.id },
        select: ['id'],
        take: 1,
      }),
    ]);
    return {
      hasAddress: addresses.length > 0,
      hasDocument: documents.length > 0,
    };
  }
}
