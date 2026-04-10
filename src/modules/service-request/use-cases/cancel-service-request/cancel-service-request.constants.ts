export const CANCEL_SERVICE_REQUEST_LOG_CONTEXT = 'CancelServiceRequestUseCase.execute';
export const CANCEL_SERVICE_REQUEST_LOG_MESSAGES = {
  START_FLOW: 'Starting cancel service request flow',
  SUCCESS: 'Service request cancelled successfully',
  NOT_FOUND: 'Service request not found',
  NOT_AUTHORIZED: 'Contractor not authorized to cancel this request',
  INVALID_STATUS: 'Invalid service request status for cancellation',
} as const;
