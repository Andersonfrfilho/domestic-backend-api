import { NotFoundErrorConfig, BusinessLogicErrorConfig } from './error-config.interface';

export const SERVICE_REQUEST_ERROR_CONFIGS = {
  notFound: (id?: string): NotFoundErrorConfig => ({
    message: 'Service request not found',
    code: 'SERVICE_REQUEST_NOT_FOUND',
    details: { id },
  }),
  providerNotApproved: (providerId: string): BusinessLogicErrorConfig => ({
    message: 'Provider is not approved to receive service requests',
    code: 'SERVICE_REQUEST_PROVIDER_NOT_APPROVED',
    details: { providerId },
  }),
  invalidStatusTransition: (current: string, target: string): BusinessLogicErrorConfig => ({
    message: `Cannot transition service request from ${current} to ${target}`,
    code: 'SERVICE_REQUEST_INVALID_STATUS_TRANSITION',
    details: { current, target },
  }),
  notAuthorized: (): BusinessLogicErrorConfig => ({
    message: 'Not authorized to perform this action on the service request',
    code: 'SERVICE_REQUEST_NOT_AUTHORIZED',
    details: {},
  }),
  selfHiring: (): BusinessLogicErrorConfig => ({
    message: 'A provider cannot create a service request targeting their own services',
    code: 'SERVICE_REQUEST_SELF_HIRING_NOT_ALLOWED',
    details: {},
  }),
  timeConflict: (providerId: string, scheduledAt: string): BusinessLogicErrorConfig => ({
    message: 'Provider already has an accepted service request overlapping this time slot',
    code: 'SERVICE_REQUEST_PROVIDER_TIME_CONFLICT',
    details: { providerId, scheduledAt },
  }),
};
