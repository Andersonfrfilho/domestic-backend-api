import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { PhoneRepositoryInterface } from '@modules/phone/phone.repository.interface';
import { PHONE_REPOSITORY_PROVIDE } from '@modules/phone/phone.token';

export interface CheckPhoneExistsParams {
  phone: string;
}

@Injectable()
export class CheckPhoneExistsUseCase {
  constructor(
    @Inject(PHONE_REPOSITORY_PROVIDE)
    private readonly phoneRepository: PhoneRepositoryInterface,
  ) {}

  async execute(params: CheckPhoneExistsParams): Promise<void> {
    const phone = await this.phoneRepository.findByNumber(params.phone);
    if (phone) {
      throw new ConflictException('Telefone já está cadastrado');
    }
  }
}
