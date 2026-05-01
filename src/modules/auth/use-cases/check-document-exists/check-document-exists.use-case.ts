import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { User } from '@modules/shared/providers/database/entities/user.entity';

export interface CheckDocumentExistsParams {
  document: string;
}

@Injectable()
export class CheckDocumentExistsUseCase {
  constructor(
    @InjectRepository(User, CONNECTIONS_NAMES.POSTGRES)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(params: CheckDocumentExistsParams): Promise<void> {
    const normalized = params.document.replace(/\D/g, '');

    const user = await this.userRepository.findOne({
      where: { document: normalized },
    });

    if (user) {
      throw new ConflictException('Documento já está cadastrado');
    }
  }
}
