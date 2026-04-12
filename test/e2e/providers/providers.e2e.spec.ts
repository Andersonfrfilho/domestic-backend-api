import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { closeApp, createApp } from '../helpers/create-app.helper';

describe('Providers Controller (e2e)', () => {
  let app: NestFastifyApplication;
  const NON_EXISTENT_UUID = faker.string.uuid();
  let userId: string;
  let providerId: string;
  let serviceId: string;
  let categoryId: string;

  beforeAll(async () => {
    app = await createApp();

    const keycloakId = faker.string.uuid();
    const userRes = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { fullName: faker.person.fullName(), keycloakId },
    });
    userId = JSON.parse(userRes.body).id;
    (global as any).__providerKeycloakId = keycloakId;

    // Create a category + service for add-service tests
    const catRes = await app.inject({
      method: 'POST',
      url: '/categories',
      payload: {
        name: faker.word.noun(),
        slug: `prov-cat-${faker.string.alphanumeric(8).toLowerCase()}`,
      },
    });
    categoryId = JSON.parse(catRes.body).id;

    const svcRes = await app.inject({
      method: 'POST',
      url: '/services',
      payload: { categoryId, name: faker.word.noun() },
    });
    serviceId = JSON.parse(svcRes.body).id;
  }, 60000);

  afterAll(async () => {
    await closeApp(app);
  });

  // ── POST /providers ───────────────────────────────────────────────────────

  describe('POST /providers', () => {
    it('should create a provider profile and return 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/providers',
        payload: {
          userId,
          businessName: faker.company.name(),
          description: faker.lorem.sentence(),
        },
      });
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      providerId = body.id;
    });

    it('should return 400 when userId is not a UUID', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/providers',
        payload: { userId: 'invalid-uuid' },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should return 409 when provider profile already exists for user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/providers',
        payload: { userId },
      });
      expect([409, 400]).toContain(response.statusCode);
    });
  });

  // ── GET /providers ────────────────────────────────────────────────────────

  describe('GET /providers', () => {
    it('should return 200 and an array', async () => {
      const response = await app.inject({ method: 'GET', url: '/providers' });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toBeInstanceOf(Array);
    });
  });

  // ── GET /providers/admin/pending ──────────────────────────────────────────

  describe('GET /providers/admin/pending', () => {
    it('should return 200 and an array', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/providers/admin/pending',
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toBeInstanceOf(Array);
    });
  });

  // ── GET /providers/user/:userId ───────────────────────────────────────────

  describe('GET /providers/user/:userId', () => {
    it('should return 404 for non-existent user ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/providers/user/${NON_EXISTENT_UUID}`,
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return provider by user ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/providers/user/${userId}`,
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).id).toBe(providerId);
    });
  });

  // ── GET /providers/:id ────────────────────────────────────────────────────

  describe('GET /providers/:id', () => {
    it('should return 404 for non-existent provider', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/providers/${NON_EXISTENT_UUID}`,
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return provider by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/providers/${providerId}`,
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).id).toBe(providerId);
    });
  });

  // ── PUT /providers/:id ────────────────────────────────────────────────────

  describe('PUT /providers/:id', () => {
    it('should return 404 for non-existent provider', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/providers/${NON_EXISTENT_UUID}`,
        payload: { businessName: 'Updated' },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should update provider businessName', async () => {
      const newName = faker.company.name();
      const response = await app.inject({
        method: 'PUT',
        url: `/providers/${providerId}`,
        payload: { businessName: newName },
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).businessName).toBe(newName);
    });
  });

  // ── GET /providers/:id/services ───────────────────────────────────────────

  describe('GET /providers/:id/services', () => {
    it('should return empty array initially', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/providers/${providerId}/services`,
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual([]);
    });
  });

  // ── POST /providers/:id/services ──────────────────────────────────────────

  describe('POST /providers/:id/services', () => {
    it('should return 400 when serviceId is not a UUID', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/providers/${providerId}/services`,
        payload: { serviceId: 'not-uuid' },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should add service to provider', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/providers/${providerId}/services`,
        payload: { serviceId },
      });
      expect([200, 201]).toContain(response.statusCode);
    });

    it('should return 409 when service already linked', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/providers/${providerId}/services`,
        payload: { serviceId },
      });
      expect([409, 400]).toContain(response.statusCode);
    });
  });

  // ── DELETE /providers/:id/services/:serviceId ──────────────────────────────

  describe('DELETE /providers/:id/services/:serviceId', () => {
    it('should return 404 when service not linked', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/providers/${providerId}/services/${NON_EXISTENT_UUID}`,
      });
      expect(response.statusCode).toBe(404);
    });

    it('should remove linked service and return 204', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/providers/${providerId}/services/${serviceId}`,
      });
      expect(response.statusCode).toBe(204);
    });
  });

  // ── GET /providers/:id/work-locations ─────────────────────────────────────

  describe('GET /providers/:id/work-locations', () => {
    it('should return empty array initially', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/providers/${providerId}/work-locations`,
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toBeInstanceOf(Array);
    });
  });

  // ── POST /providers/:id/work-locations ────────────────────────────────────

  describe('POST /providers/:id/work-locations', () => {
    it('should return 400 when addressId is not a UUID', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/providers/${providerId}/work-locations`,
        payload: { addressId: 'not-uuid' },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should return 4xx for non-existent addressId', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/providers/${providerId}/work-locations`,
        payload: { addressId: NON_EXISTENT_UUID },
      });
      expect(response.statusCode).toBeGreaterThanOrEqual(400);
      expect(response.statusCode).toBeLessThan(600);
    });

    it('should add work location successfully', async () => {
      // First, create an address for the user
      const keycloakId = (global as any).__providerKeycloakId;
      const addrRes = await app.inject({
        method: 'POST',
        url: '/users/me/addresses',
        headers: { 'x-user-id': keycloakId },
        payload: {
          street: faker.location.street(),
          number: '123',
          neighborhood: 'Centro',
          city: faker.location.city(),
          state: 'SP',
          zipCode: '00000000',
        },
      });
      const addressId = JSON.parse(addrRes.body).id;

      const response = await app.inject({
        method: 'POST',
        url: `/providers/${providerId}/work-locations`,
        payload: { addressId },
      });
      expect([200, 201]).toContain(response.statusCode);
      (global as any).__providerLocationId = JSON.parse(response.body).id;
    });
  });

  // ── DELETE /providers/:id/work-locations/:locationId ──────────────────────

  describe('DELETE /providers/:id/work-locations/:locationId', () => {
    it('should return 404 for non-existent work location', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/providers/${providerId}/work-locations/${NON_EXISTENT_UUID}`,
      });
      expect(response.statusCode).toBe(404);
    });

    it('should remove work location and return 204', async () => {
      const locationId = (global as any).__providerLocationId;
      const response = await app.inject({
        method: 'DELETE',
        url: `/providers/${providerId}/work-locations/${locationId}`,
      });
      expect(response.statusCode).toBe(204);
    });
  });

  // ── POST /providers/:id/verification ──────────────────────────────────────

  describe('POST /providers/:id/verification', () => {
    it('should return 404 for non-existent provider', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/providers/${NON_EXISTENT_UUID}/verification`,
      });
      expect(response.statusCode).toBe(404);
    });

    it('should submit provider for verification', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/providers/${providerId}/verification`,
        headers: { 'x-user-id': faker.string.uuid() },
      });
      expect([200, 201]).toContain(response.statusCode);
    });
  });

  // ── GET /providers/:id/verification ───────────────────────────────────────

  describe('GET /providers/:id/verification', () => {
    it('should return 404 for non-existent provider', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/providers/${NON_EXISTENT_UUID}/verification`,
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return verification status for existing provider', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/providers/${providerId}/verification`,
      });
      expect(response.statusCode).toBe(200);
    });
  });

  // ── PUT /providers/:id/verification/approve ───────────────────────────────

  describe('PUT /providers/:id/verification/approve', () => {
    it('should approve a provider profile', async () => {
      // First ensure it's UNDER_REVIEW
      await app.inject({
        method: 'POST',
        url: `/providers/${providerId}/verification`,
        headers: { 'x-user-id': faker.string.uuid() },
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/providers/${providerId}/verification/approve`,
        headers: { 'x-user-id': faker.string.uuid() }, // Admin ID
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('APPROVED');
    });

    it('should return 404 for non-existent provider', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/providers/${NON_EXISTENT_UUID}/verification/approve`,
        headers: { 'x-user-id': faker.string.uuid() },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  // ── PUT /providers/:id/verification/reject ────────────────────────────────

  describe('PUT /providers/:id/verification/reject', () => {
    it('should reject a provider profile', async () => {
      // Create another provider to reject
      const userRes = await app.inject({
        method: 'POST',
        url: '/users',
        payload: { fullName: faker.person.fullName(), keycloakId: faker.string.uuid() },
      });
      const newUserId = JSON.parse(userRes.body).id;

      const provRes = await app.inject({
        method: 'POST',
        url: '/providers',
        payload: { userId: newUserId, businessName: 'To Be Rejected' },
      });
      const newProvId = JSON.parse(provRes.body).id;

      // Submit for verification
      await app.inject({
        method: 'POST',
        url: `/providers/${newProvId}/verification`,
        headers: { 'x-user-id': faker.string.uuid() },
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/providers/${newProvId}/verification/reject`,
        headers: { 'x-user-id': faker.string.uuid() },
        payload: { reason: 'Invalid documents' },
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('REJECTED');
    });
  });
});
