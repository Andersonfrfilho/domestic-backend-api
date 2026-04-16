import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Service } from '@app/modules/shared/providers/database/entities/service.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const SERVICE_NAMES: Record<string, string[]> = {
  limpeza: ['Faxina Completa', 'Limpeza Pós-Obra', 'Higienização de Sofá', 'Limpeza de Vidros'],
  encanamento: ['Desentupimento', 'Troca de Torneira', 'Reparo de Cano', 'Instalação de Chuveiro'],
  eletricidade: ['Instalação de Tomada', 'Troca de Disjuntor', 'Reparo Elétrico', 'Instalação de Luminária'],
  jardinagem: ['Corte de Grama', 'Poda de Árvores', 'Paisagismo', 'Irrigação'],
  pintura: ['Pintura Interna', 'Pintura Externa', 'Pintura de Portão', 'Textura Decorativa'],
  reformas: ['Reforma de Banheiro', 'Reforma de Cozinha', 'Quebra de Parede', 'Assentamento de Piso'],
  mudanca: ['Mudança Residencial', 'Mudança Comercial', 'Transporte de Móveis', 'Embalagem e Organização'],
  'montagem-moveis': ['Montagem de Guarda-Roupa', 'Montagem de Cozinha', 'Montagem de Escritório', 'Desmontagem'],
  'ar-condicionado': ['Instalação de Split', 'Limpeza de Ar-Condicionado', 'Manutenção Preventiva', 'Recarga de Gás'],
  dedetizacao: ['Dedetização Geral', 'Controle de Baratas', 'Controle de Ratos', 'Descupinização'],
  pets: ['Banho e Tosa', 'Dog Walker', 'Hotel para Pets', 'Veterinário a Domicílio'],
  informatica: ['Formatação de PC', 'Instalação de Software', 'Configuração de Rede', 'Recuperação de Dados'],
};

export async function seedServices(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(Service);

  const entities: Service[] = [];

  for (const category of ctx.categories) {
    const predefined = SERVICE_NAMES[category.slug] ?? [];

    for (let i = 0; i < cfg.servicesPerCategory; i++) {
      const name = predefined[i] ?? `${category.name} - Serviço ${i + 1}`;
      entities.push(
        repo.create({
          categoryId: category.id,
          name,
          description: faker.lorem.sentence(),
        }),
      );
    }
  }

  ctx.services = await repo.save(entities);
}
