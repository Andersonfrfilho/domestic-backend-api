import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../../../src/app.module';
import { ApiAuthGuard, RolesGuard } from '@adatechnology/auth-keycloak';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

describe('NotificationController (e2e)', () => {
  let app: NestFastifyApplication;
    let mockLogProvider: any;

  let userKeycloakId: string;
  const NON_EXISTENT_UUID = faker.string.uuid();

  beforeAll(async () => {
    mockLogProvider = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LOGGER_PROVIDER)
      .useValue(mockLogProvider)
      .overrideGuard(ApiAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .overrideProvider(AmqpConnection)
      .useValue({
        publish: jest.fn(),
        request: jest.fn(),
        send: jest.fn(),
      })
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    userKeycloakId = faker.string.uuid();

    await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        fullName: faker.person.fullName(),
        keycloakId: userKeycloakId,
      },
    });
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────
  // GET /notifications
  // ─────────────────────────────────────────────

  describe('GET /notifications', () => {
    it('should return 404 when user does not exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/notifications',
        headers: {
          'x-user-id': faker.string.uuid(),
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 200 and empty array when user exists but has no notifications', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/notifications',
        headers: {
          'x-user-id': userKeycloakId,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // PUT /notifications/:id/read
  // ─────────────────────────────────────────────

  describe('PUT /notifications/:id/read', () => {
    it('should return 404 when notification does not exist', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/notifications/${NON_EXISTENT_UUID}/read`,
        headers: {
          'x-user-id': userKeycloakId, // 🔥 importante manter consistência
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});