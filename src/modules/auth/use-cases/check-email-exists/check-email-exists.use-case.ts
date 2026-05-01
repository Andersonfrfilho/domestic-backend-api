import { ConflictException, Injectable } from '@nestjs/common';
import type { EmailRepositoryInterface } from '@modules/email/email.repository.interface';

export interface CheckEmailExistsParams {
  email: string;
}

@Injectable()
export class CheckEmailExistsUseCase {
  constructor(
    private readonly emailRepository: EmailRepositoryInterface,
  ) {}

  async execute(params: CheckEmailExistsParams): Promise<void> {
    const email = await this.emailRepository.findByEmail(params.email);
    if (email) {
      throw new ConflictException('E-mail já está em uso');
    }
  }
}
