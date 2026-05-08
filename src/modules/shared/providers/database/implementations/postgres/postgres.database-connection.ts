import { DataSource } from 'typeorm';

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
import { CompanyAddress } from '@app/modules/shared/providers/database/entities/company-address.entity';
import { CompanyBusinessHours } from '@app/modules/shared/providers/database/entities/company-business-hours.entity';
import { CompanyEmail } from '@app/modules/shared/providers/database/entities/company-email.entity';
import { AccountBlock } from '@app/modules/shared/providers/database/entities/account-block.entity';
import { CompanyMember } from '@app/modules/shared/providers/database/entities/company-member.entity';
import { CompanyPhone } from '@app/modules/shared/providers/database/entities/company-phone.entity';
import { CompanyProvider } from '@app/modules/shared/providers/database/entities/company-provider.entity';
import { Company } from '@app/modules/shared/providers/database/entities/company.entity';
import { TermsAcceptance } from '@app/modules/shared/providers/database/entities/terms-acceptance.entity';
import { TermsVersion } from '@app/modules/shared/providers/database/entities/terms-version.entity';
import { UserAddress } from '@app/modules/shared/providers/database/entities/user-address.entity';
import { UserDocument } from '@app/modules/shared/providers/database/entities/user-document.entity';
import { UserEmail } from '@app/modules/shared/providers/database/entities/user-email.entity';
import { UserPhone } from '@app/modules/shared/providers/database/entities/user-phone.entity';
import { User } from '@app/modules/shared/providers/database/entities/user.entity';
import { VerificationCode } from '@app/modules/shared/providers/database/entities/verification-code.entity';
import { getDatabaseConfig } from '@config/database-config';

import { migrations } from '../../migrations/index';

const config = getDatabaseConfig();
const PostgresDataSource = new DataSource({
  type: 'postgres',
  host: config.postgres.host,
  port: config.postgres.port,
  username: config.postgres.username,
  password: config.postgres.password,
  database: config.postgres.database,
  logging: config.postgres.logging,
  synchronize: config.postgres.synchronize,
  entities: [
    User,
    Phone,
    Address,
    Email,
    UserAddress,
    UserDocument,
    UserEmail,
    UserPhone,
    ProviderProfile,
    ProviderEmail,
    ProviderPhone,
    ProviderAddress,
    ProviderWorkLocation,
    Category,
    Service,
    ProviderService,
    ServiceRequest,
    Review,
    Document,
    ProviderVerification,
    ProviderVerificationLog,
    ProviderDocument,
    VerificationCode,
    TermsAcceptance,
    TermsVersion,
    AccountBlock,
    Company,
    CompanyMember,
    CompanyAddress,
    CompanyEmail,
    CompanyPhone,
    CompanyBusinessHours,
    CompanyProvider,
  ],
  migrations,
  migrationsRun: false,
});

export default PostgresDataSource;
