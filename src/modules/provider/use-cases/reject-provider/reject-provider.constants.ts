export const REJECT_PROVIDER_LOG_MESSAGES = {
  START_FLOW: 'Starting reject provider flow',
  PROVIDER_NOT_FOUND: 'Provider not found for rejection',
  VERIFICATION_NOT_FOUND: 'Verification record not found for rejection',
  INVALID_STATUS: 'Rejection aborted: verification not under review',
  REJECTED_SUCCESS: 'Provider rejected successfully',
  EVENT_PUBLISHED: 'Provider rejected event published to queue',
  EVENT_PUBLISH_FAILED: 'Failed to publish provider rejected event',
} as const;
