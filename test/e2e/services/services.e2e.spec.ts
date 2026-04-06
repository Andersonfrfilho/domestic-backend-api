import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { closeApp, createApp } from '../helpers/create-app.helper';

describe('Services Controller (e2e)', () => {
  let app: NestFastifyApplication;
  const NON_EXISTENT_UUID = faker.string.uuid();
  let categoryId: string;

  beforeAll(async () => {
    app = await createApp();

    // Create a category to use in service tests
    const res = await app.inject({
      method: 'POST',
      url: '/categories',
      payload: {
        name: faker.word.noun(),
        slug: `svc-cat-${faker.string.alphanumeric(8).toLowerCase()}`,
      },
    });
    categoryId = JSON.parse(res.body).id;
  }, 60000);

  afterAll(async () => {
    await closeApp(app);
  });

  // ── GET /services ─────────────────────────────────────────────────────────

  describe('GET /services', () => {
    it('should return 200 and an array', async () => {
      const response = await app.inject({ method: 'GET', url: '/services' });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toBeInstanceOf(Array);
    });

    it('should filter by categoryId query param', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/services?categoryId=${NON_EXISTENT_UUID}`,
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual([]);
    });
  });

  // ── POST /services ────────────────────────────────────────────────────────

  describe('POST /services', () => {
    it('should create a service and return 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/services',
        payload: {
          categoryId,
          name: faker.word.noun(),
          description: faker.lorem.sentence(),
        },
      });
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body.categoryId).toBe(categoryId);
    });

    it('should return 400 when categoryId is not a UUID', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/services',
        payload: { categoryId: 'not-a-uuid', name: 'Test' },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when name is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/services',
        payload: { categoryId },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should return 404 when category does not exist', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/services',
        payload: { categoryId: NON_EXISTENT_UUID, name: 'Test Service' },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  // ── GET /services/:id ─────────────────────────────────────────────────────

  describe('GET /services/:id', () => {
    it('should return 404 for non-existent service', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/services/${NON_EXISTENT_UUID}`,
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return service by ID', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/services',
        payload: { categoryId, name: faker.word.noun() },
      });
      const created = JSON.parse(createRes.body);

      const response = await app.inject({
        method: 'GET',
        url: `/services/${created.id}`,
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).id).toBe(created.id);
    });
  });

  // ── PUT /services/:id ─────────────────────────────────────────────────────

  describe('PUT /services/:id', () => {
    it('should return 404 for non-existent service', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/services/${NON_EXISTENT_UUID}`,
        payload: { name: 'Updated Name' },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should update service name', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/services',
        payload: { categoryId, name: 'Old Service Name' },
      });
      const created = JSON.parse(createRes.body);

      const response = await app.inject({
        method: 'PUT',
        url: `/services/${created.id}`,
        payload: { name: 'New Service Name' },
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).name).toBe('New Service Name');
    });
  });
});
