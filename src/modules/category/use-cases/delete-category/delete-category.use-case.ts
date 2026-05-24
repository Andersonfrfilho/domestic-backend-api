import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { type CategoryRepositoryInterface } from '../../category.repository.interface';
import { CATEGORY_REPOSITORY_PROVIDE } from '../../category.token';
import { CategoryErrorFactory } from '../../factories/category.error.factory';

import { DELETE_CATEGORY_LOG_MESSAGES } from './delete-category.constants';
import {
  DeleteCategoryUseCaseInterface,
  DeleteCategoryUseCaseParams,
} from './delete-category.interface';

const CACHE_KEY = 'api:categories';

@Injectable()
export class DeleteCategoryUseCase implements DeleteCategoryUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(CATEGORY_REPOSITORY_PROVIDE)
    private readonly categoryRepository: CategoryRepositoryInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: DeleteCategoryUseCaseParams): Promise<void> {
    this.logProvider.info({
      message: DELETE_CATEGORY_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { categoryId: params.id },
    });

    const existing = await this.categoryRepository.findById(params.id);
    if (!existing) {
      this.logProvider.warn({
        message: DELETE_CATEGORY_LOG_MESSAGES.CATEGORY_NOT_FOUND,
        context: this.logContext,
        meta: { categoryId: params.id },
      });
      throw CategoryErrorFactory.notFound(params.id);
    }

    await this.categoryRepository.deactivate(params.id);
    await this.cacheProvider.del({ key: CACHE_KEY }).catch(() => null);

    this.logProvider.info({
      message: DELETE_CATEGORY_LOG_MESSAGES.DELETED_SUCCESS,
      context: this.logContext,
      meta: { categoryId: params.id, slug: existing.slug },
    });
  }
}
