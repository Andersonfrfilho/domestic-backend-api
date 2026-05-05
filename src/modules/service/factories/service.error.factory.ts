import { SERVICE_ERROR_CONFIGS } from '@modules/error/configs';
import { BaseErrorFactory } from '@modules/error/factories';

export class ServiceErrorFactory extends BaseErrorFactory {
  static notFound(id: string) {
    return this.createNotFound(SERVICE_ERROR_CONFIGS.notFound(id));
  }

  static categoryNotFound(categoryId: string) {
    return this.createNotFound(SERVICE_ERROR_CONFIGS.categoryNotFound(categoryId));
  }
}
