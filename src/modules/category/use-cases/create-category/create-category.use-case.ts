import type { CacheProviderInterface } from '@adatechnology/nestjs-cache';
import { CACHE_PROVIDER } from '@adatechnology/nestjs-cache';
import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { type CategoryRepositoryInterface } from '../../category.repository.interface';
import { CATEGORY_REPOSITORY_PROVIDE } from '../../category.token';
import { CategoryErrorFactory } from '../../factories/category.error.factory';

import { CREATE_CATEGORY_LOG_MESSAGES } from './create-category.constants';
import {
  CreateCategoryUseCaseInterface,
  CreateCategoryUseCaseParams,
  CreateCategoryUseCaseResponse,
} from './create-category.interface';

const CACHE_KEY = 'api:categories';

@Injectable()
export class CreateCategoryUseCase implements CreateCategoryUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(CATEGORY_REPOSITORY_PROVIDE)
    private readonly categoryRepository: CategoryRepositoryInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: CreateCategoryUseCaseParams): Promise<CreateCategoryUseCaseResponse> {
    this.logProvider.info({
      message: CREATE_CATEGORY_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { slug: params.slug, name: params.name },
    });

    const existing = await this.categoryRepository.findBySlug(params.slug);
    if (existing) {
      this.logProvider.warn({
        message: CREATE_CATEGORY_LOG_MESSAGES.DUPLICATE_SLUG,
        context: this.logContext,
        meta: { slug: params.slug },
      });
      throw CategoryErrorFactory.duplicateSlug(params.slug);
    }

    const category = await this.categoryRepository.create(params);
    await this.cacheProvider.del({ key: CACHE_KEY }).catch(() => null);

    this.logProvider.info({
      message: CREATE_CATEGORY_LOG_MESSAGES.CREATED_SUCCESS,
      context: this.logContext,
      meta: { categoryId: category.id, slug: category.slug },
    });

    return category;
  }
}
