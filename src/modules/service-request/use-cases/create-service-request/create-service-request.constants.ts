export const CREATE_SERVICE_REQUEST_LOG_MESSAGES = {
  START_FLOW: 'Starting create service request flow',
  SUCCESS: 'Service request created successfully',
  PROVIDER_NOT_APPROVED: 'Provider not approved for service requests',
  SELF_HIRING_ATTEMPT: 'Provider attempted to create a service request for their own services',
  TIME_CONFLICT: 'Provider already has an accepted service request overlapping this time slot',
  QUEUE_ERROR: 'Error sending creation event to queue',
} as const;
