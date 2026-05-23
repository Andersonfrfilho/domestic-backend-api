import { randomUUID } from 'node:crypto';
import { TraceMethod } from '@adatechnology/shared';

import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { type LogProviderInterface } from '@modules/shared';
import { type StorageProviderInterface } from '@modules/shared/providers/storage/storage.interface';
import { STORAGE_PROVIDER } from '@modules/shared/providers/storage/storage.token';

import { type DocumentRepositoryInterface } from '../../document.repository.interface';
import { DOCUMENT_REPOSITORY_PROVIDE } from '../../document.token';

import { UPLOAD_DOCUMENT_LOG_MESSAGES } from './upload-document.constants';
import {
  UploadDocumentUseCaseInterface,
  UploadDocumentUseCaseParams,
  UploadDocumentUseCaseResponse,
} from './upload-document.interface';

@Injectable()
export class UploadDocumentUseCase implements UploadDocumentUseCaseInterface {
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

  @TraceMethod()
  async execute(params: UploadDocumentUseCaseParams): Promise<UploadDocumentUseCaseResponse> {
    this.logProvider.info({
      message: UPLOAD_DOCUMENT_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { ...params, stream: 'OMITTED' },
    });

    const bucket = this.configService.get('STORAGE_MINIO_BUCKET', 'documents');
    const ext = params.filename.split('.').pop() ?? 'bin';
    const objectName = `${params.userId}/${params.documentType}/${randomUUID()}.${ext}`;

    await this.storage.upload({
      bucket,
      objectName,
      stream: params.stream,
      size: params.size,
      contentType: params.mimetype,
    });

    const result = await this.documentRepository.create({
      userId: params.userId,
      documentType: params.documentType,
      documentUrl: objectName,
      status: 'PENDING',
    });

    this.logProvider.info({
      message: UPLOAD_DOCUMENT_LOG_MESSAGES.SUCCESS,
      context: this.logContext,
      meta: { documentId: result.id },
    });

    return result;
  }
}
