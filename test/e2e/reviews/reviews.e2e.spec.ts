import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { closeApp, createApp } from '../helpers/create-app.helper';

describe('Reviews Controller (e2e)', () => {
  let app: NestFastifyApplication;
  const NON_EXISTENT_UUID = faker.string.uuid();
  let contractorKeycloakId: string;

  beforeAll(async () => {
    app = await createApp();

    contractorKeycloakId = faker.string.uuid();
    await app.inject({
      method: 'POST',
      url: '/users',
      payload: { fullName: faker.person.fullName(), keycloakId: contractorKeycloakId },
    });
  }, 60000);

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
  });
});
