import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { OnboardingRegisterRequestDto } from './use-cases/register/onboarding-register-request.dto';
import { OnboardingRegisterUseCase } from './use-cases/register/onboarding-register.use-case';
import { SendVerificationCodeUseCase } from './use-cases/verification/send-verification-code.use-case';
import { VerifyCodeUseCase } from './use-cases/verification/verify-code.use-case';

class VerificationSendDto {
  type: 'email' | 'phone' | 'sms';
  destination: string;
}

class VerificationVerifyDto {
  type: 'email' | 'phone' | 'sms';
  destination: string;
  code: string;
}

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly onboardingRegisterUseCase: OnboardingRegisterUseCase,
    private readonly sendVerificationCodeUseCase: SendVerificationCodeUseCase,
    private readonly verifyCodeUseCase: VerifyCodeUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registro de usuário (com suporte a CNPJ/empresa)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Documento já cadastrado' })
  async register(@Body() dto: OnboardingRegisterRequestDto, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      ?? req.socket.remoteAddress
      ?? null;

    return this.onboardingRegisterUseCase.execute({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      password: dto.password,
      termsAccepted: dto.termsAccepted,
      ipAddress,
      document: dto.document,
      companyName: dto.companyName,
      tradeName: dto.tradeName,
    });
  }

  @Post('verification/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar código de verificação (salva em verification_codes)' })
  @ApiResponse({ status: 200, description: 'Código gerado e salvo' })
  async sendVerification(@Body() dto: VerificationSendDto) {
    const channel = dto.type === 'sms' ? 'phone' : dto.type;
    return this.sendVerificationCodeUseCase.execute({
      type: channel,
      destination: dto.destination,
    });
  }

  @Post('verification/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar código e atualizar verified_at no relacionamento' })
  @ApiResponse({ status: 200, description: '{ verified: boolean }' })
  async verifyCode(@Body() dto: VerificationVerifyDto) {
    const channel = dto.type === 'sms' ? 'phone' : dto.type;
    return this.verifyCodeUseCase.execute({
      type: channel,
      destination: dto.destination,
      code: dto.code,
    });
  }
}
