import { DataSource } from 'typeorm';

import { AccountBlock } from '@app/modules/shared/providers/database/entities/account-block.entity';
import { Address } from '@app/modules/shared/providers/database/entities/address.entity';
import { Category } from '@app/modules/shared/providers/database/entities/category.entity';
import { CompanyAddress } from '@app/modules/shared/providers/database/entities/company-address.entity';
import { CompanyBusinessHours } from '@app/modules/shared/providers/database/entities/company-business-hours.entity';
import { CompanyEmail } from '@app/modules/shared/providers/database/entities/company-email.entity';
import { CompanyMember } from '@app/modules/shared/providers/database/entities/company-member.entity';
import { CompanyPhone } from '@app/modules/shared/providers/database/entities/company-phone.entity';
import { CompanyProvider } from '@app/modules/shared/providers/database/entities/company-provider.entity';
import { Company } from '@app/modules/shared/providers/database/entities/company.entity';
import { Document } from '@app/modules/shared/providers/database/entities/document.entity';
import { Email } from '@app/modules/shared/providers/database/entities/email.entity';
import { Phone } from '@app/modules/shared/providers/database/entities/phone.entity';
import { ProviderAddress } from '@app/modules/shared/providers/database/entities/provider-address.entity';
import { ProviderAvailability } from '@app/modules/shared/providers/database/entities/provider-availability.entity';
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
import { TermsAcceptance } from '@app/modules/shared/providers/database/entities/terms-acceptance.entity';
import { TermsVersion } from '@app/modules/shared/providers/database/entities/terms-version.entity';
import { UserAddress } from '@app/modules/shared/providers/database/entities/user-address.entity';
import { UserDocument } from '@app/modules/shared/providers/database/entities/user-document.entity';
import { UserEmail } from '@app/modules/shared/providers/database/entities/user-email.entity';
import { UserPhone } from '@app/modules/shared/providers/database/entities/user-phone.entity';
import { User } from '@app/modules/shared/providers/database/entities/user.entity';
import { VerificationCode } from '@app/modules/shared/providers/database/entities/verification-code.entity';

export function createPostgresDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_POSTGRES_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_POSTGRES_PORT ?? '5432', 10),
    username: process.env.DATABASE_POSTGRES_USER ?? 'postgres',
    password: process.env.DATABASE_POSTGRES_PASSWORD ?? 'postgres1234',
    database: process.env.DATABASE_POSTGRES_NAME ?? 'backend_database_postgres',
    synchronize: false,
    logging: false,
    entities: [
      AccountBlock,
      Address,
      Category,
      Company,
      CompanyAddress,
      CompanyBusinessHours,
      CompanyEmail,
      CompanyMember,
      CompanyPhone,
      CompanyProvider,
      Document,
      Email,
      Phone,
      ProviderAddress,
      ProviderAvailability,
      ProviderDocument,
      ProviderEmail,
      ProviderPhone,
      ProviderProfile,
      ProviderService,
      ProviderVerification,
      ProviderVerificationLog,
      ProviderWorkLocation,
      Review,
      Service,
      ServiceRequest,
      TermsAcceptance,
      TermsVersion,
      User,
      UserAddress,
      UserDocument,
      UserEmail,
      UserPhone,
      VerificationCode,
    ],
  });
}
