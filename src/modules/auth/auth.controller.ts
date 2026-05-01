import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SendVerificationCodeUseCase } from './use-cases/send-verification-code/send-verification-code.use-case';
import { VerifyCodeUseCase } from './use-cases/verify-code/verify-code.use-case';
import { LookupCepUseCase } from './use-cases/lookup-cep/lookup-cep.use-case';
import { AcceptTermsUseCase } from './use-cases/accept-terms/accept-terms.use-case';
import { GetCurrentTermsVersionUseCase } from './use-cases/get-current-terms/get-current-terms.use-case';
import { CheckPendingTermsUseCase } from './use-cases/check-pending-terms/check-pending-terms.use-case';
import { ListTermsVersionsUseCase } from './use-cases/list-terms-versions/list-terms-versions.use-case';
import { CheckEmailExistsUseCase } from './use-cases/check-email-exists/check-email-exists.use-case';
import { CheckPhoneExistsUseCase } from './use-cases/check-phone-exists/check-phone-exists.use-case';
import { CheckDocumentExistsUseCase } from './use-cases/check-document-exists/check-document-exists.use-case';

import type { SendVerificationCodeParams } from './use-cases/send-verification-code/send-verification-code.interface';
import type { VerifyCodeParams } from './use-cases/verify-code/verify-code.interface';
import type { AcceptTermsParams } from './use-cases/accept-terms/accept-terms.interface';
import type { CheckPendingTermsParams } from './use-cases/check-pending-terms/check-pending-terms.interface';
import type { CheckEmailExistsParams } from './use-cases/check-email-exists/check-email-exists.interface';
import type { CheckPhoneExistsParams } from './use-cases/check-phone-exists/check-phone-exists.interface';
import type { CheckDocumentExistsParams } from './use-cases/check-document-exists/check-document-exists.interface';

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
  ) {}

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
  async verifyEmail(@Body() body: CheckEmailExistsParams) {
    await this.checkEmailExists.execute(body);
  }

  @Post('verify/phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar se telefone existe' })
  @ApiResponse({ status: 200, description: 'Telefone disponível.' })
  @ApiResponse({ status: 409, description: 'Telefone já cadastrado.' })
  async verifyPhone(@Body() body: CheckPhoneExistsParams) {
    await this.checkPhoneExists.execute(body);
  }

  @Post('verify/document')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar se documento existe' })
  @ApiResponse({ status: 200, description: 'Documento disponível.' })
  @ApiResponse({ status: 409, description: 'Documento já cadastrado.' })
  async verifyDocument(@Body() body: CheckDocumentExistsParams) {
    await this.checkDocumentExists.execute(body);
  }
}
