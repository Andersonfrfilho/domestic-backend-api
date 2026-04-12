import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { closeApp, createApp } from '../helpers/create-app.helper';

describe('Phone Controller (e2e)', () => {
  let app: NestFastifyApplication;
  let keycloakId: string;
  const NON_EXISTENT_UUID = faker.string.uuid();

  beforeAll(async () => {
    app = await createApp();

    // Create a user
    keycloakId = faker.string.uuid();
    await app.inject({
      method: 'POST',
      url: '/users',
      payload: { fullName: faker.person.fullName(), keycloakId },
    });
  }, 60000);

  afterAll(async () => {
    await closeApp(app);
  });

  // ── GET /users/me/phones ─────────────────────────────────────────────────

  describe('GET /users/me/phones', () => {
    it('should return 200 and an empty array for new user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/me/phones',
        headers: { 'x-user-id': keycloakId },
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual([]);
    });
  });

  // ── POST /users/me/phones ────────────────────────────────────────────────

  describe('POST /users/me/phones', () => {
    it('should add a new phone and return 201', async () => {
      const number = faker.phone.number({ style: 'international' });
      const response = await app.inject({
        method: 'POST',
        url: '/users/me/phones',
        headers: { 'x-user-id': keycloakId },
        payload: { number, type: 'MOBILE' },
      });
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      // Some formatting might happen in the service, but at least check if it exists
      expect(body.phone).toHaveProperty('number');
    });

    it('should return 400 when type is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users/me/phones',
        headers: { 'x-user-id': keycloakId },
        payload: { number: faker.phone.number() },
      });
      expect(response.statusCode).toBe(400);
    });
  });

  // ── DELETE /users/me/phones/:id ──────────────────────────────────────────

  describe('DELETE /users/me/phones/:userPhoneId', () => {
    it('should return 404 for non-existent userPhoneId', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/users/me/phones/${NON_EXISTENT_UUID}`,
        headers: { 'x-user-id': keycloakId },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should remove phone and return 204', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/users/me/phones',
        headers: { 'x-user-id': keycloakId },
        payload: { number: faker.phone.number(), type: 'HOME' },
      });
      const created = JSON.parse(createRes.body);

      const response = await app.inject({
        method: 'DELETE',
        url: `/users/me/phones/${created.id}`,
        headers: { 'x-user-id': keycloakId },
      });
      expect(response.statusCode).toBe(204);
    });
  });

  // ── POST /users/me/phones/:id/send-verification ──────────────────────────

  describe('POST /users/me/phones/:userPhoneId/send-verification', () => {
    it('should send verification code and return 204', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/users/me/phones',
        headers: { 'x-user-id': keycloakId },
        payload: { number: faker.phone.number(), type: 'MOBILE' },
      });
      const created = JSON.parse(createRes.body);

      const response = await app.inject({
        method: 'POST',
        url: `/users/me/phones/${created.id}/send-verification`,
        headers: { 'x-user-id': keycloakId },
      });
      expect(response.statusCode).toBe(204);
    });
  });

  // ── POST /users/me/phones/:id/verify ─────────────────────────────────────

  describe('POST /users/me/phones/:userPhoneId/verify', () => {
    it('should verify phone and return 200 with dev code 0000', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/users/me/phones',
        headers: { 'x-user-id': keycloakId },
        payload: { number: faker.phone.number(), type: 'MOBILE' },
      });
      const created = JSON.parse(createRes.body);

      // Send code first
      await app.inject({
        method: 'POST',
        url: `/users/me/phones/${created.id}/send-verification`,
        headers: { 'x-user-id': keycloakId },
      });

      const response = await app.inject({
        method: 'POST',
        url: `/users/me/phones/${created.id}/verify`,
        headers: { 'x-user-id': keycloakId },
        payload: { code: '0000' },
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.phone.isVerified).toBe(true);
    });
  });
});
