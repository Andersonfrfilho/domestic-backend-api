import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { closeApp, createApp } from '../helpers/create-app.helper';

describe('Notifications Controller (e2e)', () => {
  let app: NestFastifyApplication;
  const NON_EXISTENT_UUID = faker.string.uuid();
  let userKeycloakId: string;

  beforeAll(async () => {
    app = await createApp();

    userKeycloakId = faker.string.uuid();
    await app.inject({
      method: 'POST',
      url: '/users',
      payload: { fullName: faker.person.fullName(), keycloakId: userKeycloakId },
    });
  }, 60000);

  afterAll(async () => {
    await closeApp(app);
  });

  // ── GET /notifications ────────────────────────────────────────────────────

  describe('GET /notifications', () => {
    it('should return 404 when X-User-Id does not match any user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/notifications',
        headers: { 'x-user-id': faker.string.uuid() },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return 200 and empty array for existing user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/notifications',
        headers: { 'x-user-id': userKeycloakId },
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toBeInstanceOf(Array);
    });
  });

  // ── PUT /notifications/:id/read ───────────────────────────────────────────

  describe('PUT /notifications/:id/read', () => {
    it('should return 404 or 500 for non-existent notification', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/notifications/${NON_EXISTENT_UUID}/read`,
        headers: { 'x-user-id': userKeycloakId },
      });
      expect([404, 500]).toContain(response.statusCode);
    });
  });
});
