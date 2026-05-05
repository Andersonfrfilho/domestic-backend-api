import './instrumentation';

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import multipart from '@fastify/multipart';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule } from '@nestjs/swagger';
import { register as tsConfigPathsRegister } from 'tsconfig-paths';

import { swaggerCustomOptions } from '@config/swagger-custom.config';
import { swaggerConfig } from '@config/swagger.config';
import { AppErrorFactory } from '@modules/error';
import { docsFactory } from '@modules/shared/docs/docs.factory';

import * as tsConfig from '../tsconfig.json';

import { AppModule } from './app.module';
import { EnvironmentProviderInterface } from './config';
import { ENVIRONMENT_SERVICE_PROVIDER } from './config/config.token';

const compilerOptions = tsConfig.compilerOptions;
tsConfigPathsRegister({
  baseUrl: compilerOptions.baseUrl,
  paths: compilerOptions.paths,
});

async function bootstrap() {
  const instanceFastify = new FastifyAdapter({
    bodyLimit: 52428800, // 50MB — permite upload de documentos
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, instanceFastify);

  // Suporte a upload de arquivos via multipart
  await app.register(multipart, { limits: { fileSize: 52428800 } });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
      forbidNonWhitelisted: false,
      transform: true,
      whitelist: true,
      skipMissingProperties: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => AppErrorFactory.fromValidationErrors(errors),
    }),
  );

  const environment = app.get<EnvironmentProviderInterface>(ENVIRONMENT_SERVICE_PROVIDER);

  // Skip Swagger setup for worker (PORT 3002) to speed up initialization
  if (process.env.PORT !== '3002') {
    const document = SwaggerModule.createDocument(app, swaggerConfig(environment));
    SwaggerModule.setup('docs', app, document, swaggerCustomOptions(environment));
    const outputPath = join(process.cwd(), 'swagger-spec.json');
    writeFileSync(outputPath, JSON.stringify(document, null, 2));
    docsFactory({ app, document });
  }

  const port = process.env.PORT ?? 3333;
  await app.listen(port, '0.0.0.0');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
