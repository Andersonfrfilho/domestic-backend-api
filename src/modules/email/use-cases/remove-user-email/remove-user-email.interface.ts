export interface RemoveUserEmailUseCaseParams {
  userId: string;
  userEmailId: string;
}

export interface RemoveUserEmailUseCaseInterface {
  execute(params: RemoveUserEmailUseCaseParams): Promise<void>;
}
