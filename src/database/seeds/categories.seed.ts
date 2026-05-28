import { DataSource } from 'typeorm';

import { Category } from '@modules/shared/providers/database/entities/category.entity';

export async function seedCategories(dataSource: DataSource): Promise<void> {
  const categoryRepository = dataSource.getRepository(Category);

  const categoriesData = [
    {
      name: 'Limpeza',
      slug: 'limpeza',
      iconUrl: 'broom',
      isActive: true,
    },
    {
      name: 'Reparos',
      slug: 'reparos',
      iconUrl: 'tools',
      isActive: true,
    },
    {
      name: 'Aulas',
      slug: 'aulas',
      iconUrl: 'book',
      isActive: true,
    },
    {
      name: 'Jardinagem',
      slug: 'jardinagem',
      iconUrl: 'leaf',
      isActive: true,
    },
    {
      name: 'Encanamento',
      slug: 'encanamento',
      iconUrl: 'wrench',
      isActive: true,
    },
    {
      name: 'Eletricidade',
      slug: 'eletricidade',
      iconUrl: 'lightbulb',
      isActive: true,
    },
    {
      name: 'Pinturas',
      slug: 'pinturas',
      iconUrl: 'palette',
      isActive: true,
    },
    {
      name: 'Babá/Cuidador',
      slug: 'baba-cuidador',
      iconUrl: 'person',
      isActive: true,
    },
  ];

  for (const categoryData of categoriesData) {
    const exists = await categoryRepository.findOne({
      where: { slug: categoryData.slug },
    });

    if (!exists) {
      const category = categoryRepository.create(categoryData);
      await categoryRepository.save(category);
      console.log(`✓ Category seeded: ${categoryData.name}`);
    } else {
      console.log(`⊘ Category already exists: ${categoryData.name}`);
    }
  }
}
