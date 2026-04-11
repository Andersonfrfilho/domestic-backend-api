import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { type LogProviderInterface } from '@modules/shared';

import { type DocumentRepositoryInterface } from '../../document.repository.interface';
import { DOCUMENT_REPOSITORY_PROVIDE } from '../../document.token';
import { DocumentErrorFactory } from '../../factories/document.error.factory';

import {
  APPROVE_DOCUMENT_LOG_MESSAGES,
} from './approve-document.constants';
import {
  ApproveDocumentUseCaseInterface,
  ApproveDocumentUseCaseParams,
  ApproveDocumentUseCaseResponse,
} from './approve-document.interface';

@Injectable()
export class ApproveDocumentUseCase implements ApproveDocumentUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(DOCUMENT_REPOSITORY_PROVIDE)
    private readonly documentRepository: DocumentRepositoryInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  async execute(params: ApproveDocumentUseCaseParams): Promise<ApproveDocumentUseCaseResponse> {
    this.logProvider.info({
      message: APPROVE_DOCUMENT_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { ...params },
    });

    const document = await this.documentRepository.findById(params.id);
    if (!document) {
      this.logProvider.warn({
        message: APPROVE_DOCUMENT_LOG_MESSAGES.NOT_FOUND,
        context: this.logContext,
        meta: { id: params.id },
      });
      throw new NotFoundException(APPROVE_DOCUMENT_LOG_MESSAGES.NOT_FOUND);
    }

    if (document.status !== 'PENDING') {
      this.logProvider.warn({
        message: APPROVE_DOCUMENT_LOG_MESSAGES.INVALID_STATUS,
        context: this.logContext,
        meta: { id: params.id, currentStatus: document.status },
      });
      throw DocumentErrorFactory.invalidStatusTransition(document.status, 'APPROVED');
    }

    const result = await this.documentRepository.updateStatus(params.id, 'APPROVED', new Date());

    this.logProvider.info({
      message: APPROVE_DOCUMENT_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { id: params.id },
    });

    return result;
  }
}
