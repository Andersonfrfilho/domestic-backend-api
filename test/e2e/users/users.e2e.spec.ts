import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { closeApp, createApp } from '../helpers/create-app.helper';

describe('Users Controller (e2e)', () => {
  let app: NestFastifyApplication;
  const NON_EXISTENT_UUID = faker.string.uuid();

  beforeAll(async () => {
    app = await createApp();
  }, 60000);

  afterAll(async () => {
    await closeApp(app);
  });

  // ── POST /users ──────────────────────────────────────────────────────────

  describe('POST /users', () => {
    it('should create a user and return 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: {
          fullName: faker.person.fullName(),
          keycloakId: faker.string.uuid(),
          status: 'ACTIVE',
        },
      });
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('fullName');
    });

    it('should return 400 when fullName is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { keycloakId: faker.string.uuid() },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should create user without optional fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { fullName: faker.person.fullName() },
      });
      expect(response.statusCode).toBe(201);
    });
  });

  // ── GET /users/me ─────────────────────────────────────────────────────────

  describe('GET /users/me', () => {
    it('should return 404 when X-User-Id header points to non-existent user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/me',
        headers: { 'x-user-id': faker.string.uuid() },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return user when X-User-Id header matches existing keycloakId', async () => {
      const keycloakId = faker.string.uuid();
      await app.inject({
        method: 'POST',
        url: '/users',
        payload: { fullName: faker.person.fullName(), keycloakId },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/users/me',
        headers: { 'x-user-id': keycloakId },
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.keycloakId).toBe(keycloakId);
    });
  });

  // ── GET /users/:id ────────────────────────────────────────────────────────

  describe('GET /users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/users/${NON_EXISTENT_UUID}`,
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return user by ID', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { fullName: faker.person.fullName(), keycloakId: faker.string.uuid() },
      });
      const created = JSON.parse(createRes.body);

      const response = await app.inject({
        method: 'GET',
        url: `/users/${created.id}`,
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).id).toBe(created.id);
    });
  });

  // ── PUT /users/:id ────────────────────────────────────────────────────────

  describe('PUT /users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/users/${NON_EXISTENT_UUID}`,
        payload: { fullName: faker.person.fullName() },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should update user and return updated data', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { fullName: 'Original Name', keycloakId: faker.string.uuid() },
      });
      const created = JSON.parse(createRes.body);
      const newName = faker.person.fullName();

      const response = await app.inject({
        method: 'PUT',
        url: `/users/${created.id}`,
        payload: { fullName: newName },
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).fullName).toBe(newName);
    });
  });

  // ── DELETE /users/:id ─────────────────────────────────────────────────────

  describe('DELETE /users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/users/${NON_EXISTENT_UUID}`,
      });
      expect(response.statusCode).toBe(404);
    });

    it('should soft delete user and return 204', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { fullName: faker.person.fullName(), keycloakId: faker.string.uuid() },
      });
      const created = JSON.parse(createRes.body);

      const response = await app.inject({
        method: 'DELETE',
        url: `/users/${created.id}`,
      });
      expect(response.statusCode).toBe(204);
    });
  });

  // ── GET /users/admin/stats ────────────────────────────────────────────────

  describe('GET /users/admin/stats', () => {
    it('should return user stats', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/admin/stats',
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('totalUsers');
    });
  });

  // ── GET /users/me/addresses ───────────────────────────────────────────────

  describe('GET /users/me/addresses', () => {
    it('should return 404 when user not found via keycloakId', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/me/addresses',
        headers: { 'x-user-id': faker.string.uuid() },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return empty addresses list for existing user', async () => {
      const keycloakId = faker.string.uuid();
      await app.inject({
        method: 'POST',
        url: '/users',
        payload: { fullName: faker.person.fullName(), keycloakId },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/users/me/addresses',
        headers: { 'x-user-id': keycloakId },
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual([]);
    });
  });

  // ── POST /users/me/addresses ──────────────────────────────────────────────

  describe('POST /users/me/addresses', () => {
    it('should add address to existing user', async () => {
      const keycloakId = faker.string.uuid();
      await app.inject({
        method: 'POST',
        url: '/users',
        payload: { fullName: faker.person.fullName(), keycloakId },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/users/me/addresses',
        headers: { 'x-user-id': keycloakId },
        payload: {
          street: faker.location.street(),
          number: faker.location.buildingNumber(),
          neighborhood: 'Centro',
          city: faker.location.city(),
          state: 'SP',
          zipCode: '01310100',
        },
      });
      expect([200, 201]).toContain(response.statusCode);
    });

    it('should return 404 when user not found', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users/me/addresses',
        headers: { 'x-user-id': faker.string.uuid() },
        payload: {
          street: faker.location.street(),
          number: '100',
          neighborhood: 'Centro',
          city: faker.location.city(),
          state: 'SP',
          zipCode: '01310100',
        },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  // ── DELETE /users/me/addresses/:addressId ────────────────────────────────

  describe('DELETE /users/me/addresses/:addressId', () => {
    it('should remove address from user and return 204', async () => {
      const keycloakId = faker.string.uuid();
      await app.inject({
        method: 'POST',
        url: '/users',
        payload: { fullName: faker.person.fullName(), keycloakId },
      });

      const addRes = await app.inject({
        method: 'POST',
        url: '/users/me/addresses',
        headers: { 'x-user-id': keycloakId },
        payload: {
          street: faker.location.street(),
          number: '100',
          neighborhood: 'Centro',
          city: faker.location.city(),
          state: 'SP',
          zipCode: '01310100',
        },
      });
      const address = JSON.parse(addRes.body);

      const response = await app.inject({
        method: 'DELETE',
        url: `/users/me/addresses/${address.id}`,
        headers: { 'x-user-id': keycloakId },
      });
      expect(response.statusCode).toBe(204);
    });

    it('should return 404 for non-existent address', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/users/me/addresses/${NON_EXISTENT_UUID}`,
        headers: { 'x-user-id': faker.string.uuid() },
      });
      expect(response.statusCode).toBe(404);
    });
  });
});
