export type AccountBlockReason =
  | 'EMAIL_CONFLICT'
  | 'PHONE_CONFLICT'
  | 'DOCUMENT_CONFLICT'
  | 'FRAUD_SUSPICION'
  | 'TERMS_VIOLATION'
  | 'MANUAL_BLOCK'
  | 'VERIFICATION_FAILED'
  | 'ACCOUNT_DISABLED';

export interface BlockAction {
  type: 'contact_support' | 'retry' | 'logout' | 'go_to_login' | 'dismiss';
  label: string;
  url?: string | null;
  route?: string | null;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface AccountBlockStatus {
  blocked: boolean;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING' | 'SUSPENDED';
  reason: AccountBlockReason | null;
  message: string | null;
  title: string | null;
  icon: string | null;
  severity: 'error' | 'warning' | 'info' | null;
  actions: BlockAction[];
  canRetryAt: string | null;
}

export interface GetAccountBlockStatusParams {
  userId: string;
}

export interface GetAccountBlockStatusUseCaseInterface {
  execute(params: GetAccountBlockStatusParams): Promise<AccountBlockStatus>;
}
