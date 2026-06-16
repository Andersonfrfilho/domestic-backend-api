export const ACCEPT_SERVICE_REQUEST_LOG_MESSAGES = {
  START_FLOW: 'Starting accept service request flow',
  SUCCESS: 'Service request accepted successfully',
  NOT_FOUND: 'Service request not found',
  NOT_AUTHORIZED: 'Provider not authorized to accept this request',
  INVALID_STATUS: 'Invalid service request status for acceptance',
  QUEUE_ERROR: 'Failed to publish service_request.accepted event',
} as const;
