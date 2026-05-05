import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { UserDocument } from '@modules/shared/providers/database/entities/user-document.entity';

export interface CheckDocumentExistsParams {
  document: string;
}

@Injectable()
export class CheckDocumentExistsUseCase {
  constructor(
    @InjectRepository(UserDocument, CONNECTIONS_NAMES.POSTGRES)
    private readonly userDocumentRepository: Repository<UserDocument>,
  ) {}

  async execute(params: CheckDocumentExistsParams): Promise<void> {
    const normalized = params.document.replace(/\D/g, '');

    const userDocument = await this.userDocumentRepository.findOne({
      where: { documentNumber: normalized },
    });

    if (userDocument) {
      throw new ConflictException('Documento já está cadastrado');
    }
  }
}
