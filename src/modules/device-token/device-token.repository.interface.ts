export interface DeviceTokenRepositoryInterface {
  upsert(params: { userId: string; token: string; platform: string }): Promise<void>;
  findTokensByUserIds(userIds: string[]): Promise<Map<string, string>>;
}
