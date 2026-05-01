import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Address } from '@app/modules/shared/providers/database/entities/address.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const BR_CITIES = [
  { city: 'São Paulo', state: 'SP', latMin: -24.0, latMax: -23.3, lngMin: -46.8, lngMax: -46.3 },
  { city: 'Rio de Janeiro', state: 'RJ', latMin: -23.1, latMax: -22.7, lngMin: -43.8, lngMax: -43.1 },
  { city: 'Belo Horizonte', state: 'MG', latMin: -20.0, latMax: -19.8, lngMin: -44.1, lngMax: -43.8 },
  { city: 'Curitiba', state: 'PR', latMin: -25.6, latMax: -25.3, lngMin: -49.4, lngMax: -49.1 },
  { city: 'Porto Alegre', state: 'RS', latMin: -30.2, latMax: -29.9, lngMin: -51.3, lngMax: -51.0 },
  { city: 'Salvador', state: 'BA', latMin: -13.0, latMax: -12.7, lngMin: -38.6, lngMax: -38.3 },
  { city: 'Goiânia', state: 'GO', latMin: -16.8, latMax: -16.5, lngMin: -49.4, lngMax: -49.1 },
  { city: 'Recife', state: 'PE', latMin: -8.15, latMax: -7.95, lngMin: -35.0, lngMax: -34.8 },
];

const BR_STREETS = [
  'Rua Augusta', 'Av. Paulista', 'Rua Oscar Freire', 'Rua da Consolação',
  'Av. Brasil', 'Rua Copacabana', 'Av. Atlântica', 'Rua do Ouvidor',
  'Av. Afonso Pena', 'Rua da Bahia', 'Av. do Contorno', 'Rua Pernambuco',
  'Rua XV de Novembro', 'Av. Cândido de Abreu', 'Rua Marechal Deodoro',
  'Av. Ipiranga', 'Rua dos Andradas', 'Av. Borges de Medeiros',
  'Av. Independência', 'Rua da Praia', 'Av. Beira Mar', 'Rua Barão do Rio Branco',
  'Av. Sete de Setembro', 'Rua Chile', 'Largo do Pelourinho',
  'Av. Paralela', 'Rua das Laranjeiras', 'Av. T-9',
];

const BR_NEIGHBORHOODS = [
  'Pinheiros', 'Vila Madalena', 'Jardins', 'Liberdade', 'Moema', 'Itaim Bibi',
  'Copacabana', 'Ipanema', 'Leblon', 'Botafogo', 'Savassi', 'Funcionários',
  'Batel', 'Água Verde', 'Moinhos de Vento', 'Cidade Baixa',
  'Boa Viagem', 'Casa Forte', 'Pelourinho', 'Barra',
];

export async function seedAddresses(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(Address);

  const providerCount = Math.round(cfg.users * cfg.providersRatio);
  const total = cfg.users * 2 + providerCount;
  const entities: Address[] = [];

  for (let i = 0; i < total; i++) {
    const location = faker.helpers.arrayElement(BR_CITIES);
    const latitude = faker.number.float({ min: location.latMin, max: location.latMax, precision: 0.000001 }).toString();
    const longitude = faker.number.float({ min: location.lngMin, max: location.lngMax, precision: 0.000001 }).toString();

    entities.push(
      repo.create({
        street: faker.helpers.arrayElement(BR_STREETS),
        number: faker.number.int({ min: 1, max: 9999 }).toString(),
        complement: faker.datatype.boolean({ probability: 0.4 }) ? `Apto ${faker.number.int({ min: 1, max: 200 })}` : undefined,
        neighborhood: faker.helpers.arrayElement(BR_NEIGHBORHOODS),
        city: location.city,
        state: location.state,
        zipCode: faker.string.numeric({ length: 8, allowLeadingZeros: true }),
        latitude,
        longitude,
        isVerified: faker.datatype.boolean({ probability: 0.5 }),
      }),
    );
  }

  ctx.addresses = await repo.save(entities);
}
