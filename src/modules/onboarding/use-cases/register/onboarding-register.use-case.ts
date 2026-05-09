import { KEYCLOAK_ADMIN_CLIENT, KeycloakAdminClient } from '@adatechnology/keycloak-admin';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { CompanyStatus } from '@app/modules/shared/providers/database/entities/company.entity';
import { CompanyMemberRole } from '@app/modules/shared/providers/database/entities/company-member.entity';
import { UserDocument } from '@modules/shared/providers/database/entities/user-document.entity';

import { COMPANY_REPOSITORY_PROVIDE } from '@modules/company/company.token';
import type { CompanyRepositoryInterface } from '@modules/company/company.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';
import type { UserRepositoryInterface } from '@modules/user/user.repository.interface';

export const ONBOARDING_REGISTER_LOG_MESSAGES = {
  START_FLOW: 'Starting onboarding register flow',
  KEYCLOAK_CREATING: 'Creating Keycloak user...',
  KEYCLOAK_CREATED: 'Keycloak user created',
  KEYCLOAK_EXISTS: 'Keycloak user already exists with this email',
  USER_CREATED: 'Local user created',
  DOCUMENT_SAVED: 'Document saved to user_documents',
  COMPANY_CREATED: 'Company created for CNPJ user',
  CNPJ_EXISTS: 'CNPJ already registered',
} as const;

function inferDocumentType(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) return 'CPF';
  if (digits.length === 14) return 'CNPJ';
  return null;
}

export interface OnboardingRegisterParams {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  document?: string;
  companyName?: string;
  tradeName?: string;
}

export interface OnboardingRegisterResult {
  userId: string;
  keycloakId: string;
  companyId?: string;
}

@Injectable()
export class OnboardingRegisterUseCase {
  private readonly logContext = `${this.constructor.name}.execute`;
  private readonly keycloakBaseUrl: string;
  private readonly keycloakRealm: string;

  constructor(
    @Inject(USER_REPOSITORY_PROVIDE)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(COMPANY_REPOSITORY_PROVIDE)
    private readonly companyRepository: CompanyRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    @Inject(KEYCLOAK_ADMIN_CLIENT)
    private readonly keycloakAdmin: KeycloakAdminClient,
    @InjectRepository(UserDocument, CONNECTIONS_NAMES.POSTGRES)
    private readonly userDocumentRepository: Repository<UserDocument>,
  ) {
    this.keycloakBaseUrl = process.env.KEYCLOAK_BASE_URL || 'http://keycloak:8080';
    this.keycloakRealm = process.env.KEYCLOAK_REALM || 'domestic';
  }

  async execute(params: OnboardingRegisterParams): Promise<OnboardingRegisterResult> {
    const documentType = params.document ? inferDocumentType(params.document) : null;
    this.logProvider.info({
      message: ONBOARDING_REGISTER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { email: params.email, documentType },
    });

    // 1. Obtém token admin
    const { accessToken } = await this.keycloakAdmin.getAdminToken();

    // 2. Cria usuário no Keycloak
    this.logProvider.info({
      message: ONBOARDING_REGISTER_LOG_MESSAGES.KEYCLOAK_CREATING,
      context: this.logContext,
      meta: { email: params.email },
    });

    const keycloakId = await this.createKeycloakUser(accessToken, params);

    this.logProvider.info({
      message: ONBOARDING_REGISTER_LOG_MESSAGES.KEYCLOAK_CREATED,
      context: this.logContext,
      meta: { keycloakId, email: params.email },
    });

    // 3. Cria no banco local
    const user = await this.userRepository.create({
      fullName: `${params.firstName} ${params.lastName}`,
      keycloakId,
      status: 'PENDING',
    });

    this.logProvider.info({
      message: ONBOARDING_REGISTER_LOG_MESSAGES.USER_CREATED,
      context: this.logContext,
      meta: { userId: user.id, keycloakId },
    });

    // 4. Salva documento (CPF/CNPJ/RG/Passaporte) como UserDocument
    if (params.document) {
      const docType = inferDocumentType(params.document);
      if (docType) {
        await this.userDocumentRepository.save({
          userId: user.id,
          documentNumber: params.document.replace(/\D/g, ''),
          documentType: docType,
          status: 'PENDING',
        });
        this.logProvider.info({
          message: ONBOARDING_REGISTER_LOG_MESSAGES.DOCUMENT_SAVED,
          context: this.logContext,
          meta: { userId: user.id, documentType: docType },
        });
      }
    }

    // 5. Se CNPJ, cria empresa
    if (params.document && inferDocumentType(params.document) === 'CNPJ') {
      const existingCompany = await this.companyRepository.findByDocument(params.document);
      if (existingCompany) {
        this.logProvider.warn({
          message: ONBOARDING_REGISTER_LOG_MESSAGES.CNPJ_EXISTS,
          context: this.logContext,
          meta: { document: params.document, existingCompanyId: existingCompany.id },
        });
        throw new ConflictException(`CNPJ ${params.document} já está cadastrado`);
      }

      const company = await this.companyRepository.create({
        document: params.document,
        companyName: params.companyName || `${params.firstName} ${params.lastName}`,
        tradeName: params.tradeName || null,
        email: params.email,
        phone: params.phone,
        status: CompanyStatus.PENDING,
      });

      await this.companyRepository.createMember({
        companyId: company.id,
        userId: user.id,
        role: CompanyMemberRole.ADMIN,
      });

      this.logProvider.info({
        message: ONBOARDING_REGISTER_LOG_MESSAGES.COMPANY_CREATED,
        context: this.logContext,
        meta: { companyId: company.id, userId: user.id, document: params.document },
      });

      return { userId: user.id, keycloakId, companyId: company.id };
    }

    return { userId: user.id, keycloakId };
  }

  private async createKeycloakUser(token: string, params: OnboardingRegisterParams): Promise<string> {
    const url = `${this.keycloakBaseUrl}/admin/realms/${this.keycloakRealm}/users`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: params.email,
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        enabled: true,
        emailVerified: false,
        ...(params.document ? { attributes: { document: [params.document] } } : {}),
        credentials: [
          {
            type: 'password',
            value: params.password,
            temporary: false,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logProvider.warn({
        message: ONBOARDING_REGISTER_LOG_MESSAGES.KEYCLOAK_EXISTS,
        context: this.logContext,
        meta: {
          email: params.email,
          status: response.status,
          error: errorText,
        },
      });

      if (response.status === 409) {
        throw new ConflictException('E-mail já está em uso');
      }
      throw new Error(`Keycloak user creation failed: ${response.status} - ${errorText}`);
    }

    const locationHeader = response.headers.get('location');
    return locationHeader?.split('/').pop() ?? '';
  }
}
