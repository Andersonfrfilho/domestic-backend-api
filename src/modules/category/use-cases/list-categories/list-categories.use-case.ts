import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { type CategoryRepositoryInterface } from '../../category.repository.interface';
import { CATEGORY_REPOSITORY_PROVIDE } from '../../category.token';

import { LIST_CATEGORIES_LOG_MESSAGES } from './list-categories.constants';
import {
  ListCategoriesUseCaseInterface,
  ListCategoriesUseCaseResponse,
} from './list-categories.interface';

const CACHE_KEY = 'api:categories';
const CACHE_TTL = 300; // 5 minutos

@Injectable()
export class ListCategoriesUseCase implements ListCategoriesUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(CATEGORY_REPOSITORY_PROVIDE)
    private readonly categoryRepository: CategoryRepositoryInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(): Promise<ListCategoriesUseCaseResponse> {
    this.logProvider.info({
      message: LIST_CATEGORIES_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
    });

    const cached = await this.cacheProvider.get<ListCategoriesUseCaseResponse>({ key: CACHE_KEY });
    if (cached) {
      this.logProvider.info({
        message: LIST_CATEGORIES_LOG_MESSAGES.CACHE_HIT,
        context: this.logContext,
        meta: { cacheKey: CACHE_KEY },
      });
      return cached;
    }

    const categories = await this.categoryRepository.listActive();
    await this.cacheProvider.set({ key: CACHE_KEY, value: categories, ttlInSeconds: CACHE_TTL });

    this.logProvider.info({
      message: LIST_CATEGORIES_LOG_MESSAGES.DB_FETCHED,
      context: this.logContext,
      meta: { count: categories.length },
    });

    return categories;
  }
}
