import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { closeApp, createApp } from '../helpers/create-app.helper';

describe('Categories Controller (e2e)', () => {
  let app: NestFastifyApplication;
  const NON_EXISTENT_UUID = faker.string.uuid();

  beforeAll(async () => {
    app = await createApp();
  }, 60000);

  afterAll(async () => {
    await closeApp(app);
  });

  // ── GET /categories ───────────────────────────────────────────────────────

  describe('GET /categories', () => {
    it('should return 200 and an array', async () => {
      const response = await app.inject({ method: 'GET', url: '/categories' });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toBeInstanceOf(Array);
    });
  });

  // ── POST /categories ──────────────────────────────────────────────────────

  describe('POST /categories', () => {
    it('should create a category and return 201', async () => {
      const slug = faker.helpers.slugify(faker.word.noun()).toLowerCase();
      const response = await app.inject({
        method: 'POST',
        url: '/categories',
        payload: { name: faker.word.noun(), slug },
      });
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body.slug).toBe(slug);
    });

    it('should return 400 when name is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/categories',
        payload: { slug: 'valid-slug' },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when slug is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/categories',
        payload: { name: 'Valid Name' },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should return 409 when slug is duplicated', async () => {
      const slug = `duplicate-${faker.string.alphanumeric(6).toLowerCase()}`;
      await app.inject({
        method: 'POST',
        url: '/categories',
        payload: { name: 'First', slug },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/categories',
        payload: { name: 'Second', slug },
      });
      expect([409, 400]).toContain(response.statusCode);
    });
  });

  // ── GET /categories/:id ───────────────────────────────────────────────────

  describe('GET /categories/:id', () => {
    it('should return 404 for non-existent category', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/categories/${NON_EXISTENT_UUID}`,
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return category by ID', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/categories',
        payload: {
          name: faker.word.noun(),
          slug: faker.helpers.slugify(faker.word.noun()).toLowerCase() + faker.string.alphanumeric(4),
        },
      });
      const created = JSON.parse(createRes.body);

      const response = await app.inject({
        method: 'GET',
        url: `/categories/${created.id}`,
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).id).toBe(created.id);
    });
  });

  // ── PUT /categories/:id ───────────────────────────────────────────────────

  describe('PUT /categories/:id', () => {
    it('should return 404 for non-existent category', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/categories/${NON_EXISTENT_UUID}`,
        payload: { name: 'Updated' },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should update category name', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/categories',
        payload: {
          name: 'Old Name',
          slug: `update-test-${faker.string.alphanumeric(6).toLowerCase()}`,
        },
      });
      const created = JSON.parse(createRes.body);

      const response = await app.inject({
        method: 'PUT',
        url: `/categories/${created.id}`,
        payload: { name: 'New Name' },
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).name).toBe('New Name');
    });
  });

  // ── DELETE /categories/:id ────────────────────────────────────────────────

  describe('DELETE /categories/:id', () => {
    it('should return 404 for non-existent category', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/categories/${NON_EXISTENT_UUID}`,
      });
      expect(response.statusCode).toBe(404);
    });

    it('should soft delete category and return 204', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/categories',
        payload: {
          name: faker.word.noun(),
          slug: `delete-test-${faker.string.alphanumeric(6).toLowerCase()}`,
        },
      });
      const created = JSON.parse(createRes.body);

      const response = await app.inject({
        method: 'DELETE',
        url: `/categories/${created.id}`,
      });
      expect(response.statusCode).toBe(204);
    });
  });
});
