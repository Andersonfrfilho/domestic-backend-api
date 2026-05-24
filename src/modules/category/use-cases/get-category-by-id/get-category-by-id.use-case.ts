import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { Inject, Injectable } from '@nestjs/common';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { type CategoryRepositoryInterface } from '../../category.repository.interface';
import { CATEGORY_REPOSITORY_PROVIDE } from '../../category.token';
import { CategoryErrorFactory } from '../../factories/category.error.factory';

import { GET_CATEGORY_BY_ID_LOG_MESSAGES } from './get-category-by-id.constants';
import {
  GetCategoryByIdUseCaseInterface,
  GetCategoryByIdUseCaseParams,
  GetCategoryByIdUseCaseResponse,
} from './get-category-by-id.interface';

@Injectable()
export class GetCategoryByIdUseCase implements GetCategoryByIdUseCaseInterface {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(CATEGORY_REPOSITORY_PROVIDE)
    private readonly categoryRepository: CategoryRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: GetCategoryByIdUseCaseParams): Promise<GetCategoryByIdUseCaseResponse> {
    this.logProvider.info({
      message: GET_CATEGORY_BY_ID_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { categoryId: params.id },
    });

    const category = await this.categoryRepository.findById(params.id);
    if (!category) {
      this.logProvider.warn({
        message: GET_CATEGORY_BY_ID_LOG_MESSAGES.CATEGORY_NOT_FOUND,
        context: this.logContext,
        meta: { categoryId: params.id },
      });
      throw CategoryErrorFactory.notFound(params.id);
    }

    this.logProvider.info({
      message: GET_CATEGORY_BY_ID_LOG_MESSAGES.CATEGORY_FOUND,
      context: this.logContext,
      meta: { categoryId: category.id, slug: category.slug },
    });

    return category;
  }
}
