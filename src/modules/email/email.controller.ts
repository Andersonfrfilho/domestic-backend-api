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

import { ROLES } from '@modules/shared/constants';
import { UserEmail } from '@modules/shared/providers/database/entities/user-email.entity';

import { AddUserEmailRequestDto } from './dtos/add-user-email-request.dto';
import { VerifyEmailCodeRequestDto } from './dtos/verify-email-code-request.dto';
import { type EmailServiceInterface } from './email.service.interface';
import { EMAIL_SERVICE_PROVIDE } from './email.token';

@ApiTags('Emails')
@Injectable()
@Controller('/users/me/emails')
@Roles(ROLES.USER.MANAGER)
@UseGuards(ApiAuthGuard, RolesGuard)
@ApiHeader({ name: 'X-Access-Token', description: 'User JWT forwarded by Kong', required: true })
export class EmailController {
  constructor(
    @Inject(EMAIL_SERVICE_PROVIDE)
    private readonly emailService: EmailServiceInterface,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar emails do usuário autenticado' })
  @ApiOkResponse({ type: [UserEmail] })
  async list(@AuthUser() keycloakId: string): Promise<UserEmail[]> {
    return this.emailService.listUserEmailsByKeycloakId(keycloakId);
  }

  @Post()
  @ApiOperation({ summary: 'Adicionar email ao usuário autenticado' })
  @ApiCreatedResponse({ type: UserEmail })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({ description: 'Email já cadastrado para este usuário' })
  async add(
    @AuthUser() keycloakId: string,
    @Body() body: AddUserEmailRequestDto,
  ): Promise<UserEmail> {
    return this.emailService.addUserEmailByKeycloakId(keycloakId, body);
  }

  @Delete(':userEmailId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover email do usuário autenticado' })
  @ApiParam({ name: 'userEmailId', type: String })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async remove(
    @AuthUser() keycloakId: string,
    @Param('userEmailId') userEmailId: string,
  ): Promise<void> {
    await this.emailService.removeUserEmailByKeycloakId(keycloakId, userEmailId);
  }

  @Post(':userEmailId/send-verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Enviar código de verificação para o email' })
  @ApiParam({ name: 'userEmailId', type: String })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse({ description: 'Email já verificado' })
  async sendVerification(
    @AuthUser() keycloakId: string,
    @Param('userEmailId') userEmailId: string,
  ): Promise<void> {
    await this.emailService.sendEmailVerificationByKeycloakId(keycloakId, userEmailId);
  }

  @Post(':userEmailId/verify')
  @ApiOperation({ summary: 'Verificar código enviado ao email' })
  @ApiParam({ name: 'userEmailId', type: String })
  @ApiOkResponse({ type: UserEmail })
  @ApiBadRequestResponse({ description: 'Código inválido ou expirado' })
  @ApiConflictResponse({ description: 'Email já verificado' })
  async verify(
    @AuthUser() keycloakId: string,
    @Param('userEmailId') userEmailId: string,
    @Body() body: VerifyEmailCodeRequestDto,
  ): Promise<UserEmail> {
    return this.emailService.verifyEmailCodeByKeycloakId(keycloakId, userEmailId, body.code);
  }

  @Post(':userEmailId/set-primary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Definir email como principal' })
  @ApiParam({ name: 'userEmailId', type: String })
  @ApiOkResponse({ type: UserEmail })
  @ApiNotFoundResponse()
  async setPrimary(
    @AuthUser() keycloakId: string,
    @Param('userEmailId') userEmailId: string,
  ): Promise<UserEmail> {
    return this.emailService.setPrimaryEmailByKeycloakId(keycloakId, userEmailId);
  }
}
