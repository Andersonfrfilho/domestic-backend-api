export interface ResolveAccountBlockParams {
  blockId: string;
  resolvedBy: string;
}

export interface ResolveAccountBlockResult {
  id: string;
  resolvedAt: Date;
}

export interface ResolveAccountBlockUseCaseInterface {
  execute(params: ResolveAccountBlockParams): Promise<ResolveAccountBlockResult>;
}
