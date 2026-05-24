import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { UserDocument } from '@modules/shared/providers/database/entities/user-document.entity';

export interface CheckDocumentExistsParams {
  document: string;
}

export const CHECK_DOCUMENT_EXISTS_LOG_MESSAGES = {
  START_FLOW: 'Starting check document exists flow',
  DOCUMENT_FOUND: 'Document already registered',
  SUCCESS: 'Document is available',
} as const;

@Injectable()
export class CheckDocumentExistsUseCase {
  @TraceMethod()
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @InjectRepository(UserDocument, CONNECTIONS_NAMES.POSTGRES)
    private readonly userDocumentRepository: Repository<UserDocument>,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: CheckDocumentExistsParams): Promise<void> {
    this.logProvider.info({
      message: CHECK_DOCUMENT_EXISTS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { document: params.document },
    });

    const normalized = params.document.replace(/\D/g, '');

    const userDocument = await this.userDocumentRepository.findOne({
      where: { documentNumber: normalized },
    });

    if (userDocument) {
      this.logProvider.warn({
        message: CHECK_DOCUMENT_EXISTS_LOG_MESSAGES.DOCUMENT_FOUND,
        context: this.logContext,
        meta: { document: params.document, existingId: userDocument.id },
      });
      throw new ConflictException('Documento já está cadastrado');
    }

    this.logProvider.info({
      message: CHECK_DOCUMENT_EXISTS_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { document: params.document },
    });
  }
}
