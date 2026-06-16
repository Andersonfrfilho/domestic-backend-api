import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { ApiConsumes, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';

type UploadedFile = { originalname: string; buffer: Buffer; size: number; mimetype: string };

import { OnboardingRegisterRequestDto } from './use-cases/register/onboarding-register-request.dto';
import { OnboardingRegisterUseCase } from './use-cases/register/onboarding-register.use-case';
import { SendVerificationCodeUseCase } from './use-cases/verification/send-verification-code.use-case';
import { VerifyCodeUseCase } from './use-cases/verification/verify-code.use-case';

class VerificationSendDto {
  @IsIn(['email', 'phone', 'sms'])
  type: 'email' | 'phone' | 'sms';

  @IsString()
  destination: string;
}

class VerificationVerifyDto {
  @IsIn(['email', 'phone', 'sms'])
  type: 'email' | 'phone' | 'sms';

  @IsString()
  destination: string;

  @IsString()
  code: string;
}

class OnboardingAddressDto {
  @IsString()
  @IsNotEmpty()
  keycloakId: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsOptional()
  complement?: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsOptional()
  latitude?: string;

  @IsString()
  @IsOptional()
  longitude?: string;
}

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly onboardingRegisterUseCase: OnboardingRegisterUseCase,
    private readonly sendVerificationCodeUseCase: SendVerificationCodeUseCase,
    private readonly verifyCodeUseCase: VerifyCodeUseCase,
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registro de usuário (com suporte a CNPJ/empresa)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Documento já cadastrado' })
  @TraceMethod()
  async register(@Body() dto: OnboardingRegisterRequestDto, @Req() req: any) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket?.remoteAddress ??
      null;

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
      userType: dto.userType,
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

  @Post('address')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Salvar endereço do usuário (onboarding — sem autenticação)',
    description: 'Aceita keycloakId no corpo. Permite apenas 1 endereço por este endpoint.',
  })
  @ApiResponse({ status: 201, description: 'Endereço salvo.' })
  @ApiResponse({ status: 409, description: 'Usuário já possui endereço cadastrado.' })
  async saveAddress(@Body() dto: OnboardingAddressDto) {
    const existing = await this.userService.listUserAddressesByKeycloakId(dto.keycloakId);
    if (existing.length > 0) {
      throw new ConflictException('Usuário já possui endereço cadastrado');
    }

    const userAddress = await this.userService.addUserAddressByKeycloakId(dto.keycloakId, {
      street: dto.street,
      number: dto.number,
      complement: dto.complement,
      neighborhood: dto.neighborhood,
      city: dto.city,
      state: dto.state,
      zipCode: dto.zipCode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      isPrimary: true,
    });

    const user = await this.userService.getUserByKeycloakId(dto.keycloakId);
    await this.onboardingRegisterUseCase.linkProviderAddress(user.id, userAddress.addressId);

    return userAddress;
  }

  @Post('documents')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload de documento (onboarding — sem autenticação)',
    description: 'Recebe keycloakId via header X-User-Id. Salva em documents + user_documents.',
  })
  @ApiHeader({ name: 'X-User-Id', required: true, description: 'keycloakId do usuário' })
  @ApiResponse({ status: 201, description: 'Documento salvo.' })
  @ApiResponse({ status: 400, description: 'Nenhum arquivo enviado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async uploadDocument(@Req() req: any): Promise<{ documentId: string; url: string }> {
    const keycloakId = req.headers['x-user-id'] as string;
    if (!keycloakId) throw new HttpException('X-User-Id não informado', HttpStatus.BAD_REQUEST);

    const data = await req.file();
    if (!data) throw new HttpException('Nenhum arquivo enviado', HttpStatus.BAD_REQUEST);

    const documentType = (data.fields?.documentType?.value as string) ?? 'UNKNOWN';
    const documentNumber = (data.fields?.documentNumber?.value as string) || undefined;
    const buffer = await data.toBuffer();
    const file: UploadedFile = {
      originalname: data.filename,
      buffer,
      size: buffer.length,
      mimetype: data.mimetype,
    };

    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.onboardingRegisterUseCase.saveDocumentToUser(
      user.id,
      documentType,
      file,
      documentNumber,
    );
  }
}
