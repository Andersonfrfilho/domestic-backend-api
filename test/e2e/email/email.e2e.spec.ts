import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { closeApp, createApp } from '../helpers/create-app.helper';

describe('Email Controller (e2e)', () => {
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

  // ── GET /users/me/emails ─────────────────────────────────────────────────

  describe('GET /users/me/emails', () => {
    it('should return 200 and an empty array for new user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/me/emails',
        headers: { 'x-user-id': keycloakId },
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual([]);
    });
  });

  // ── POST /users/me/emails ────────────────────────────────────────────────

  describe('POST /users/me/emails', () => {
    it('should add a new email and return 201', async () => {
      const email = faker.internet.email().toLowerCase();
      const response = await app.inject({
        method: 'POST',
        url: '/users/me/emails',
        headers: { 'x-user-id': keycloakId },
        payload: { email },
      });
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body.email.address).toBe(email);
    });

    it('should return 400 when email is invalid', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users/me/emails',
        headers: { 'x-user-id': keycloakId },
        payload: { email: 'invalid-email' },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should return 409 when email is duplicated for the user', async () => {
      const email = faker.internet.email().toLowerCase();
      await app.inject({
        method: 'POST',
        url: '/users/me/emails',
        headers: { 'x-user-id': keycloakId },
        payload: { email },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/users/me/emails',
        headers: { 'x-user-id': keycloakId },
        payload: { email },
      });
      expect(response.statusCode).toBe(409);
    });
  });

  // ── DELETE /users/me/emails/:id ──────────────────────────────────────────

  describe('DELETE /users/me/emails/:userEmailId', () => {
    it('should return 404 for non-existent userEmailId', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/users/me/emails/${NON_EXISTENT_UUID}`,
        headers: { 'x-user-id': keycloakId },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should remove email and return 204', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/users/me/emails',
        headers: { 'x-user-id': keycloakId },
        payload: { email: faker.internet.email().toLowerCase() },
      });
      const created = JSON.parse(createRes.body);

      const response = await app.inject({
        method: 'DELETE',
        url: `/users/me/emails/${created.id}`,
        headers: { 'x-user-id': keycloakId },
      });
      expect(response.statusCode).toBe(204);
    });
  });

  // ── POST /users/me/emails/:id/send-verification ──────────────────────────

  describe('POST /users/me/emails/:userEmailId/send-verification', () => {
    it('should send verification code and return 204', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/users/me/emails',
        headers: { 'x-user-id': keycloakId },
        payload: { email: faker.internet.email().toLowerCase() },
      });
      const created = JSON.parse(createRes.body);

      const response = await app.inject({
        method: 'POST',
        url: `/users/me/emails/${created.id}/send-verification`,
        headers: { 'x-user-id': keycloakId },
      });
      expect(response.statusCode).toBe(204);
    });
  });

  // ── POST /users/me/emails/:id/verify ─────────────────────────────────────

  describe('POST /users/me/emails/:userEmailId/verify', () => {
    it('should verify email and return 200 with dev code 0000', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/users/me/emails',
        headers: { 'x-user-id': keycloakId },
        payload: { email: faker.internet.email().toLowerCase() },
      });
      const created = JSON.parse(createRes.body);

      // Send code first
      await app.inject({
        method: 'POST',
        url: `/users/me/emails/${created.id}/send-verification`,
        headers: { 'x-user-id': keycloakId },
      });

      const response = await app.inject({
        method: 'POST',
        url: `/users/me/emails/${created.id}/verify`,
        headers: { 'x-user-id': keycloakId },
        payload: { code: '0000' },
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.email.isVerified).toBe(true);
    });

    it('should return 400 for invalid code', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/users/me/emails',
        headers: { 'x-user-id': keycloakId },
        payload: { email: faker.internet.email().toLowerCase() },
      });
      const created = JSON.parse(createRes.body);

      const response = await app.inject({
        method: 'POST',
        url: `/users/me/emails/${created.id}/verify`,
        headers: { 'x-user-id': keycloakId },
        payload: { code: 'wrong' },
      });
      expect(response.statusCode).toBe(400);
    });
  });
});
