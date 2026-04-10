export const CREATE_REVIEW_LOG_CONTEXT = 'CreateReviewUseCase.execute';
export const CREATE_REVIEW_LOG_MESSAGES = {
  START_FLOW: 'Starting create review flow',
  SUCCESS: 'Review created successfully',
  SERVICE_REQUEST_NOT_COMPLETED: 'Service request not completed or not found',
  ALREADY_EXISTS: 'Review already exists for this service request',
} as const;
