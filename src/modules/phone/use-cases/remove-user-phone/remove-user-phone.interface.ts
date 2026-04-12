export interface RemoveUserPhoneUseCaseParams {
  userId: string;
  userPhoneId: string;
}

export interface RemoveUserPhoneUseCaseInterface {
  execute(params: RemoveUserPhoneUseCaseParams): Promise<void>;
}
