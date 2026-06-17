import { SERVICE_REQUEST_ERROR_CONFIGS } from '@modules/error/configs';
import { BaseErrorFactory } from '@modules/error/factories';

export class ServiceRequestErrorFactory extends BaseErrorFactory {
  static notFound(id: string) {
    return this.createNotFound(SERVICE_REQUEST_ERROR_CONFIGS.notFound(id));
  }

  static providerNotApproved(providerId: string) {
    return this.createBusinessLogic(SERVICE_REQUEST_ERROR_CONFIGS.providerNotApproved(providerId));
  }

  static invalidStatusTransition(current: string, target: string) {
    return this.createBusinessLogic(
      SERVICE_REQUEST_ERROR_CONFIGS.invalidStatusTransition(current, target),
    );
  }

  static notAuthorized() {
    return this.createBusinessLogic(SERVICE_REQUEST_ERROR_CONFIGS.notAuthorized());
  }

  static selfHiring() {
    return this.createBusinessLogic(SERVICE_REQUEST_ERROR_CONFIGS.selfHiring());
  }

  static timeConflict(providerId: string, scheduledAt: string) {
    return this.createBusinessLogic(
      SERVICE_REQUEST_ERROR_CONFIGS.timeConflict(providerId, scheduledAt),
    );
  }
}
