import { KEYCLOAK_ADMIN_CLIENT, KeycloakAdminClient } from '@adatechnology/keycloak-admin';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { TraceMethod } from '@adatechnology/logger';

type UploadedFile = { originalname: string; buffer: Buffer; size: number; mimetype: string };
import { type StorageProviderInterface } from '@modules/shared/providers/storage/storage.interface';
import { STORAGE_PROVIDER } from '@modules/shared/providers/storage/storage.token';
import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { CompanyStatus } from '@app/modules/shared/providers/database/entities/company.entity';
import { CompanyMemberRole } from '@app/modules/shared/providers/database/entities/company-member.entity';
import { Email } from '@modules/shared/providers/database/entities/email.entity';
import { Phone } from '@modules/shared/providers/database/entities/phone.entity';
import { TermsAcceptance } from '@modules/shared/providers/database/entities/terms-acceptance.entity';
import { TermsVersion } from '@modules/shared/providers/database/entities/terms-version.entity';
import { Document } from '@modules/shared/providers/database/entities/document.entity';
import { UserDocument } from '@modules/shared/providers/database/entities/user-document.entity';
import { UserEmail } from '@modules/shared/providers/database/entities/user-email.entity';
import { UserPhone } from '@modules/shared/providers/database/entities/user-phone.entity';

import { COMPANY_REPOSITORY_PROVIDE } from '@modules/company/company.token';
import type { CompanyRepositoryInterface } from '@modules/company/company.repository.interface';
import { USER_REPOSITORY_PROVIDE } from '@modules/user/user.token';
import type { UserRepositoryInterface } from '@modules/user/user.repository.interface';

export const ONBOARDING_REGISTER_LOG_MESSAGES = {
  START_FLOW: 'Starting onboarding register flow',
  KEYCLOAK_CREATING: 'Creating Keycloak user...',
  KEYCLOAK_CREATED: 'Keycloak user created',
  KEYCLOAK_EXISTS: 'Keycloak user already exists with this email',
  KEYCLOAK_ROLE_ASSIGNED: 'Keycloak realm role assigned',
  KEYCLOAK_ROLE_FAILED: 'Failed to assign Keycloak realm role (non-fatal)',
  USER_CREATED: 'Local user created',
  EMAIL_SAVED: 'Email saved to emails + user_emails',
  PHONE_SAVED: 'Phone saved to phones + user_phones',
  TERMS_ACCEPTED: 'Terms acceptance saved',
  TERMS_VERSION_NOT_FOUND: 'No active terms version found — skipping terms acceptance',
  DOCUMENT_SAVED: 'Document saved to user_documents',
  COMPANY_CREATED: 'Company created for CNPJ user',
  CNPJ_EXISTS: 'CNPJ already registered',
} as const;

const USER_MANAGER_ROLE = 'user-manager';

function inferDocumentType(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) return 'CPF';
  if (digits.length === 14) return 'CNPJ';
  if (digits.length >= 6 && digits.length <= 9 && /^\d+$/.test(digits)) return 'RG';
  if (/^[A-Z0-9]{6,9}$/i.test(value)) return 'PASSPORT';
  return null;
}

