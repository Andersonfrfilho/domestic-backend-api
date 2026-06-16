export type TokenParams =
  | { username: string; password: string }
  | { grantType: 'refresh_token'; refreshToken: string };

export type TokenResult = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
};
