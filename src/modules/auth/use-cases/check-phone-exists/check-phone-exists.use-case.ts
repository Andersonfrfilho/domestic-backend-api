import { ConflictException, Injectable } from '@nestjs/common';
import type { PhoneRepositoryInterface } from '@modules/phone/phone.repository.interface';

export interface CheckPhoneExistsParams {
  phone: string;
}

@Injectable()
export class CheckPhoneExistsUseCase {
  constructor(
    private readonly phoneRepository: PhoneRepositoryInterface,
  ) {}

  async execute(params: CheckPhoneExistsParams): Promise<void> {
    const phone = await this.phoneRepository.findByNumber(params.phone);
    if (phone) {
      throw new ConflictException('Telefone já está cadastrado');
    }
  }
}
