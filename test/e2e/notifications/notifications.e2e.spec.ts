import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { closeApp, createApp } from '../helpers/create-app.helper';

describe('NotificationController (e2e)', () => {
  let app: NestFastifyApplication;
  let userKeycloakId: string;
  const NON_EXISTENT_UUID = faker.string.uuid();

  beforeAll(async () => {
    app = await createApp();

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
    await closeApp(app);
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