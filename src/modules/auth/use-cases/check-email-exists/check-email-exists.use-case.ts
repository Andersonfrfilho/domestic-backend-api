import { ConflictException, Inject, Injectable } from '@nestjs/common';

import type { EmailRepositoryInterface } from '@modules/email/email.repository.interface';
import { EMAIL_REPOSITORY_PROVIDE } from '@modules/email/email.token';

export interface CheckEmailExistsParams {
  email: string;
}

@Injectable()
export class CheckEmailExistsUseCase {
  constructor(
    @Inject(EMAIL_REPOSITORY_PROVIDE)
    private readonly emailRepository: EmailRepositoryInterface,
  ) {}

  async execute(params: CheckEmailExistsParams): Promise<void> {
    const email = await this.emailRepository.findByEmail(params.email);
    if (email) {
      throw new ConflictException('E-mail já está em uso');
    }
  }
}
