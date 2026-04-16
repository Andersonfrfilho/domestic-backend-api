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
import { UserAddress } from '@app/modules/shared/providers/database/entities/user-address.entity';
import { UserEmail } from '@app/modules/shared/providers/database/entities/user-email.entity';
import { UserPhone } from '@app/modules/shared/providers/database/entities/user-phone.entity';
import { User } from '@app/modules/shared/providers/database/entities/user.entity';

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
      User,
      Phone,
      Address,
      Email,
      UserAddress,
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
    ],
  });
}
