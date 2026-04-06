import multipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';

import { LOGGER_PROVIDER } from '@adatechnology/logger';

import { AppModule } from '../../../src/app.module';

export const mockLogProvider = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

export async function createApp(): Promise<NestFastifyApplication> {
  const moduleFixture = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(LOGGER_PROVIDER)
    .useValue(mockLogProvider)
    .compile();

  const app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  await app.register(multipart, { limits: { fileSize: 52428800 } });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
      forbidNonWhitelisted: false,
      transform: true,
      whitelist: true,
      skipMissingProperties: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();
  return app;
}

export async function closeApp(app: NestFastifyApplication): Promise<void> {
  try {
    await app.close();
  } catch (error) {
    if ((error as Error).message?.includes('DataSource')) {
      // Expected TypeORM cleanup issue with MONGO_URI
    } else {
      throw error;
    }
  }
}
