import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Company, CompanyStatus } from '@app/modules/shared/providers/database/entities/company.entity';
import { CompanyAddress, CompanyAddressType } from '@app/modules/shared/providers/database/entities/company-address.entity';
import { CompanyEmail, CompanyEmailType } from '@app/modules/shared/providers/database/entities/company-email.entity';
import { CompanyPhone, CompanyPhoneType } from '@app/modules/shared/providers/database/entities/company-phone.entity';
import { CompanyBusinessHours } from '@app/modules/shared/providers/database/entities/company-business-hours.entity';
import { CompanyMember, CompanyMemberRole, CompanyMemberStatus } from '@app/modules/shared/providers/database/entities/company-member.entity';
import { CompanyProvider, CompanyProviderRole, CompanyProviderStatus } from '@app/modules/shared/providers/database/entities/company-provider.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const BR_CITIES = [
  { city: 'São Paulo', state: 'SP', latMin: -24, latMax: -23.3, lngMin: -46.8, lngMax: -46.3 },
  { city: 'Rio de Janeiro', state: 'RJ', latMin: -23.1, latMax: -22.7, lngMin: -43.8, lngMax: -43.1 },
  { city: 'Belo Horizonte', state: 'MG', latMin: -20, latMax: -19.8, lngMin: -44.1, lngMax: -43.8 },
  { city: 'Curitiba', state: 'PR', latMin: -25.6, latMax: -25.3, lngMin: -49.4, lngMax: -49.1 },
  { city: 'Porto Alegre', state: 'RS', latMin: -30.2, latMax: -29.9, lngMin: -51.3, lngMax: -51 },
  { city: 'Salvador', state: 'BA', latMin: -13, latMax: -12.7, lngMin: -38.6, lngMax: -38.3 },
  { city: 'Goiânia', state: 'GO', latMin: -16.8, latMax: -16.5, lngMin: -49.4, lngMax: -49.1 },
  { city: 'Recife', state: 'PE', latMin: -8.15, latMax: -7.95, lngMin: -35, lngMax: -34.8 },
  { city: 'Florianópolis', state: 'SC', latMin: -27.62, latMax: -27.56, lngMin: -48.58, lngMax: -48.51 },
  { city: 'Brasília', state: 'DF', latMin: -15.85, latMax: -15.72, lngMin: -47.99, lngMax: -47.86 },
];

function randomBetween(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(8));
}

function generateCnpj(): string {
  const digits: number[] = [];
  for (let i = 0; i < 12; i++) {
    digits.push(faker.number.int({ min: 0, max: 9 }));
  }
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = digits.reduce((acc, d, i) => acc + d * weights1[i], 0);
  let remainder = sum % 11;
  digits.push(remainder < 2 ? 0 : 11 - remainder);

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = digits.reduce((acc, d, i) => acc + d * weights2[i], 0);
  remainder = sum % 11;
  digits.push(remainder < 2 ? 0 : 11 - remainder);

  const base = digits.slice(0, 8).join('') + digits.slice(8, 12).join('');
  return `${base.slice(0, 2)}.${base.slice(2, 5)}.${base.slice(5, 8)}/${digits.slice(8, 12).join('')}-${digits.slice(12).join('')}`;
}

const COMPANY_SUFFIXES = ['Serviços', 'Soluções', 'Tecnologia', 'Prestação de Serviços', 'Facilities', 'Clean', 'Care', 'Pro'];
const BUSINESS_NAMES = ['Casa', 'Lar', 'Doméstico', 'Premium', 'Master', 'Total', 'Top', 'Max', 'Multi', 'Fast'];

