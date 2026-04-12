import { ApiAuthGuard, AuthUser, Roles, RolesGuard } from '@adatechnology/auth-keycloak';
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { UserPhone } from '@modules/shared/providers/database/entities/user-phone.entity';
import { ROLES } from '@modules/shared/constants';

import { AddUserPhoneRequestDto } from './dtos/add-user-phone-request.dto';
import { VerifyPhoneCodeRequestDto } from './dtos/verify-phone-code-request.dto';
import { type PhoneServiceInterface } from './phone.service.interface';
import { PHONE_SERVICE_PROVIDE } from './phone.token';

@ApiTags('Phones')
@Injectable()
@Controller('/users/me/phones')
@Roles(ROLES.USER.MANAGER)
@UseGuards(ApiAuthGuard, RolesGuard)
@ApiHeader({ name: 'X-Access-Token', description: 'User JWT forwarded by Kong', required: true })
export class PhoneController {
  constructor(
    @Inject(PHONE_SERVICE_PROVIDE)
    private readonly phoneService: PhoneServiceInterface,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar telefones do usuário autenticado' })
  @ApiOkResponse({ type: [UserPhone] })
  async list(@AuthUser() keycloakId: string): Promise<UserPhone[]> {
    return this.phoneService.listUserPhonesByKeycloakId(keycloakId);
  }

  @Post()
  @ApiOperation({ summary: 'Adicionar telefone ao usuário autenticado' })
  @ApiCreatedResponse({ type: UserPhone })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({ description: 'Telefone já cadastrado para este usuário' })
  async add(
    @AuthUser() keycloakId: string,
    @Body() body: AddUserPhoneRequestDto,
  ): Promise<UserPhone> {
    return this.phoneService.addUserPhoneByKeycloakId(keycloakId, body);
  }

  @Delete(':userPhoneId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover telefone do usuário autenticado' })
  @ApiParam({ name: 'userPhoneId', type: String })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async remove(
    @AuthUser() keycloakId: string,
    @Param('userPhoneId') userPhoneId: string,
  ): Promise<void> {
    await this.phoneService.removeUserPhoneByKeycloakId(keycloakId, userPhoneId);
  }

  @Post(':userPhoneId/send-verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Enviar código de verificação para o telefone' })
  @ApiParam({ name: 'userPhoneId', type: String })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse({ description: 'Telefone já verificado' })
  async sendVerification(
    @AuthUser() keycloakId: string,
    @Param('userPhoneId') userPhoneId: string,
  ): Promise<void> {
    await this.phoneService.sendPhoneVerificationByKeycloakId(keycloakId, userPhoneId);
  }

  @Post(':userPhoneId/verify')
  @ApiOperation({ summary: 'Verificar código enviado ao telefone' })
  @ApiParam({ name: 'userPhoneId', type: String })
  @ApiOkResponse({ type: UserPhone })
  @ApiBadRequestResponse({ description: 'Código inválido ou expirado' })
  @ApiConflictResponse({ description: 'Telefone já verificado' })
  async verify(
    @AuthUser() keycloakId: string,
    @Param('userPhoneId') userPhoneId: string,
    @Body() body: VerifyPhoneCodeRequestDto,
  ): Promise<UserPhone> {
    return this.phoneService.verifyPhoneCodeByKeycloakId(keycloakId, userPhoneId, body.code);
  }
}
