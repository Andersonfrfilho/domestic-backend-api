export const COMPLETE_SERVICE_REQUEST_LOG_CONTEXT = 'CompleteServiceRequestUseCase.execute';
export const COMPLETE_SERVICE_REQUEST_LOG_MESSAGES = {
  START_FLOW: 'Starting complete service request flow',
  SUCCESS: 'Service request completed successfully',
  NOT_FOUND: 'Service request not found',
  NOT_AUTHORIZED: 'Contractor not authorized to complete this request',
  INVALID_STATUS: 'Invalid service request status for completion',
  QUEUE_ERROR: 'Error sending completion event to queue',
} as const;
