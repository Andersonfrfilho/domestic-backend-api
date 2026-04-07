export type HealthPayload = {
  status: 'ok' | 'fail' | 'unknown' | string;
  info: Record<string, any>;
  error: Record<string, any>;
  details: Record<string, any>;
};

export type TimeoutParams = {
  ms: number;
  message?: string;
};

export type GetHealthResult = HealthPayload;
