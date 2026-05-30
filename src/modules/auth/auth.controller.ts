import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { User } from '@modules/shared/providers/database/entities/user.entity';

import type { AcceptTermsParams } from './use-cases/accept-terms/accept-terms.interface';
import { AcceptTermsUseCase } from './use-cases/accept-terms/accept-terms.use-case';
import type { CheckDocumentExistsParams } from './use-cases/check-document-exists/check-document-exists.interface';
import { CheckDocumentExistsUseCase } from './use-cases/check-document-exists/check-document-exists.use-case';
import type { CheckEmailExistsParams } from './use-cases/check-email-exists/check-email-exists.interface';
import { CheckEmailExistsUseCase } from './use-cases/check-email-exists/check-email-exists.use-case';
import type { CheckPendingTermsParams } from './use-cases/check-pending-terms/check-pending-terms.interface';
import { CheckPendingTermsUseCase } from './use-cases/check-pending-terms/check-pending-terms.use-case';
import type { CheckPhoneExistsParams } from './use-cases/check-phone-exists/check-phone-exists.interface';
import { CheckPhoneExistsUseCase } from './use-cases/check-phone-exists/check-phone-exists.use-case';
import type { ForgotPasswordParams } from './use-cases/forgot-password/forgot-password.interface';
import { ForgotPasswordUseCase } from './use-cases/forgot-password/forgot-password.use-case';
import { GetCurrentTermsVersionUseCase } from './use-cases/get-current-terms/get-current-terms.use-case';
import { ListTermsVersionsUseCase } from './use-cases/list-terms-versions/list-terms-versions.use-case';
import { LookupCepUseCase } from './use-cases/lookup-cep/lookup-cep.use-case';
import { CreateProviderServiceUseCase } from './use-cases/provider-profile/create-provider-service.use-case';
import { DeleteProviderServiceUseCase } from './use-cases/provider-profile/delete-provider-service.use-case';
import { GetCategoriesUseCase } from './use-cases/provider-profile/get-categories.use-case';
import { GetProviderAvailabilityUseCase } from './use-cases/provider-profile/get-provider-availability.use-case';
import { GetProviderServicesUseCase } from './use-cases/provider-profile/get-provider-services.use-case';
import { SetProviderAvailabilityUseCase } from './use-cases/provider-profile/set-provider-availability.use-case';
import type {
  CreateProviderServiceParams,
  UpdateProviderServiceParams,
  SetProviderAvailabilityParams,
  UpdateProviderAvailabilityParams,
} from './use-cases/provider-profile/types';
import { UpdateProviderAvailabilityUseCase } from './use-cases/provider-profile/update-provider-availability.use-case';
import { UpdateProviderServiceUseCase } from './use-cases/provider-profile/update-provider-service.use-case';
import type { SendVerificationCodeParams } from './use-cases/send-verification-code/send-verification-code.interface';
import { SendVerificationCodeUseCase } from './use-cases/send-verification-code/send-verification-code.use-case';
import type { VerifyCodeParams } from './use-cases/verify-code/verify-code.interface';
import { VerifyCodeUseCase } from './use-cases/verify-code/verify-code.use-case';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly sendVerificationCode: SendVerificationCodeUseCase,
    private readonly verifyCode: VerifyCodeUseCase,
    private readonly lookupCep: LookupCepUseCase,
    private readonly acceptTerms: AcceptTermsUseCase,
    private readonly getCurrentTermsVersion: GetCurrentTermsVersionUseCase,
    private readonly checkPendingTerms: CheckPendingTermsUseCase,
    private readonly listTermsVersions: ListTermsVersionsUseCase,
    private readonly checkEmailExists: CheckEmailExistsUseCase,
    private readonly checkPhoneExists: CheckPhoneExistsUseCase,
    private readonly checkDocumentExists: CheckDocumentExistsUseCase,
    private readonly forgotPassword: ForgotPasswordUseCase,
    private readonly getCategories: GetCategoriesUseCase,
    private readonly createProviderService: CreateProviderServiceUseCase,
    private readonly getProviderServices: GetProviderServicesUseCase,
    private readonly updateProviderService: UpdateProviderServiceUseCase,
    private readonly deleteProviderService: DeleteProviderServiceUseCase,
    private readonly setProviderAvailability: SetProviderAvailabilityUseCase,
    private readonly getProviderAvailability: GetProviderAvailabilityUseCase,
    private readonly updateProviderAvailability: UpdateProviderAvailabilityUseCase,
    @InjectRepository(User, CONNECTIONS_NAMES.POSTGRES)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProviderProfile, CONNECTIONS_NAMES.POSTGRES)
    private readonly providerProfileRepository: Repository<ProviderProfile>,
  ) {}

  private async resolveProviderProfileId(keycloakId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { keycloakId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const providerProfile = await this.providerProfileRepository.findOne({
      where: { userId: user.id },
    });
    if (!providerProfile) throw new NotFoundException('Perfil de prestador não encontrado');

    return providerProfile.id;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recuperação de senha' })
  @ApiResponse({ status: 200, description: 'E-mail de recuperação disparado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @TraceMethod()
  async forgotPasswordHandler(@Body() body: ForgotPasswordParams): Promise<void> {
    return this.forgotPassword.execute(body);
  }

  @Post('verification/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar código de verificação' })
  @ApiResponse({ status: 200, description: 'Código enviado com sucesso.' })
  async sendVerificationCodeHandler(@Body() body: SendVerificationCodeParams) {
    return this.sendVerificationCode.execute(body);
  }

  @Post('verification/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar código' })
  @ApiResponse({ status: 200, description: 'Código verificado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Código inválido ou expirado.' })
  async verifyCodeHandler(@Body() body: VerifyCodeParams) {
    return this.verifyCode.execute(body);
  }

  @Get('cep/:cep')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consulta CEP' })
  @ApiResponse({ status: 200, description: 'CEP encontrado.' })
  @ApiResponse({ status: 404, description: 'CEP não encontrado.' })
  async lookupCepHandler(@Param('cep') cep: string) {
    return this.lookupCep.execute(cep);
  }

  @Post('terms/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aceitar termos de uso' })
  @ApiResponse({ status: 200, description: 'Termos aceitos com sucesso.' })
  async acceptTermsHandler(@Body() body: AcceptTermsParams, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) ?? null;
    return this.acceptTerms.execute({ ...body, ipAddress });
  }

  @Get('terms/current')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter versão atual dos termos' })
  @ApiResponse({ status: 200, description: 'Versão atual dos termos.' })
  async getCurrentTermsHandler() {
    return this.getCurrentTermsVersion.execute();
  }

  @Get('terms/versions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todas as versões dos termos' })
  @ApiResponse({ status: 200, description: 'Lista de versões dos termos.' })
  async listTermsVersionsHandler() {
    return this.listTermsVersions.execute();
  }

  @Post('terms/check-pending')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar se há termos pendentes' })
  @ApiResponse({ status: 200, description: 'Status de pendência dos termos.' })
  async checkPendingTermsHandler(@Body() body: CheckPendingTermsParams) {
    return this.checkPendingTerms.execute(body);
  }

  @Post('verify/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar se email existe' })
  @ApiResponse({ status: 200, description: 'Email disponível.' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado.' })
  @TraceMethod()
  async verifyEmail(@Body() body: CheckEmailExistsParams) {
    await this.checkEmailExists.execute(body);
  }

  @Post('verify/phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar se telefone existe' })
  @ApiResponse({ status: 200, description: 'Telefone disponível.' })
  @ApiResponse({ status: 409, description: 'Telefone já cadastrado.' })
  @TraceMethod()
  async verifyPhone(@Body() body: CheckPhoneExistsParams) {
    await this.checkPhoneExists.execute(body);
  }

  @Post('verify/document')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar se documento existe' })
  @ApiResponse({ status: 200, description: 'Documento disponível.' })
  @ApiResponse({ status: 409, description: 'Documento já cadastrado.' })
  @TraceMethod()
  async verifyDocument(@Body() body: CheckDocumentExistsParams) {
    await this.checkDocumentExists.execute(body);
  }

  // Provider Profile Endpoints

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar categorias de serviços' })
  @ApiResponse({ status: 200, description: 'Lista de categorias.' })
  async getCategoriesHandler() {
    return this.getCategories.execute();
  }

  @Post('providers/me/services')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar serviço prestador' })
  @ApiResponse({ status: 201, description: 'Serviço criado com sucesso.' })
  @TraceMethod()
  async createProviderServiceHandler(
    @Body() body: CreateProviderServiceParams,
    @Req() req: Request,
  ) {
    const keycloakId = (req.headers['x-user-id'] as string) ?? null;
    const providerId = await this.resolveProviderProfileId(keycloakId);
    return this.createProviderService.execute({ ...body, providerId });
  }

  @Get('providers/me/services')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar serviços do prestador' })
  @ApiResponse({ status: 200, description: 'Lista de serviços.' })
  @TraceMethod()
  async getProviderServicesHandler(@Req() req: Request) {
    const keycloakId = (req.headers['x-user-id'] as string) ?? null;
    const providerId = await this.resolveProviderProfileId(keycloakId);
    return this.getProviderServices.execute({ providerId });
  }

  @Put('providers/me/services/:serviceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar serviço prestador' })
  @ApiResponse({ status: 200, description: 'Serviço atualizado.' })
  @TraceMethod()
  async updateProviderServiceHandler(
    @Param('serviceId') serviceId: string,
    @Body() body: Omit<UpdateProviderServiceParams, 'providerId' | 'serviceId'>,
    @Req() req: Request,
  ) {
    const keycloakId = (req.headers['x-user-id'] as string) ?? null;
    const providerId = await this.resolveProviderProfileId(keycloakId);
    return this.updateProviderService.execute({ ...body, providerId, serviceId });
  }

  @Delete('providers/me/services/:serviceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar serviço prestador' })
  @ApiResponse({ status: 200, description: 'Serviço deletado.' })
  @TraceMethod()
  async deleteProviderServiceHandler(@Param('serviceId') serviceId: string, @Req() req: Request) {
    const keycloakId = (req.headers['x-user-id'] as string) ?? null;
    const providerId = await this.resolveProviderProfileId(keycloakId);
    return this.deleteProviderService.execute({ providerId, serviceId });
  }

  @Post('providers/me/availability')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Definir disponibilidade do prestador' })
  @ApiResponse({ status: 201, description: 'Disponibilidade definida.' })
  @TraceMethod()
  async setProviderAvailabilityHandler(
    @Body() body: Omit<SetProviderAvailabilityParams, 'providerId'>,
    @Req() req: Request,
  ) {
    const keycloakId = (req.headers['x-user-id'] as string) ?? null;
    const providerId = await this.resolveProviderProfileId(keycloakId);
    return this.setProviderAvailability.execute({ ...body, providerId });
  }

  @Get('providers/me/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar disponibilidade do prestador' })
  @ApiResponse({ status: 200, description: 'Lista de horários.' })
  @TraceMethod()
  async getProviderAvailabilityHandler(@Req() req: Request) {
    const keycloakId = (req.headers['x-user-id'] as string) ?? null;
    const providerId = await this.resolveProviderProfileId(keycloakId);
    return this.getProviderAvailability.execute({ providerId });
  }

  @Put('providers/me/availability/:dayOfWeek')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar disponibilidade do prestador' })
  @ApiResponse({ status: 200, description: 'Disponibilidade atualizada.' })
  @TraceMethod()
  async updateProviderAvailabilityHandler(
    @Param('dayOfWeek') dayOfWeek: string,
    @Body() body: Omit<UpdateProviderAvailabilityParams, 'providerId' | 'dayOfWeek'>,
    @Req() req: Request,
  ) {
    const keycloakId = (req.headers['x-user-id'] as string) ?? null;
    const providerId = await this.resolveProviderProfileId(keycloakId);
    return this.updateProviderAvailability.execute({
      ...body,
      providerId,
      dayOfWeek: Number(dayOfWeek),
    });
  }
}
