import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';
import { Inject, Injectable } from '@nestjs/common';

import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

import { CategoryRepository } from '../../repositories/category.repository';

import type { GetCategoriesResult, GetCategoriesUseCaseInterface } from './types';

export const GET_CATEGORIES_LOG_MESSAGES = {
  START_FLOW: 'Starting get categories flow',
  SUCCESS: 'Categories retrieved successfully',
} as const;

@Injectable()
export class GetCategoriesUseCase implements GetCategoriesUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  @TraceMethod()
  async execute(): Promise<GetCategoriesResult> {
    this.logProvider.info({
      message: GET_CATEGORIES_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
    });

    try {
      const categories = await this.categoryRepository.findAllActive();

      this.logProvider.info({
        message: GET_CATEGORIES_LOG_MESSAGES.SUCCESS,
        context: this.logContext,
        meta: { count: categories.length },
      });

      return {
        success: true,
        data: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          iconUrl: cat.iconUrl,
        })),
      };
    } catch (error) {
      this.logProvider.error({
        message: 'Failed to get categories',
        context: this.logContext,
        meta: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }
}
