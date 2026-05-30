import { Address } from '@app/modules/shared/providers/database/entities/address.entity';
import { Category } from '@app/modules/shared/providers/database/entities/category.entity';
import { Document } from '@app/modules/shared/providers/database/entities/document.entity';
import { Email } from '@app/modules/shared/providers/database/entities/email.entity';
import { Phone } from '@app/modules/shared/providers/database/entities/phone.entity';
import { ProviderAddress } from '@app/modules/shared/providers/database/entities/provider-address.entity';
import { ProviderDocument } from '@app/modules/shared/providers/database/entities/provider-document.entity';
import { ProviderEmail } from '@app/modules/shared/providers/database/entities/provider-email.entity';
import { ProviderPhone } from '@app/modules/shared/providers/database/entities/provider-phone.entity';
import { ProviderProfile } from '@app/modules/shared/providers/database/entities/provider-profile.entity';
import { ProviderService } from '@app/modules/shared/providers/database/entities/provider-service.entity';
import { ProviderVerificationLog } from '@app/modules/shared/providers/database/entities/provider-verification-log.entity';
import { ProviderVerification } from '@app/modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderWorkLocation } from '@app/modules/shared/providers/database/entities/provider-work-location.entity';
import { Review } from '@app/modules/shared/providers/database/entities/review.entity';
import { ServiceRequest } from '@app/modules/shared/providers/database/entities/service-request.entity';
import { Service } from '@app/modules/shared/providers/database/entities/service.entity';
import { UserAddress } from '@app/modules/shared/providers/database/entities/user-address.entity';
import { UserEmail } from '@app/modules/shared/providers/database/entities/user-email.entity';
import { UserPhone } from '@app/modules/shared/providers/database/entities/user-phone.entity';
import { User } from '@app/modules/shared/providers/database/entities/user.entity';
import type { KeycloakSeededUser } from './keycloak';

export interface SeedContext {
  keycloakUsers: KeycloakSeededUser[];
  categories: Category[];
  services: Service[];
  emails: Email[];
  phones: Phone[];
  addresses: Address[];
  users: User[];
  userEmails: UserEmail[];
  userPhones: UserPhone[];
  userAddresses: UserAddress[];
  documents: Document[];
  providers: ProviderProfile[];
  providerEmails: ProviderEmail[];
  providerPhones: ProviderPhone[];
  providerAddresses: ProviderAddress[];
  providerServices: ProviderService[];
  providerWorkLocations: ProviderWorkLocation[];
  providerVerifications: ProviderVerification[];
  providerVerificationLogs: ProviderVerificationLog[];
  providerDocuments: ProviderDocument[];
  serviceRequests: ServiceRequest[];
  reviews: Review[];
  notificationsInserted: number;
}

export function createEmptyContext(): SeedContext {
  return {
    keycloakUsers: [],
    categories: [],
    services: [],
    emails: [],
    phones: [],
    addresses: [],
    users: [],
    userEmails: [],
    userPhones: [],
    userAddresses: [],
    documents: [],
    providers: [],
    providerEmails: [],
    providerPhones: [],
    providerAddresses: [],
    providerServices: [],
    providerWorkLocations: [],
    providerVerifications: [],
    providerVerificationLogs: [],
    providerDocuments: [],
    serviceRequests: [],
    reviews: [],
    notificationsInserted: 0,
  };
}
