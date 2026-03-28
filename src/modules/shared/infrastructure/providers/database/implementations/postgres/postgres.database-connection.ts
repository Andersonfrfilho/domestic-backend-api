import { DataSource } from 'typeorm';

import {
  BenchmarkNanoidEntity,
  BenchmarkSnowflakeEntity,
  BenchmarkUUIDv4Entity,
  BenchmarkUUIDv7Entity,
} from '@app/modules/benchmark/domain/entities/benchmark.entities';
import { Address } from '@app/modules/shared/domain/entities/address.entity';
import { Category } from '@app/modules/shared/domain/entities/category.entity';
import { Document } from '@app/modules/shared/domain/entities/document.entity';
import { Email } from '@app/modules/shared/domain/entities/email.entity';
import { Phone } from '@app/modules/shared/domain/entities/phone.entity';
import { ProviderAddress } from '@app/modules/shared/domain/entities/provider-address.entity';
import { ProviderDocument } from '@app/modules/shared/domain/entities/provider-document.entity';
import { ProviderEmail } from '@app/modules/shared/domain/entities/provider-email.entity';
import { ProviderPhone } from '@app/modules/shared/domain/entities/provider-phone.entity';
import { ProviderProfile } from '@app/modules/shared/domain/entities/provider-profile.entity';
import { ProviderService } from '@app/modules/shared/domain/entities/provider-service.entity';
import { ProviderVerificationLog } from '@app/modules/shared/domain/entities/provider-verification-log.entity';
import { ProviderVerification } from '@app/modules/shared/domain/entities/provider-verification.entity';
import { ProviderWorkLocation } from '@app/modules/shared/domain/entities/provider-work-location.entity';
import { Review } from '@app/modules/shared/domain/entities/review.entity';
import { ServiceRequest } from '@app/modules/shared/domain/entities/service-request.entity';
import { Service } from '@app/modules/shared/domain/entities/service.entity';
import { UserAddress } from '@app/modules/shared/domain/entities/user-address.entity';
import { UserEmail } from '@app/modules/shared/domain/entities/user-email.entity';
import { UserPhone } from '@app/modules/shared/domain/entities/user-phone.entity';
import { User } from '@app/modules/shared/domain/entities/user.entity';
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
    BenchmarkUUIDv7Entity,
    BenchmarkNanoidEntity,
    BenchmarkSnowflakeEntity,
    BenchmarkUUIDv4Entity,
  ],
  migrations,
  migrationsRun: true,
});

export default PostgresDataSource;
