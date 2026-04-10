import { User } from '@modules/shared/providers/database/entities/user.entity';

export interface RestoreUserUseCaseParams {
  id: string;
}

export interface RestoreUserUseCaseInterface {
  execute(params: RestoreUserUseCaseParams): Promise<User>;
}
