import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { type LogProviderInterface } from '@modules/shared';
import { type StorageProviderInterface } from '@modules/shared/providers/storage/storage.interface';
import { STORAGE_PROVIDER } from '@modules/shared/providers/storage/storage.token';

import { type DocumentRepositoryInterface } from '../../document.repository.interface';
import { DOCUMENT_REPOSITORY_PROVIDE } from '../../document.token';

import {
  GET_DOCUMENT_URL_LOG_MESSAGES,
} from './get-document-url.constants';
import {
  GetDocumentUrlUseCaseInterface,
  GetDocumentUrlUseCaseParams,
  GetDocumentUrlUseCaseResponse,
} from './get-document-url.interface';

const TTL_SECONDS = 15 * 60; // 15 minutes

@Injectable()
export class GetDocumentUrlUseCase implements GetDocumentUrlUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @Inject(DOCUMENT_REPOSITORY_PROVIDE)
    private readonly documentRepository: DocumentRepositoryInterface,
    @Inject(STORAGE_PROVIDER)
    private readonly storage: StorageProviderInterface,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
    private readonly configService: ConfigService,
  ) {}

  async execute(params: GetDocumentUrlUseCaseParams): Promise<GetDocumentUrlUseCaseResponse> {
    this.logProvider.info({
      message: GET_DOCUMENT_URL_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { ...params },
    });

    const document = await this.documentRepository.findById(params.id);
    if (!document) {
      this.logProvider.warn({
        message: GET_DOCUMENT_URL_LOG_MESSAGES.NOT_FOUND,
        context: this.logContext,
        meta: { id: params.id },
      });
      throw new NotFoundException(GET_DOCUMENT_URL_LOG_MESSAGES.NOT_FOUND);
    }

    const bucket = this.configService.get('STORAGE_MINIO_BUCKET', 'documents');
    const url = await this.storage.getSignedUrl(bucket, document.documentUrl, TTL_SECONDS);

    this.logProvider.info({
      message: GET_DOCUMENT_URL_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { id: params.id },
    });

    return { url, expiresIn: TTL_SECONDS };
  }
}