export async function seedCompanies(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const companyCount = Math.max(5, Math.round(cfg.users * 0.05));

  const companies: Company[] = [];
  const companyAddresses: CompanyAddress[] = [];
  const companyEmails: CompanyEmail[] = [];
  const companyPhones: CompanyPhone[] = [];
  const companyBusinessHours: CompanyBusinessHours[] = [];
  const companyMembers: CompanyMember[] = [];
  const companyProviders: CompanyProvider[] = [];

  const companyRepo = ds.getRepository(Company);
  const addressRepo = ds.getRepository(CompanyAddress);
  const emailRepo = ds.getRepository(CompanyEmail);
  const phoneRepo = ds.getRepository(CompanyPhone);
  const hoursRepo = ds.getRepository(CompanyBusinessHours);
  const memberRepo = ds.getRepository(CompanyMember);
  const providerRepo = ds.getRepository(CompanyProvider);

  const usedCnpjs = new Set<string>();

  for (let i = 0; i < companyCount; i++) {
    let cnpj: string;
    do { cnpj = generateCnpj(); } while (usedCnpjs.has(cnpj));
    usedCnpjs.add(cnpj);

    const name = `${faker.helpers.arrayElement(BUSINESS_NAMES)} ${faker.helpers.arrayElement(COMPANY_SUFFIXES)}`;
    const company = companyRepo.create({
      document: cnpj,
      companyName: `${name} LTDA`,
      tradeName: name,
      email: faker.internet.email({ firstName: name.toLowerCase().replace(/\s+/g, '.') }).toLowerCase(),
      phone: `119${faker.string.numeric(8)}`,
      stateRegistration: faker.string.numeric(9),
      municipalRegistration: faker.string.numeric(8),
      status: faker.helpers.weightedArrayElement([
        { weight: 7, value: CompanyStatus.ACTIVE },
        { weight: 2, value: CompanyStatus.PENDING },
        { weight: 1, value: CompanyStatus.INACTIVE },
      ]),
    });
    companies.push(company);
  }

  ctx.companies = await companyRepo.save(companies);

  for (const company of ctx.companies) {
    const location = faker.helpers.arrayElement(BR_CITIES);

    companyAddresses.push(
      addressRepo.create({
        companyId: company.id,
        type: CompanyAddressType.HEADQUARTERS,
        zipCode: `${faker.string.numeric(5)}-${faker.string.numeric(3)}`,
        street: `Av. ${faker.location.street()}`,
        number: faker.location.buildingNumber(),
        complement: faker.helpers.maybe(() => `Sala ${faker.number.int({ min: 1, max: 500 })}`, { probability: 0.4 }) ?? null,
        neighborhood: faker.location.county(),
        city: location.city,
        state: location.state,
        country: 'BR',
        latitude: randomBetween(location.latMin, location.latMax),
        longitude: randomBetween(location.lngMin, location.lngMax),
        isDefault: true,
      }),
    );

    companyEmails.push(
      emailRepo.create({
        companyId: company.id,
        email: company.email,
        type: CompanyEmailType.COMMERCIAL,
        isDefault: true,
        verifiedAt: faker.date.past({ years: 1 }),
      }),
    );

    companyEmails.push(
      emailRepo.create({
        companyId: company.id,
        email: faker.internet.email().toLowerCase(),
        type: CompanyEmailType.BILLING,
        isDefault: false,
        verifiedAt: null,
      }),
    );

    companyPhones.push(
      phoneRepo.create({
        companyId: company.id,
        phone: company.phone,
        type: CompanyPhoneType.MOBILE,
        isDefault: true,
        verifiedAt: faker.date.past({ years: 1 }),
      }),
    );

    companyPhones.push(
      phoneRepo.create({
        companyId: company.id,
        phone: `11${faker.string.numeric(8)}`,
        type: CompanyPhoneType.LANDLINE,
        isDefault: false,
        verifiedAt: null,
      }),
    );

    // Business hours: Mon–Fri 08:00–18:00, Sat 08:00–13:00, Sun closed
    for (let day = 0; day <= 6; day++) {
      const isWeekend = day === 0 || day === 6;
      const isSaturday = day === 6;
      const isOpen = !isWeekend || isSaturday;
      companyBusinessHours.push(
        hoursRepo.create({
          companyId: company.id,
          dayOfWeek: day,
          isOpen,
          openTime: isOpen ? '08:00:00' : null,
          closeTime: isOpen ? (isSaturday ? '13:00:00' : '18:00:00') : null,
        }),
      );
    }
  }

  ctx.companyAddresses = await addressRepo.save(companyAddresses);
  ctx.companyEmails = await emailRepo.save(companyEmails);
  ctx.companyPhones = await phoneRepo.save(companyPhones);
  ctx.companyBusinessHours = await hoursRepo.save(companyBusinessHours);

  // Assign users as company members (1–3 members per company, using users slice)
  const eligibleUsers = ctx.users.slice(4); // skip fixed test users
  let userIndex = 0;

  for (const company of ctx.companies) {
    const memberCount = faker.number.int({ min: 1, max: 3 });
    const roles: CompanyMemberRole[] = [CompanyMemberRole.ADMIN, CompanyMemberRole.PARTNER, CompanyMemberRole.EMPLOYEE];

    for (let m = 0; m < memberCount; m++) {
      const user = eligibleUsers[userIndex % eligibleUsers.length];
      userIndex++;
      if (!user) continue;

      companyMembers.push(
        memberRepo.create({
          companyId: company.id,
          userId: user.id,
          role: m === 0 ? CompanyMemberRole.ADMIN : faker.helpers.arrayElement(roles),
          status: CompanyMemberStatus.ACTIVE,
          joinedAt: faker.date.past({ years: 2 }),
        }),
      );
    }
  }

  ctx.companyMembers = await memberRepo.save(companyMembers);

  // Assign providers to companies (20–40% of providers get assigned)
  const eligibleProviders = ctx.providers.slice(2); // skip fixed test providers
  const providerRoles = [CompanyProviderRole.EMPLOYEE, CompanyProviderRole.FREELANCER, CompanyProviderRole.MANAGER];

  for (const company of ctx.companies) {
    const assignCount = faker.number.int({ min: 2, max: Math.max(2, Math.floor(eligibleProviders.length / ctx.companies.length) + 2) });
    const pickedProviders = faker.helpers.arrayElements(eligibleProviders, Math.min(assignCount, eligibleProviders.length));

    for (const provider of pickedProviders) {
      const alreadyAssigned = companyProviders.some(
        (cp) => cp.companyId === company.id && cp.providerId === provider.userId,
      );
      if (alreadyAssigned) continue;

      const role = faker.helpers.arrayElement(providerRoles);
      companyProviders.push(
        providerRepo.create({
          companyId: company.id,
          providerId: provider.userId,
          role,
          commissionRate: role !== CompanyProviderRole.EMPLOYEE
            ? parseFloat(faker.number.float({ min: 5, max: 30, fractionDigits: 2 }).toFixed(2))
            : null,
          fixedSalary: role === CompanyProviderRole.EMPLOYEE
            ? parseFloat(faker.number.float({ min: 1500, max: 8000, fractionDigits: 2 }).toFixed(2))
            : null,
          status: faker.helpers.weightedArrayElement([
            { weight: 7, value: CompanyProviderStatus.ACTIVE },
            { weight: 2, value: CompanyProviderStatus.PENDING },
            { weight: 1, value: CompanyProviderStatus.INACTIVE },
          ]),
          assignedAt: faker.date.past({ years: 1 }),
        }),
      );
    }
  }

  ctx.companyProviders = await providerRepo.save(companyProviders);
}
