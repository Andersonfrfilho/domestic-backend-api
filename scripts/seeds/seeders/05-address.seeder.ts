import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Address } from '@app/modules/shared/providers/database/entities/address.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

// All 27 Brazilian state capitals with approximate bounding boxes
const BR_CITIES = [
  { city: 'São Paulo',       state: 'SP', latMin: -24,    latMax: -23.3,  lngMin: -46.8,  lngMax: -46.3  },
  { city: 'Rio de Janeiro',  state: 'RJ', latMin: -23.1,  latMax: -22.7,  lngMin: -43.8,  lngMax: -43.1  },
  { city: 'Belo Horizonte',  state: 'MG', latMin: -20,    latMax: -19.8,  lngMin: -44.1,  lngMax: -43.8  },
  { city: 'Curitiba',        state: 'PR', latMin: -25.6,  latMax: -25.3,  lngMin: -49.4,  lngMax: -49.1  },
  { city: 'Porto Alegre',    state: 'RS', latMin: -30.2,  latMax: -29.9,  lngMin: -51.3,  lngMax: -51    },
  { city: 'Salvador',        state: 'BA', latMin: -13,    latMax: -12.7,  lngMin: -38.6,  lngMax: -38.3  },
  { city: 'Goiânia',         state: 'GO', latMin: -16.8,  latMax: -16.5,  lngMin: -49.4,  lngMax: -49.1  },
  { city: 'Recife',          state: 'PE', latMin: -8.15,  latMax: -7.95,  lngMin: -35,    lngMax: -34.8  },
  { city: 'Manaus',          state: 'AM', latMin: -3.15,  latMax: -3.05,  lngMin: -60.05, lngMax: -59.97 },
  { city: 'Belém',           state: 'PA', latMin: -1.5,   latMax: -1.42,  lngMin: -48.54, lngMax: -48.44 },
  { city: 'Fortaleza',       state: 'CE', latMin: -3.8,   latMax: -3.7,   lngMin: -38.58, lngMax: -38.47 },
  { city: 'Brasília',        state: 'DF', latMin: -15.85, latMax: -15.72, lngMin: -47.99, lngMax: -47.86 },
  { city: 'Florianópolis',   state: 'SC', latMin: -27.62, latMax: -27.56, lngMin: -48.58, lngMax: -48.51 },
  { city: 'Campo Grande',    state: 'MS', latMin: -20.5,  latMax: -20.42, lngMin: -54.64, lngMax: -54.56 },
  { city: 'Cuiabá',          state: 'MT', latMin: -15.65, latMax: -15.55, lngMin: -56.12, lngMax: -56.03 },
  { city: 'Vitória',         state: 'ES', latMin: -20.34, latMax: -20.28, lngMin: -40.34, lngMax: -40.28 },
  { city: 'Natal',           state: 'RN', latMin: -5.84,  latMax: -5.76,  lngMin: -35.24, lngMax: -35.17 },
  { city: 'João Pessoa',     state: 'PB', latMin: -7.2,   latMax: -7.1,   lngMin: -34.91, lngMax: -34.83 },
  { city: 'Maceió',          state: 'AL', latMin: -9.73,  latMax: -9.63,  lngMin: -35.75, lngMax: -35.68 },
  { city: 'Aracaju',         state: 'SE', latMin: -10.96, latMax: -10.9,  lngMin: -37.08, lngMax: -37.04 },
  { city: 'Teresina',        state: 'PI', latMin: -5.13,  latMax: -5.05,  lngMin: -42.82, lngMax: -42.74 },
  { city: 'São Luís',        state: 'MA', latMin: -2.6,   latMax: -2.52,  lngMin: -44.35, lngMax: -44.27 },
  { city: 'Macapá',          state: 'AP', latMin:  0.01,  latMax:  0.11,  lngMin: -51.1,  lngMax: -50.98 },
  { city: 'Porto Velho',     state: 'RO', latMin: -8.79,  latMax: -8.73,  lngMin: -63.88, lngMax: -63.83 },
  { city: 'Rio Branco',      state: 'AC', latMin: -9.97,  latMax: -9.9,   lngMin: -67.82, lngMax: -67.78 },
  { city: 'Boa Vista',       state: 'RR', latMin:  2.79,  latMax:  2.87,  lngMin: -60.72, lngMax: -60.65 },
  { city: 'Palmas',          state: 'TO', latMin: -10.22, latMax: -10.14, lngMin: -48.38, lngMax: -48.31 },
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
  'Rua Dom Pedro II', 'Av. Getúlio Vargas', 'Rua Major Facundo',
  'Av. Santos Dumont', 'Rua Voluntários da Pátria', 'Av. Presidente Vargas',
  'Rua Floriano Peixoto', 'Av. Senador Virgílio Távora', 'Rua Irmã Dulce',
  'Av. Lúcio Costa', 'Rua das Acácias', 'Av. das Américas',
  'Rua João Alfredo', 'Av. Epitácio Pessoa', 'Rua Joaquim Nabuco',
];

const BR_NEIGHBORHOODS = [
  'Pinheiros', 'Vila Madalena', 'Jardins', 'Liberdade', 'Moema', 'Itaim Bibi',
  'Copacabana', 'Ipanema', 'Leblon', 'Botafogo', 'Savassi', 'Funcionários',
  'Batel', 'Água Verde', 'Moinhos de Vento', 'Cidade Baixa',
  'Boa Viagem', 'Casa Forte', 'Pelourinho', 'Barra',
  'Adrianópolis', 'São Geraldo', 'Reduto', 'Umarizal',
  'Centro', 'Setor Bueno', 'Setor Marista', 'Jardim Goiás',
  'Asa Norte', 'Asa Sul', 'Lago Sul', 'Lago Norte',
  'Trindade', 'Córrego Grande', 'Itacorubi', 'Campinas',
  'Tirol', 'Petrópolis', 'Lagoa Nova', 'Candelária',
  'Miramar', 'Tambaú', 'Bessa', 'Jardim Oceania',
  'Mangabeiras', 'Farol', 'Cruz das Almas', 'Ponta Verde',
  'Santa Maria', 'Getúlio Vargas', 'Olaria', 'Coruja',
];

export async function seedAddresses(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(Address);

  const providerCount = Math.round(cfg.users * cfg.providersRatio);
  const total = cfg.users * 2 + providerCount;
  const entities: Address[] = [];

  for (let i = 0; i < total; i++) {
    const location = faker.helpers.arrayElement(BR_CITIES);
    const latitude = faker.number.float({ min: location.latMin, max: location.latMax, fractionDigits: 6 }).toString();
    const longitude = faker.number.float({ min: location.lngMin, max: location.lngMax, fractionDigits: 6 }).toString();

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