export interface OnboardingRegisterParams {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  termsAccepted?: boolean;
  ipAddress?: string;
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
    @InjectRepository(Email, CONNECTIONS_NAMES.POSTGRES)
    private readonly emailRepository: Repository<Email>,
    @InjectRepository(Phone, CONNECTIONS_NAMES.POSTGRES)
    private readonly phoneRepository: Repository<Phone>,
    @InjectRepository(UserEmail, CONNECTIONS_NAMES.POSTGRES)
    private readonly userEmailRepository: Repository<UserEmail>,
    @InjectRepository(UserPhone, CONNECTIONS_NAMES.POSTGRES)
    private readonly userPhoneRepository: Repository<UserPhone>,
    @InjectRepository(TermsAcceptance, CONNECTIONS_NAMES.POSTGRES)
    private readonly termsAcceptanceRepository: Repository<TermsAcceptance>,
    @InjectRepository(TermsVersion, CONNECTIONS_NAMES.POSTGRES)
    private readonly termsVersionRepository: Repository<TermsVersion>,
    @InjectRepository(UserDocument, CONNECTIONS_NAMES.POSTGRES)
    private readonly userDocumentRepository: Repository<UserDocument>,
    @InjectRepository(Document, CONNECTIONS_NAMES.POSTGRES)
    private readonly documentRepository: Repository<Document>,
    @Inject(STORAGE_PROVIDER)
    private readonly storage: StorageProviderInterface,
    private readonly configService: ConfigService,
  ) {
    this.keycloakBaseUrl = process.env.KEYCLOAK_BASE_URL || 'http://keycloak:8080';
    this.keycloakRealm = process.env.KEYCLOAK_REALM || 'domestic';
  }

  @TraceMethod()
  async execute(params: OnboardingRegisterParams): Promise<OnboardingRegisterResult> {
    const documentType = params.document ? inferDocumentType(params.document) : null;
    this.logProvider.info({
      message: ONBOARDING_REGISTER_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { email: params.email, documentType },
    });

    // 1. Token admin
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

    // 2b. Atribui role user-manager no Keycloak
    await this.assignRealmRole(accessToken, keycloakId, USER_MANAGER_ROLE);

    // 3. Cria usuário local
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

    // 4. Salva email → emails + user_emails
    await this.saveEmail(user.id, params.email);

    // 5. Salva telefone → phones + user_phones
    await this.savePhone(user.id, params.phone);

    // 6. Salva aceite dos termos
    if (params.termsAccepted) {
      await this.saveTermsAcceptance(user.id, params.ipAddress ?? null);
    }

    // 7. Salva documento (CPF/CNPJ/RG/Passaporte)
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

    // 8. Se CNPJ, cria empresa
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

  async saveDocumentToUser(
    userId: string,
    documentType: string,
    file: UploadedFile,
  ): Promise<{ documentId: string; url: string }> {
    const bucket = this.configService.get<string>('STORAGE_MINIO_BUCKET') ?? 'documents';
    const ext = file.originalname.split('.').pop() ?? 'bin';
    const objectName = `${userId}/${documentType}/${randomUUID()}.${ext}`;

    const stream = Readable.from(file.buffer);
    await this.storage.upload({ bucket, objectName, stream, size: file.size, contentType: file.mimetype });

    const doc = await this.documentRepository.save({
      userId,
      documentType,
      documentUrl: objectName,
      status: 'PENDING',
    });

    return { documentId: doc.id, url: objectName };
  }

  private async saveEmail(userId: string, emailAddress: string): Promise<void> {
    let emailRecord = await this.emailRepository.findOne({ where: { email: emailAddress } });
    if (!emailRecord) {
      emailRecord = await this.emailRepository.save({ email: emailAddress });
    }

    await this.userEmailRepository.save({
      userId,
      emailId: emailRecord.id,
      isPrimary: true,
      label: null,
    });

    this.logProvider.info({
      message: ONBOARDING_REGISTER_LOG_MESSAGES.EMAIL_SAVED,
      context: this.logContext,
      meta: { userId, emailId: emailRecord.id },
    });
  }

  private async savePhone(userId: string, phoneNumber: string): Promise<void> {
    let phoneRecord = await this.phoneRepository.findOne({ where: { number: phoneNumber } });
    if (!phoneRecord) {
      phoneRecord = await this.phoneRepository.save({
        number: phoneNumber,
        type: 'MOBILE',
      });
    }

    await this.userPhoneRepository.save({
      userId,
      phoneId: phoneRecord.id,
      isPrimary: true,
      label: null,
    });

    this.logProvider.info({
      message: ONBOARDING_REGISTER_LOG_MESSAGES.PHONE_SAVED,
      context: this.logContext,
      meta: { userId, phoneId: phoneRecord.id },
    });
  }

  private async saveTermsAcceptance(userId: string, ipAddress: string | null): Promise<void> {
    const activeVersion = await this.termsVersionRepository.findOne({
      where: { isActive: true },
      order: { effectiveDate: 'DESC' },
    });

    if (!activeVersion) {
      this.logProvider.error({
        message: ONBOARDING_REGISTER_LOG_MESSAGES.TERMS_VERSION_NOT_FOUND,
        context: this.logContext,
        meta: {
          userId,
          action: 'terms_acceptance_skipped',
          reason: 'No active terms_version found in database — check terms_versions table',
        },
      });
      return;
    }

    await this.termsAcceptanceRepository.save({
      userId,
      termsVersion: activeVersion,
      acceptedAt: new Date(),
      ipAddress,
    });

    this.logProvider.info({
      message: ONBOARDING_REGISTER_LOG_MESSAGES.TERMS_ACCEPTED,
      context: this.logContext,
      meta: { userId, termsVersionId: activeVersion.id, version: activeVersion.version },
    });
  }

  private async assignRealmRole(token: string, keycloakId: string, roleName: string): Promise<void> {
    try {
      // 1. Lookup the role ID
      const rolesUrl = `${this.keycloakBaseUrl}/admin/realms/${this.keycloakRealm}/roles/${roleName}`;
      const roleResponse = await fetch(rolesUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!roleResponse.ok) {
        this.logProvider.warn({
          message: ONBOARDING_REGISTER_LOG_MESSAGES.KEYCLOAK_ROLE_FAILED,
          context: this.logContext,
          meta: { keycloakId, roleName, status: roleResponse.status },
        });
        return;
      }

      const role = await roleResponse.json();

      // 2. Assign the role to the user
      const assignUrl = `${this.keycloakBaseUrl}/admin/realms/${this.keycloakRealm}/users/${keycloakId}/role-mappings/realm`;
      const assignResponse = await fetch(assignUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ id: role.id, name: role.name }]),
      });

      if (!assignResponse.ok) {
        this.logProvider.warn({
          message: ONBOARDING_REGISTER_LOG_MESSAGES.KEYCLOAK_ROLE_FAILED,
          context: this.logContext,
          meta: { keycloakId, roleName, status: assignResponse.status },
        });
        return;
      }

      this.logProvider.info({
        message: ONBOARDING_REGISTER_LOG_MESSAGES.KEYCLOAK_ROLE_ASSIGNED,
        context: this.logContext,
        meta: { keycloakId, roleName },
      });
    } catch (error) {
      // Non-fatal: log and continue — the user was created; role can be fixed manually
      this.logProvider.warn({
        message: ONBOARDING_REGISTER_LOG_MESSAGES.KEYCLOAK_ROLE_FAILED,
        context: this.logContext,
        meta: { keycloakId, roleName, error: error?.message },
      });
    }
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
