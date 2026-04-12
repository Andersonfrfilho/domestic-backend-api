import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { closeApp, createApp } from '../helpers/create-app.helper';

describe('Health Controller (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await closeApp(app);
  });

  it('GET /health should return 200', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(response.statusCode).toBe(200);
  });

  it('GET /health should return JSON content type', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(response.headers['content-type']).toMatch(/json/);
  });

  it('GET /health should have status property', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('status');
    expect(body.status).toBe(true);
  });

  it('PUT /health should return 404', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/health',
    });
    expect(response.statusCode).toBe(404);
  });

  it('POST /health should return 404', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/health',
    });
    expect(response.statusCode).toBe(404);
  });

  it('DELETE /health should return 404', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/health',
    });
    expect(response.statusCode).toBe(404);
  });
});
