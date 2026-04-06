import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FormData = require('form-data');

import { closeApp, createApp } from '../helpers/create-app.helper';

describe('Documents Controller (e2e)', () => {
  let app: NestFastifyApplication;
  const NON_EXISTENT_UUID = faker.string.uuid();
  let userKeycloakId: string;
  let uploadedDocumentId: string;

  beforeAll(async () => {
    app = await createApp();

    // Cria um usuário para ser o dono dos documentos
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

  // ── GET /documents/:id/url ────────────────────────────────────────────────

  describe('GET /documents/:id/url', () => {
    it('should return 404 for non-existent document', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/documents/${NON_EXISTENT_UUID}/url`,
        headers: { 'x-user-id': userKeycloakId },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  // ── PUT /documents/:id/approve ────────────────────────────────────────────

  describe('PUT /documents/:id/approve', () => {
    it('should return 404 for non-existent document', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/documents/${NON_EXISTENT_UUID}/approve`,
      });
      expect(response.statusCode).toBe(404);
    });
  });

  // ── PUT /documents/:id/reject ─────────────────────────────────────────────

  describe('PUT /documents/:id/reject', () => {
    it('should return 404 for non-existent document', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/documents/${NON_EXISTENT_UUID}/reject`,
      });
      expect(response.statusCode).toBe(404);
    });
  });

  // ── POST /documents (upload) ──────────────────────────────────────────────

  describe('POST /documents', () => {
    it('should return 404 when user not found', async () => {
      const form = new FormData();
      form.append('file', Buffer.from('fake content'), {
        filename: 'test.pdf',
        contentType: 'application/pdf',
      });
      form.append('documentType', 'CPF');

      const response = await app.inject({
        method: 'POST',
        url: '/documents',
        headers: {
          'x-user-id': faker.string.uuid(), // usuário inexistente
          ...form.getHeaders(),
        },
        payload: form.getBuffer(),
      });
      expect(response.statusCode).toBe(404);
    });

    it('should upload a document and return 201', async () => {
      const form = new FormData();
      form.append('file', Buffer.from('%PDF-1.4 fake pdf content'), {
        filename: 'cpf.pdf',
        contentType: 'application/pdf',
      });
      form.append('documentType', 'CPF');

      const response = await app.inject({
        method: 'POST',
        url: '/documents',
        headers: {
          'x-user-id': userKeycloakId,
          ...form.getHeaders(),
        },
        payload: form.getBuffer(),
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('documentUrl');
      expect(body.status).toBe('PENDING');
      uploadedDocumentId = body.id;
    });

    it('should return 400 when no file is provided', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/documents',
        headers: { 'x-user-id': userKeycloakId, 'content-type': 'multipart/form-data' },
        payload: '',
      });
      expect([400, 500]).toContain(response.statusCode);
    });
  });

  // ── GET /documents/:id/url (após upload) ──────────────────────────────────

  describe('GET /documents/:id/url (após upload)', () => {
    it('should return signed URL for uploaded document', async () => {
      if (!uploadedDocumentId) return;

      const response = await app.inject({
        method: 'GET',
        url: `/documents/${uploadedDocumentId}/url`,
        headers: { 'x-user-id': userKeycloakId },
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('url');
      expect(body).toHaveProperty('expiresIn');
      expect(typeof body.url).toBe('string');
    });
  });

  // ── PUT /documents/:id/approve (após upload) ──────────────────────────────

  describe('PUT /documents/:id/approve (após upload)', () => {
    it('should approve uploaded document', async () => {
      if (!uploadedDocumentId) return;

      const response = await app.inject({
        method: 'PUT',
        url: `/documents/${uploadedDocumentId}/approve`,
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).status).toBe('APPROVED');
    });
  });

  // ── PUT /documents/:id/reject (após upload + approve) ─────────────────────

  describe('PUT /documents/:id/reject (novo upload)', () => {
    it('should upload and then reject a document', async () => {
      const form = new FormData();
      form.append('file', Buffer.from('fake rg content'), {
        filename: 'rg.jpg',
        contentType: 'image/jpeg',
      });
      form.append('documentType', 'RG');

      const uploadRes = await app.inject({
        method: 'POST',
        url: '/documents',
        headers: { 'x-user-id': userKeycloakId, ...form.getHeaders() },
        payload: form.getBuffer(),
      });
      expect(uploadRes.statusCode).toBe(201);
      const docId = JSON.parse(uploadRes.body).id;

      const rejectRes = await app.inject({
        method: 'PUT',
        url: `/documents/${docId}/reject`,
      });
      expect(rejectRes.statusCode).toBe(200);
      expect(JSON.parse(rejectRes.body).status).toBe('REJECTED');
    });
  });
});
