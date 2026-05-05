import { REVIEW_ERROR_CONFIGS } from '@modules/error/configs';
import { BaseErrorFactory } from '@modules/error/factories';

export class ReviewErrorFactory extends BaseErrorFactory {
  static notFound(id: string) {
    return this.createNotFound(REVIEW_ERROR_CONFIGS.notFound(id));
  }

  static alreadyExists(serviceRequestId: string) {
    return this.createConflict(REVIEW_ERROR_CONFIGS.alreadyExists(serviceRequestId));
  }

  static serviceRequestNotCompleted(serviceRequestId: string) {
    return this.createBusinessLogic(
      REVIEW_ERROR_CONFIGS.serviceRequestNotCompleted(serviceRequestId),
    );
  }
}
