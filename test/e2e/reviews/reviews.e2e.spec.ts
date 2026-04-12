import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { closeApp, createApp } from '../helpers/create-app.helper';

describe('Reviews Controller (e2e)', () => {
  let app: NestFastifyApplication;
  const NON_EXISTENT_UUID = faker.string.uuid();
  let contractorKeycloakId: string;

  let serviceRequestId: string;
  let providerId: string;

  beforeAll(async () => {
    app = await createApp();

    // 1. Create contractor
    contractorKeycloakId = faker.string.uuid();
    const contractorRes = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { fullName: faker.person.fullName(), keycloakId: contractorKeycloakId },
    });
    const contractorId = JSON.parse(contractorRes.body).id;

    // 2. Add address to contractor
    const addrRes = await app.inject({
      method: 'POST',
      url: '/users/me/addresses',
      headers: { 'x-user-id': contractorKeycloakId },
      payload: {
        street: 'Avenida Paulista',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310100',
      },
    });
    const addressId = JSON.parse(addrRes.body).id;

    // 3. Create provider
    const providerKeycloakId = faker.string.uuid();
    const providerUserRes = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { fullName: faker.person.fullName(), keycloakId: providerKeycloakId },
    });
    const providerUserId = JSON.parse(providerUserRes.body).id;

    const providerProfileRes = await app.inject({
      method: 'POST',
      url: '/providers',
      payload: { userId: providerUserId, businessName: faker.company.name() },
    });
    providerId = JSON.parse(providerProfileRes.body).id;

    // Approve provider
    await app.inject({
      method: 'POST',
      url: `/providers/${providerId}/verification`,
      headers: { 'x-user-id': providerKeycloakId },
    });
    await app.inject({
      method: 'PUT',
      url: `/providers/${providerId}/verification/approve`,
      headers: { 'x-user-id': faker.string.uuid() },
    });

    // 4. Create category & service
    const catRes = await app.inject({
      method: 'POST',
      url: '/categories',
      payload: { name: faker.word.noun(), slug: `rev-cat-${faker.string.alphanumeric(8).toLowerCase()}` },
    });
    const catId = JSON.parse(catRes.body).id;

    const svcRes = await app.inject({
      method: 'POST',
      url: '/services',
      payload: { categoryId: catId, name: faker.word.noun() },
    });
    const serviceId = JSON.parse(svcRes.body).id;

    // 5. Create Service Request
    const srRes = await app.inject({
      method: 'POST',
      url: '/service-requests',
      headers: { 'x-user-id': contractorKeycloakId },
      payload: { providerId, serviceId, addressId, scheduledAt: new Date(Date.now() + 86400000).toISOString() },
    });
    serviceRequestId = JSON.parse(srRes.body).id;

    // Accept SR
    await app.inject({
      method: 'PUT',
      url: `/service-requests/${serviceRequestId}/accept`,
      headers: { 'x-user-id': providerKeycloakId },
    });

    // Complete SR
    await app.inject({
      method: 'PUT',
      url: `/service-requests/${serviceRequestId}/complete`,
      headers: { 'x-user-id': contractorKeycloakId },
    });

  }, 90000);

  afterAll(async () => {
    await closeApp(app);
  });

  // ── GET /reviews/provider/:providerId ─────────────────────────────────────

  describe('GET /reviews/provider/:providerId', () => {
    it('should return 200 and empty array for non-existent provider', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/reviews/provider/${NON_EXISTENT_UUID}`,
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual([]);
    });
  });

  // ── POST /reviews ─────────────────────────────────────────────────────────

  describe('POST /reviews', () => {
    it('should return 400 when required fields are missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/reviews',
        headers: { 'x-user-id': contractorKeycloakId },
        payload: {},
      });
      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when serviceRequestId is not a UUID', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/reviews',
        headers: { 'x-user-id': contractorKeycloakId },
        payload: { serviceRequestId: 'not-uuid', rating: 5 },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when rating is out of range', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/reviews',
        headers: { 'x-user-id': contractorKeycloakId },
        payload: { serviceRequestId: NON_EXISTENT_UUID, rating: 6 },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when rating is below minimum', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/reviews',
        headers: { 'x-user-id': contractorKeycloakId },
        payload: { serviceRequestId: NON_EXISTENT_UUID, rating: 0 },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should return 4xx when service request does not exist', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/reviews',
        headers: { 'x-user-id': contractorKeycloakId },
        payload: { serviceRequestId: NON_EXISTENT_UUID, rating: 4, comment: 'Great!' },
      });
      expect(response.statusCode).toBeGreaterThanOrEqual(400);
      expect(response.statusCode).toBeLessThan(500);
    });

    it('should create a review successfully and return 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/reviews',
        headers: { 'x-user-id': contractorKeycloakId },
        payload: { serviceRequestId, rating: 5, comment: 'Excellent service!' },
      });
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body.rating).toBe(5);
    });
  });
});
