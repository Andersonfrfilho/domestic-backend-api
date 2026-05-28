/**
 * RabbitMQ Queue Configuration
 * Centralized exchange, queue, and routing key definitions
 * Used by both API (producer) and Worker (consumer)
 */

export const RABBITMQ_EXCHANGE = 'zolve.events';
export const RABBITMQ_DLX_EXCHANGE = 'zolve.dlx';

export const RABBITMQ_QUEUES = {
  NOTIFICATIONS: {
    NAME: 'worker.notifications',
    ROUTING_KEYS: {
      EMAIL: 'notifications.email',
      SMS: 'notifications.sms',
      PUSH: 'notifications.push',
    },
  },
  PROVIDER_APPROVAL: {
    NAME: 'worker.provider.approval',
    ROUTING_KEYS: {
      APPROVED: 'provider.approved',
      REJECTED: 'provider.rejected',
    },
  },
  RATING: {
    NAME: 'worker.rating',
    ROUTING_KEYS: {
      REVIEW_CREATED: 'review.created',
    },
  },
  SERVICE_REQUESTS: {
    NAME: 'worker.service-requests',
    ROUTING_KEYS: {
      WILDCARD: 'service_request.*',
    },
  },
  DLQ: {
    NAME: 'worker.dlq',
    ROUTING_KEYS: {
      WILDCARD: '',
    },
  },
} as const;
