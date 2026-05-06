import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { OnboardingRegisterRequestDto } from './use-cases/register/onboarding-register-request.dto';
import { OnboardingRegisterUseCase } from './use-cases/register/onboarding-register.use-case';

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly onboardingRegisterUseCase: OnboardingRegisterUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registro de usuário (com suporte a CNPJ/empresa)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'CNPJ já cadastrado' })
  async register(@Body() dto: OnboardingRegisterRequestDto & { keycloakId: string }) {
    return this.onboardingRegisterUseCase.execute({
      keycloakId: dto.keycloakId,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      cpf: dto.cpf,
      cnpj: dto.cnpj,
      companyName: dto.companyName,
      tradeName: dto.tradeName,
    });
  }
}
