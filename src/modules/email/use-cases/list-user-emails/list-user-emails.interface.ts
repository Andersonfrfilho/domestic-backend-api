import { UserEmail } from '@modules/shared/providers/database/entities/user-email.entity';

export interface ListUserEmailsUseCaseParams {
  userId: string;
}

export type ListUserEmailsUseCaseResponse = UserEmail[];

export interface ListUserEmailsUseCaseInterface {
  execute(params: ListUserEmailsUseCaseParams): Promise<ListUserEmailsUseCaseResponse>;
}
