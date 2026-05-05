import { CONFIG_ERROR_CONFIGS } from '@modules/error/configs';
import { BaseErrorFactory } from '@modules/error/factories/base.error.factory';

export class ConfigErrorFactory extends BaseErrorFactory {
  static invalidConfiguration(details?: string) {
    return this.createBusinessLogic(CONFIG_ERROR_CONFIGS.invalidConfiguration(details));
  }
}
