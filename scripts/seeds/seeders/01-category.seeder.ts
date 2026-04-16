import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Category } from '@app/modules/shared/providers/database/entities/category.entity';

import { SeedConfig } from '../lib/config';
import { SeedContext } from '../lib/context';

const FIXED_CATEGORIES: { name: string; slug: string; iconUrl: string | undefined }[] = [
  { name: 'Limpeza', slug: 'limpeza', iconUrl: 'https://cdn.example.com/icons/limpeza.svg' },
  { name: 'Encanamento', slug: 'encanamento', iconUrl: 'https://cdn.example.com/icons/encanamento.svg' },
  { name: 'Eletricidade', slug: 'eletricidade', iconUrl: 'https://cdn.example.com/icons/eletricidade.svg' },
  { name: 'Jardinagem', slug: 'jardinagem', iconUrl: 'https://cdn.example.com/icons/jardinagem.svg' },
  { name: 'Pintura', slug: 'pintura', iconUrl: 'https://cdn.example.com/icons/pintura.svg' },
  { name: 'Reformas', slug: 'reformas', iconUrl: 'https://cdn.example.com/icons/reformas.svg' },
  { name: 'Mudança', slug: 'mudanca', iconUrl: 'https://cdn.example.com/icons/mudanca.svg' },
  { name: 'Montagem de Móveis', slug: 'montagem-moveis', iconUrl: 'https://cdn.example.com/icons/montagem.svg' },
  { name: 'Ar Condicionado', slug: 'ar-condicionado', iconUrl: 'https://cdn.example.com/icons/ar-condicionado.svg' },
  { name: 'Dedetização', slug: 'dedetizacao', iconUrl: 'https://cdn.example.com/icons/dedetizacao.svg' },
  { name: 'Cuidados com Pets', slug: 'pets', iconUrl: 'https://cdn.example.com/icons/pets.svg' },
  { name: 'Informática', slug: 'informatica', iconUrl: 'https://cdn.example.com/icons/informatica.svg' },
];

export async function seedCategories(ds: DataSource, ctx: SeedContext, cfg: SeedConfig): Promise<void> {
  const repo = ds.getRepository(Category);

  const pool = FIXED_CATEGORIES.slice(0, cfg.categories);
  const extra = cfg.categories - pool.length;

  for (let i = 0; i < extra; i++) {
    const name = faker.commerce.department() + ` ${i + 1}`;
    pool.push({ name, slug: name.toLowerCase().replace(/\s+/g, '-'), iconUrl: undefined });
  }

  const entities = pool.map((c) => repo.create({ ...c, isActive: true }));
  ctx.categories = await repo.save(entities);
}
