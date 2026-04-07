export const ROLES = {
  USER: {
    MANAGER: 'user-manager',
  },
  SERVICE: {
    MANAGER: 'manage-services',
  },
  REQUEST: {
    MANAGER: 'manage-requests',
  },
  REVIEW: {
    MANAGER: 'manage-reviews',
  },
  NOTIFICATION: {
    SENDER: 'send-notifications',
  },
  DOCUMENT: {
    VERIFIER: 'document-verifier',
  },
} as const;
