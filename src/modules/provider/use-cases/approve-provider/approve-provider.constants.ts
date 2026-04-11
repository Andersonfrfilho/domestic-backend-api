
export const APPROVE_PROVIDER_LOG_MESSAGES = {
  START_FLOW: 'Starting approve provider flow',
  PROVIDER_NOT_FOUND: 'Provider not found for approval',
  VERIFICATION_NOT_FOUND: 'Verification record not found for approval',
  INVALID_STATUS: 'Approval aborted: verification not under review',
  APPROVED_SUCCESS: 'Provider approved successfully',
  EVENT_PUBLISHED: 'Provider approved event published to queue',
  EVENT_PUBLISH_FAILED: 'Failed to publish provider approved event',
} as const;
