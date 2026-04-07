export type TimeoutParams = {
  ms: number;
  message?: string;
};

export type CheckResult = {
  status: string;
  details?: Record<string, unknown>;
};

export type HealthPayload = {
  status: 'ok' | 'fail' | 'unknown' | string;
  info: Record<string, any>;
  error: Record<string, any>;
  details: Record<string, any>;
};

export type GetHealthResult = HealthPayload;
