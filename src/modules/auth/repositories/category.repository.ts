import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '@modules/shared/providers/database/entities/category.entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category, 'postgres')
    private readonly repository: Repository<Category>,
  ) {}

  async findAllActive(): Promise<Category[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.repository.findOne({
      where: { id, isActive: true },
    });
  }
}
