import type { AccountBlockReason } from '../get-status/get-status.interface';

export interface ListAccountBlocksParams {
  onlyActive?: boolean;
}

export interface ListAccountBlocksItem {
  id: string;
  userId: string;
  reason: AccountBlockReason;
  message: string | null;
  blockedAt: Date;
  resolvedAt: Date | null;
  canRetryAt: Date | null;
}

export interface ListAccountBlocksResult {
  blocks: ListAccountBlocksItem[];
  total: number;
}

export interface ListAccountBlocksUseCaseInterface {
  execute(params: ListAccountBlocksParams): Promise<ListAccountBlocksResult>;
}
