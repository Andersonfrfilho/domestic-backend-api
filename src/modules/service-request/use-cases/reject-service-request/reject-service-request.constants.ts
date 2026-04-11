export const REJECT_SERVICE_REQUEST_LOG_MESSAGES = {
  START_FLOW: 'Starting reject service request flow',
  SUCCESS: 'Service request rejected successfully',
  NOT_FOUND: 'Service request not found',
  NOT_AUTHORIZED: 'Provider not authorized to reject this request',
  INVALID_STATUS: 'Invalid service request status for rejection',
} as const;
