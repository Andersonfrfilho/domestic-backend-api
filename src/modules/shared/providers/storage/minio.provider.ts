import { Readable } from 'stream';

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { LOGGER_PROVIDER } from '@adatechnology/nestjs-logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { StorageProviderInterface, UploadFileParams } from './storage.interface';

@Injectable()
export class MinioStorageProvider implements StorageProviderInterface, OnModuleInit {
  private client: Client;

  constructor(
    @Inject(LOGGER_PROVIDER) private readonly logProvider: LogProviderInterface,
    private readonly configService: ConfigService,
  ) {
    this.client = new Client({
      endPoint: configService.get('STORAGE_MINIO_ENDPOINT', 'localhost'),
      port: configService.get<number>('STORAGE_MINIO_PORT', 9000),
      useSSL: configService.get<boolean>('STORAGE_MINIO_USE_SSL', false),
      accessKey: configService.get('STORAGE_MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: configService.get('STORAGE_MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    const bucket = this.configService.get('STORAGE_MINIO_BUCKET', 'documents');
    try {
      await this.ensureBucket(bucket);
      this.logProvider.info({
        message: `MinIO conectado — bucket "${bucket}" pronto`,
        context: `${this.constructor.name}.onModuleInit`,
      });
    } catch (err) {
      // MinIO indisponível não impede o boot da aplicação.
      // Uploads falharão individualmente até o MinIO estar no ar.
      this.logProvider.warn({
        message: `MinIO indisponível no startup — uploads desabilitados até reconexão: ${(err as Error).message}`,
        context: `${this.constructor.name}.onModuleInit`,
      });
    }
  }

  async upload(params: UploadFileParams): Promise<string> {
    await this.client.putObject(params.bucket, params.objectName, params.stream, params.size, {
      'Content-Type': params.contentType,
    });
    return params.objectName;
  }

  async getSignedUrl(bucket: string, objectName: string, expirySeconds: number): Promise<string> {
    return this.client.presignedGetObject(bucket, objectName, expirySeconds);
  }

  async delete(bucket: string, objectName: string): Promise<void> {
    await this.client.removeObject(bucket, objectName);
  }

  async ensureBucket(bucket: string): Promise<void> {
    const exists = await this.client.bucketExists(bucket);
    if (!exists) {
      await this.client.makeBucket(bucket, 'us-east-1');
    }
  }
}
