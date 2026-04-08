#!/usr/bin/env node
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// Script with explicit function tests (no runtime MD parsing).
// Each function returns { name, curl, expectedStatus?, expectedBody? }

function stripPipes(curl) {
  return curl.split('|')[0].trim();
}

function runCurlRaw(curlCmd, timeout = 20000) {
  return new Promise((resolve) => {
    let sanitized = stripPipes(curlCmd);
    // Auto-inject Authorization and X-User-Id headers if not present and env vars exist
    try {
      if (ACCESS_TOKEN && !/authorization:/i.test(sanitized)) {
        sanitized += ` -H "Authorization: Bearer ${ACCESS_TOKEN}"`;
      }
      if (KEYCLOAK_ID && !/x-user-id:/i.test(sanitized)) {
        sanitized += ` -H "X-User-Id: ${KEYCLOAK_ID}"`;
      }
    } catch (e) {
      // ignore regex issues
    }
    const wrapped = `${sanitized} -s -o - -w "__HTTP_STATUS__%{http_code}"`;
    exec(wrapped, { timeout }, (err, stdout, stderr) => {
      if (err && err.killed)
        return resolve({ error: 'timeout', stdout: null, stderr: String(stderr || err) });
      const out = stdout || '';
      const marker = '__HTTP_STATUS__';
      const idx = out.lastIndexOf(marker);
      let status = null;
      let body = out;
      if (idx !== -1) {
        status = Number(out.slice(idx + marker.length).trim());
        body = out.slice(0, idx);
      } else {
        // fallback: try to capture any trailing 3-digit code in stdout
        const m2 = (out || '').match(/(\d{3})\s*$/);
        if (m2) status = Number(m2[1]);
      }
      let parsed = null;
      try {
        parsed = body ? JSON.parse(body) : null;
      } catch (e) {
        /* not json */
      }
      resolve({ status, body: body.trim(), json: parsed, stderr: stderr && stderr.trim() });
    });
  });
}

function isSubset(expected, actual) {
  if (expected === null || expected === undefined) return true;
  if (typeof expected !== typeof actual) return false;
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return false;
    if (expected.length !== actual.length) return false;
    for (let i = 0; i < expected.length; i++) if (!isSubset(expected[i], actual[i])) return false;
    return true;
  }
  if (typeof expected === 'object') {
    for (const k of Object.keys(expected)) {
      if (!(k in actual)) return false;
      if (!isSubset(expected[k], actual[k])) return false;
    }
    return true;
  }
  return expected === actual;
}

const BASE = process.env.BASE || 'http://localhost:3333/v1';
const BASE_NOPATH = (process.env.BASE || 'http://localhost:3333').replace(/\/$/, '');
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';
const KEYCLOAK_ID = process.env.KEYCLOAK_ID || '';

// Runtime warning to help diagnostics when running protected flows
if (!ACCESS_TOKEN || !KEYCLOAK_ID) {
  console.warn(
    '⚠️  ACCESS_TOKEN or KEYCLOAK_ID not set. Protected endpoints and lookup flows may fail.',
  );
  console.warn(
    '   Set ACCESS_TOKEN and KEYCLOAK_ID in your environment before running flow tests.',
  );
}

// --- GENERATED test functions (converted from docs/API_CURLS.md) ---

function t_health_get() {
  return {
    name: 'GET /health',
    curl: `curl "${BASE_NOPATH}/health"`,
    expectedStatus: 200,
    expectedBody: { status: 'ok' },
  };
}

function t_users_post_create() {
  const payload = JSON.stringify({
    fullName: 'João Silva',
    keycloakId: process.env.SAMPLE_KEYCLOAK_ID || '7f3a9c21-5b6e-4d8a-9f2c-1e7b4a6d8c91',
  });
  return {
    name: 'POST /v1/users',
    curl: `curl -X POST "${BASE}/users" -H "Content-Type: application/json" -d '${payload}'`,
    expectedStatus: 201,
  };
}

function t_users_get_me() {
  return {
    name: 'GET /v1/users/me',
    curl: `curl "${BASE}/users/me" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 200,
  };
}

function t_users_get_by_id() {
  const id = process.env.EXAMPLE_USER_ID || '5402f0fb-c7a7-45d7-8f77-b92211985e34';
  return { name: 'GET /v1/users/:id', curl: `curl "${BASE}/users/${id}"`, expectedStatus: 200 };
}

function t_users_put() {
  const id = process.env.EXAMPLE_USER_ID || '5402f0fb-c7a7-45d7-8f77-b92211985e34';
  return {
    name: 'PUT /v1/users/:id',
    curl: `curl -X PUT "${BASE}/users/${id}" -H "Content-Type: application/json" -d '{ "fullName": "João Atualizado" }'`,
    expectedStatus: 200,
  };
}

function t_users_delete() {
  const id = process.env.EXAMPLE_USER_ID || '5402f0fb-c7a7-45d7-8f77-b92211985e34';
  return {
    name: 'DELETE /v1/users/:id',
    curl: `curl -X DELETE "${BASE}/users/${id}" -o /dev/null -w "%{http_code}\n"`,
    expectedStatus: 204,
  };
}

function t_flow_user_create_update() {
  return {
    name: 'FLOW: criar usuário -> obter id -> atualizar usuário',
    run: async ({ runCurlRaw, state }) => {
      console.log('🧪 Fluxo: criação de usuário (manual-style)');
      // 1) Criar usuário
      const createPayload = JSON.stringify({
        fullName: 'João Fluxo',
        keycloakId: process.env.SAMPLE_KEYCLOAK_ID || '7f3a9c21-5b6e-4d8a-9f2c-1e7b4a6d8c91',
      });
      const createCurl = `curl -X POST "${BASE}/users" -H "Content-Type: application/json" -d '${createPayload}'`;
      console.log('➡️  Executando: criar usuário');
      const r1 = await runCurlRaw(createCurl);
      console.log(
        r1.status === 201 ? '✅ Usuário criado' : `❌ Falha ao criar (status ${r1.status})`,
      );

      if (r1.status !== 201) {
        console.log('--- resposta (criar usuário) ---');
        console.log('status:', r1.status);
        if (r1.body) console.log('body:', r1.body);
        if (r1.stderr) console.log('stderr:', r1.stderr);
        if (r1.json) console.log('json:', JSON.stringify(r1.json, null, 2));
        console.log('-------------------------------');
      }

      // try extract id (prefer explicit fields)
      let userId = null;
      const providedKeycloak =
        process.env.SAMPLE_KEYCLOAK_ID || '7f3a9c21-5b6e-4d8a-9f2c-1e7b4a6d8c91';
      if (r1.json) userId = r1.json.id || r1.json.userId || (r1.json.data && r1.json.data.id);
      if (!userId) {
        // fallback: regex, but avoid capturing the keycloakId itself
        const m = (r1.body || '').match(
          /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/,
        );
        if (m && m[0] !== providedKeycloak) userId = m[0];
      }

      // if creation returned conflict (409) and we still don't have userId, try GET /users/me when we have ACCESS_TOKEN
      if (!userId && r1.status === 409 && ACCESS_TOKEN) {
        try {
          console.log(
            'ℹ️  Tentando recuperar usuário com /users/me (possível usuário já existente)',
          );
          const meRes = await runCurlRaw(
            `curl "${BASE}/users/me" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
          );
          if (meRes && meRes.json) {
            userId = meRes.json.id || meRes.json.userId || (meRes.json.data && meRes.json.data.id);
            if (userId) console.log(`🆔 Encontrado via /users/me: ${userId}`);
          }
        } catch (e) {
          // ignore
        }
      }
      // Additional fallback: try searching by keycloakId or fullName via query endpoints
      if (!userId && r1.status === 409) {
        try {
          const keycloak = providedKeycloak;
          console.log('ℹ️  Tentando buscar usuário por keycloakId via /users?keycloakId=...');
          const byKc = await runCurlRaw(`curl "${BASE}/users?keycloakId=${keycloak}"`);
          if (byKc && byKc.json) {
            // if API returns an array or object
            if (Array.isArray(byKc.json) && byKc.json.length > 0)
              userId = byKc.json[0].id || byKc.json[0].userId;
            else if (byKc.json.id) userId = byKc.json.id || byKc.json.userId;
            if (userId) console.log(`🆔 Encontrado via query keycloakId: ${userId}`);
          }
        } catch (e) {
          // ignore
        }
      }
      if (!userId && r1.status === 409) {
        try {
          const nameQ = encodeURIComponent('João Fluxo');
          console.log('ℹ️  Tentando buscar usuário por fullName via /users?fullName=...');
          const byName = await runCurlRaw(`curl "${BASE}/users?fullName=${nameQ}"`);
          if (byName && byName.json) {
            if (Array.isArray(byName.json) && byName.json.length > 0)
              userId = byName.json[0].id || byName.json[0].userId;
            else if (byName.json.id) userId = byName.json.id || byName.json.userId;
            if (userId) console.log(`🆔 Encontrado via query fullName: ${userId}`);
          }
        } catch (e) {
          // ignore
        }
      }
      if (userId) {
        state.userId = userId;
        process.env.USER_ID = userId;
        console.log(`🆔 Capturado userId: ${userId}`);
      } else {
        console.log('⚠️ Não foi possível extrair userId da resposta');
      }

      // 2) Obter usuário por id (se tivermos id)
      let r2 = { status: null };
      if (state.userId) {
        const getCurl = `curl "${BASE}/users/${state.userId}"`;
        console.log('➡️  Executando: obter usuário por id');
        r2 = await runCurlRaw(getCurl);
        console.log(r2.status === 200 ? '🔍 Usuário encontrado' : `⚠️ GET retornou ${r2.status}`);
      }

      // 3) Atualizar usuário
      let r3 = { status: null };
      if (state.userId) {
        const updatePayload = JSON.stringify({ fullName: 'João Fluxo Atualizado' });
        const putCurl = `curl -X PUT "${BASE}/users/${state.userId}" -H "Content-Type: application/json" -d '${updatePayload}'`;
        console.log('➡️  Executando: atualizar usuário');
        r3 = await runCurlRaw(putCurl);
        console.log(r3.status === 200 ? '✏️ Usuário atualizado' : `❌ PUT retornou ${r3.status}`);
      }

      const pass =
        r1.status === 201 &&
        (!state.userId || r2.status === 200) &&
        (!state.userId || r3.status === 200);
      return {
        name: 'FLOW: criar usuário -> obter id -> atualizar usuário',
        curl: createCurl,
        expectedStatus: 200,
        expectedBody: null,
        response: { steps: [r1, r2, r3] },
        status: r1.status || r2.status || r3.status,
        pass,
        when: new Date().toISOString(),
      };
    },
  };
}

function t_flow_service_request_create() {
  return {
    name: 'FLOW: criar service-request (reserva)',
    run: async ({ runCurlRaw, state }) => {
      console.log('🧭 Fluxo: criar reserva de serviço');
      const providerId = process.env.PROVIDER_ID || state.providerId || '';
      const serviceId = process.env.SERVICE_ID || state.serviceId || '';
      const addressId = process.env.ADDRESS_ID || state.addressId || '';
      if (!providerId || !serviceId || !addressId) {
        console.log(
          '⚠️ Faltam IDs (PROVIDER_ID, SERVICE_ID, ADDRESS_ID). O fluxo tentará usar variáveis de ambiente.',
        );
      }
      const payload = JSON.stringify({
        providerId,
        serviceId,
        addressId,
        description: 'Reserva via fluxo automatizado',
        scheduledAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        priceFinal: 100.0,
      });
      const curl = `curl -X POST "${BASE}/service-requests" -H "Content-Type: application/json" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -d '${payload}'`;
      console.log('➡️  Executando: criar service-request');
      const r = await runCurlRaw(curl);
      console.log(
        r.status === 201 ? '✅ Service-request criado' : `❌ service-request status ${r.status}`,
      );
      if (r.status !== 201) {
        console.log('--- resposta (service-request) ---');
        console.log('status:', r.status);
        if (r.body) console.log('body:', r.body);
        if (r.stderr) console.log('stderr:', r.stderr);
        if (r.json) console.log('json:', JSON.stringify(r.json, null, 2));
        console.log('--------------------------------');
      }
      // try capture id
      let srId = null;
      if (r.json) srId = r.json.id || r.json.serviceRequestId || (r.json.data && r.json.data.id);
      if (srId) {
        state.serviceRequestId = srId;
        process.env.SERVICE_REQUEST_ID = srId;
        console.log(`🆔 Capturado serviceRequestId: ${srId}`);
      }
      return {
        name: 'FLOW: criar service-request (reserva)',
        curl,
        expectedStatus: 201,
        response: r,
        status: r.status,
        pass: r.status === 201,
        when: new Date().toISOString(),
      };
    },
  };
}

function t_users_admin_stats() {
  return {
    name: 'GET /v1/users/admin/stats',
    curl: `curl "${BASE}/users/admin/stats" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 200,
  };
}

function t_users_me_addresses_list() {
  return {
    name: 'GET /v1/users/me/addresses',
    curl: `curl "${BASE}/users/me/addresses" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 200,
  };
}

function t_users_me_addresses_post() {
  const payload = JSON.stringify({
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 4B',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    latitude: -23.5505,
    longitude: -46.6333,
    label: 'Casa',
    isPrimary: true,
  });
  return {
    name: 'POST /v1/users/me/addresses',
    curl: `curl -X POST "${BASE}/users/me/addresses" -H "Content-Type: application/json" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -d '${payload}'`,
    expectedStatus: 201,
  };
}

function t_users_me_addresses_delete() {
  const addressId = process.env.ADDRESS_ID || '550e8400-e29b-41d4-a716-446655440005';
  return {
    name: 'DELETE /v1/users/me/addresses/:addressId',
    curl: `curl -X DELETE "${BASE}/users/me/addresses/${addressId}" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -o /dev/null -w "%{http_code}\n"`,
    expectedStatus: 204,
  };
}

function t_categories_get() {
  return { name: 'GET /v1/categories', curl: `curl "${BASE}/categories"`, expectedStatus: 200 };
}

function t_categories_get_by_id() {
  const cid = process.env.CATEGORY_ID || '550e8400-e29b-41d4-a716-446655440003';
  return {
    name: 'GET /v1/categories/:id',
    curl: `curl "${BASE}/categories/${cid}"`,
    expectedStatus: 200,
  };
}

function t_categories_post() {
  const payload = JSON.stringify({
    name: 'Jardinagem',
    slug: 'jardinagem',
    iconUrl: 'https://cdn.zolve.com/icons/garden.svg',
  });
  return {
    name: 'POST /v1/categories',
    curl: `curl -X POST "${BASE}/categories" -H "Content-Type: application/json" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -d '${payload}'`,
    expectedStatus: 201,
  };
}

function t_categories_put() {
  const cid = process.env.CATEGORY_ID || '550e8400-e29b-41d4-a716-446655440003';
  const payload = JSON.stringify({
    name: 'Limpeza Residencial',
    iconUrl: 'https://cdn.zolve.com/icons/cleaning-v2.svg',
  });
  return {
    name: 'PUT /v1/categories/:id',
    curl: `curl -X PUT "${BASE}/categories/${cid}" -H "Content-Type: application/json" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -d '${payload}'`,
    expectedStatus: 200,
  };
}

function t_categories_delete() {
  const cid = process.env.CATEGORY_ID || '550e8400-e29b-41d4-a716-446655440003';
  return {
    name: 'DELETE /v1/categories/:id',
    curl: `curl -X DELETE "${BASE}/categories/${cid}" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -o /dev/null -w "%{http_code}\n"`,
    expectedStatus: 204,
  };
}

function t_services_get() {
  return { name: 'GET /v1/services', curl: `curl "${BASE}/services"`, expectedStatus: 200 };
}

function t_services_get_by_id() {
  const sid = process.env.SERVICE_ID || '550e8400-e29b-41d4-a716-446655440004';
  return {
    name: 'GET /v1/services/:id',
    curl: `curl "${BASE}/services/${sid}"`,
    expectedStatus: 200,
  };
}

function t_services_post() {
  const payload = JSON.stringify({
    categoryId: process.env.CATEGORY_ID || '550e8400-e29b-41d4-a716-446655440003',
    name: 'Limpeza de Vidros',
    description: 'Limpeza externa e interna de vidros e janelas',
  });
  return {
    name: 'POST /v1/services',
    curl: `curl -X POST "${BASE}/services" -H "Content-Type: application/json" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -d '${payload}'`,
    expectedStatus: 201,
  };
}

function t_services_put() {
  const sid = process.env.SERVICE_ID || '550e8400-e29b-41d4-a716-446655440004';
  const payload = JSON.stringify({
    name: 'Limpeza Completa Premium',
    description: 'Limpeza completa com produtos premium',
  });
  return {
    name: 'PUT /v1/services/:id',
    curl: `curl -X PUT "${BASE}/services/${sid}" -H "Content-Type: application/json" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -d '${payload}'`,
    expectedStatus: 200,
  };
}

function t_providers_post() {
  const payload = JSON.stringify({
    userId: process.env.USER_ID || '550e8400-e29b-41d4-a716-446655440001',
    businessName: 'João Limpezas Ltda',
    description: 'Especialista em limpeza residencial com 10 anos de experiência',
  });
  return {
    name: 'POST /v1/providers',
    curl: `curl -X POST "${BASE}/providers" -H "Content-Type: application/json" -d '${payload}'`,
    expectedStatus: 201,
  };
}

function t_providers_get() {
  return { name: 'GET /v1/providers', curl: `curl "${BASE}/providers"`, expectedStatus: 200 };
}

function t_providers_admin_pending() {
  return {
    name: 'GET /v1/providers/admin/pending',
    curl: `curl "${BASE}/providers/admin/pending" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 200,
  };
}

function t_providers_get_by_id() {
  const pid = process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002';
  return {
    name: 'GET /v1/providers/:id',
    curl: `curl "${BASE}/providers/${pid}"`,
    expectedStatus: 200,
  };
}

function t_providers_put() {
  const pid = process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002';
  const payload = JSON.stringify({
    businessName: 'João Limpezas Premium',
    description: 'Serviços premium de limpeza residencial e comercial',
    isAvailable: false,
  });
  return {
    name: 'PUT /v1/providers/:id',
    curl: `curl -X PUT "${BASE}/providers/${pid}" -H "Content-Type: application/json" -d '${payload}'`,
    expectedStatus: 200,
  };
}

function t_providers_services_get() {
  const pid = process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002';
  return {
    name: 'GET /v1/providers/:id/services',
    curl: `curl "${BASE}/providers/${pid}/services"`,
    expectedStatus: 200,
  };
}

function t_providers_services_post() {
  const pid = process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002';
  const payload = JSON.stringify({
    serviceId: process.env.SERVICE_ID || '550e8400-e29b-41d4-a716-446655440004',
    priceBase: 150.0,
    priceType: 'FIXED',
  });
  return {
    name: 'POST /v1/providers/:id/services',
    curl: `curl -X POST "${BASE}/providers/${pid}/services" -H "Content-Type: application/json" -d '${payload}'`,
    expectedStatus: 201,
  };
}

function t_providers_services_delete() {
  const pid = process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002';
  const sid = process.env.SERVICE_ID || '550e8400-e29b-41d4-a716-446655440004';
  return {
    name: 'DELETE /v1/providers/:id/services/:serviceId',
    curl: `curl -X DELETE "${BASE}/providers/${pid}/services/${sid}" -o /dev/null -w "%{http_code}\n"`,
    expectedStatus: 204,
  };
}

function t_providers_work_locations_get() {
  const pid = process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002';
  return {
    name: 'GET /v1/providers/:id/work-locations',
    curl: `curl "${BASE}/providers/${pid}/work-locations"`,
    expectedStatus: 200,
  };
}

function t_providers_work_locations_post() {
  const pid = process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002';
  const payload = JSON.stringify({
    addressId: process.env.ADDRESS_ID || '550e8400-e29b-41d4-a716-446655440005',
    name: 'Zona Sul SP',
    isPrimary: true,
  });
  return {
    name: 'POST /v1/providers/:id/work-locations',
    curl: `curl -X POST "${BASE}/providers/${pid}/work-locations" -H "Content-Type: application/json" -d '${payload}'`,
    expectedStatus: 201,
  };
}

function t_providers_work_locations_delete() {
  const pid = process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002';
  const lid = process.env.LOCATION_ID || '550e8400-e29b-41d4-a716-446655440016';
  return {
    name: 'DELETE /v1/providers/:id/work-locations/:locationId',
    curl: `curl -X DELETE "${BASE}/providers/${pid}/work-locations/${lid}" -o /dev/null -w "%{http_code}\n"`,
    expectedStatus: 204,
  };
}

function t_providers_verification_post() {
  const pid = process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002';
  return {
    name: 'POST /v1/providers/:id/verification',
    curl: `curl -X POST "${BASE}/providers/${pid}/verification" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 201,
  };
}

function t_providers_verification_get() {
  const pid = process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002';
  return {
    name: 'GET /v1/providers/:id/verification',
    curl: `curl "${BASE}/providers/${pid}/verification"`,
    expectedStatus: 200,
  };
}

function t_providers_verification_approve() {
  const pid = process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002';
  return {
    name: 'PUT /v1/providers/:id/verification/approve',
    curl: `curl -X PUT "${BASE}/providers/${pid}/verification/approve" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 200,
  };
}

function t_providers_verification_reject() {
  const pid = process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002';
  const payload = JSON.stringify({
    reason: 'Documentos insuficientes. Envie CPF e comprovante de residência.',
  });
  return {
    name: 'PUT /v1/providers/:id/verification/reject',
    curl: `curl -X PUT "${BASE}/providers/${pid}/verification/reject" -H "Content-Type: application/json" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -d '${payload}'`,
    expectedStatus: 200,
  };
}

function t_service_requests_post() {
  const payload = JSON.stringify({
    providerId: process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002',
    serviceId: process.env.SERVICE_ID || '550e8400-e29b-41d4-a716-446655440004',
    addressId: process.env.ADDRESS_ID || '550e8400-e29b-41d4-a716-446655440005',
    description: 'Preciso de limpeza completa em apartamento de 60m²',
    scheduledAt: '2026-04-10T09:00:00.000Z',
    priceFinal: 150.0,
  });
  return {
    name: 'POST /v1/service-requests',
    curl: `curl -X POST "${BASE}/service-requests" -H "Content-Type: application/json" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -d '${payload}'`,
    expectedStatus: 201,
  };
}

function t_service_requests_get() {
  return {
    name: 'GET /v1/service-requests',
    curl: `curl "${BASE}/service-requests" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -H "X-User-Type: CUSTOMER"`,
    expectedStatus: 200,
  };
}

function t_service_requests_get_by_id() {
  const id = process.env.SERVICE_REQUEST_ID || '550e8400-e29b-41d4-a716-446655440006';
  return {
    name: 'GET /v1/service-requests/:id',
    curl: `curl "${BASE}/service-requests/${id}"`,
    expectedStatus: 200,
  };
}

function t_service_requests_accept() {
  const id = process.env.SERVICE_REQUEST_ID || '550e8400-e29b-41d4-a716-446655440006';
  return {
    name: 'PUT /v1/service-requests/:id/accept',
    curl: `curl -X PUT "${BASE}/service-requests/${id}/accept" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 200,
  };
}

function t_service_requests_reject() {
  const id = process.env.SERVICE_REQUEST_ID || '550e8400-e29b-41d4-a716-446655440006';
  return {
    name: 'PUT /v1/service-requests/:id/reject',
    curl: `curl -X PUT "${BASE}/service-requests/${id}/reject" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 200,
  };
}

function t_service_requests_complete() {
  const id = process.env.SERVICE_REQUEST_ID || '550e8400-e29b-41d4-a716-446655440006';
  return {
    name: 'PUT /v1/service-requests/:id/complete',
    curl: `curl -X PUT "${BASE}/service-requests/${id}/complete" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 200,
  };
}

function t_service_requests_cancel() {
  const id = process.env.SERVICE_REQUEST_ID || '550e8400-e29b-41d4-a716-446655440006';
  return {
    name: 'PUT /v1/service-requests/:id/cancel',
    curl: `curl -X PUT "${BASE}/service-requests/${id}/cancel" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 200,
  };
}

function t_reviews_post() {
  const payload = JSON.stringify({
    serviceRequestId: process.env.SERVICE_REQUEST_ID || '550e8400-e29b-41d4-a716-446655440006',
    rating: 5,
    comment: 'Serviço excelente! Muito pontual e caprichoso.',
  });
  return {
    name: 'POST /v1/reviews',
    curl: `curl -X POST "${BASE}/reviews" -H "Content-Type: application/json" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -d '${payload}'`,
    expectedStatus: 201,
  };
}

function t_reviews_get_provider() {
  const pid = process.env.PROVIDER_ID || '550e8400-e29b-41d4-a716-446655440002';
  return {
    name: 'GET /v1/reviews/provider/:providerId',
    curl: `curl "${BASE}/reviews/provider/${pid}"`,
    expectedStatus: 200,
  };
}

function t_documents_post_upload() {
  const file = process.env.DOCUMENT_FILE || '/tmp/document.pdf';
  return {
    name: 'POST /v1/documents (upload)',
    curl: `curl -X POST "${BASE}/documents" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -F "file=@${file}" -F "documentType=CPF"`,
    expectedStatus: 201,
  };
}

function t_documents_get_url() {
  const doc = process.env.DOCUMENT_ID || '550e8400-e29b-41d4-a716-446655440008';
  return {
    name: 'GET /v1/documents/:id/url',
    curl: `curl "${BASE}/documents/${doc}/url" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 200,
  };
}

function t_documents_approve() {
  const doc = process.env.DOCUMENT_ID || '550e8400-e29b-41d4-a716-446655440008';
  return {
    name: 'PUT /v1/documents/:id/approve',
    curl: `curl -X PUT "${BASE}/documents/${doc}/approve" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 200,
  };
}

function t_documents_reject() {
  const doc = process.env.DOCUMENT_ID || '550e8400-e29b-41d4-a716-446655440008';
  return {
    name: 'PUT /v1/documents/:id/reject',
    curl: `curl -X PUT "${BASE}/documents/${doc}/reject" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 200,
  };
}

function t_notifications_get() {
  return {
    name: 'GET /v1/notifications',
    curl: `curl "${BASE}/notifications" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}"`,
    expectedStatus: 200,
  };
}

function t_notifications_mark_read() {
  const nid = process.env.NOTIFICATION_ID || '550e8400-e29b-41d4-a716-446655440009';
  return {
    name: 'PUT /v1/notifications/:id/read',
    curl: `curl -X PUT "${BASE}/notifications/${nid}/read" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "X-User-Id: ${KEYCLOAK_ID}" -o /dev/null -w "%{http_code}\n"`,
    expectedStatus: 204,
  };
}

// End of generated functions

const tests = [
  // Flow tests (user flows / use-cases)
  t_flow_user_create_update,
  t_flow_service_request_create,
  t_health_get,
  t_users_post_create,
  t_users_get_me,
  t_users_get_by_id,
  t_users_put,
  t_users_delete,
  t_users_admin_stats,
  t_users_me_addresses_list,
  t_users_me_addresses_post,
  t_users_me_addresses_delete,
  t_categories_get,
  t_categories_get_by_id,
  t_categories_post,
  t_categories_put,
  t_categories_delete,
  t_services_get,
  t_services_get_by_id,
  t_services_post,
  t_services_put,
  t_providers_post,
  t_providers_get,
  t_providers_admin_pending,
  t_providers_get_by_id,
  t_providers_put,
  t_providers_services_get,
  t_providers_services_post,
  t_providers_services_delete,
  t_providers_work_locations_get,
  t_providers_work_locations_post,
  t_providers_work_locations_delete,
  t_providers_verification_post,
  t_providers_verification_get,
  t_providers_verification_approve,
  t_providers_verification_reject,
  t_service_requests_post,
  t_service_requests_get,
  t_service_requests_get_by_id,
  t_service_requests_accept,
  t_service_requests_reject,
  t_service_requests_complete,
  t_service_requests_cancel,
  t_reviews_post,
  t_reviews_get_provider,
  t_documents_post_upload,
  t_documents_get_url,
  t_documents_approve,
  t_documents_reject,
  t_notifications_get,
  t_notifications_mark_read,
];

async function main() {
  const args = process.argv.slice(2);
  const filter = (() => {
    const i = args.indexOf('--test');
    if (i !== -1 && args[i + 1]) return args[i + 1].toLowerCase();
    return null;
  })();

  const selected = tests
    .map((fn) => fn())
    .filter((t) => (filter ? t.name.toLowerCase().includes(filter) : true));
  if (filter && selected.length === 0) {
    console.error('No tests matched --test', filter);
    process.exit(2);
  }

  const results = [];
  const state = {}; // shared state for flow tests (capture IDs, etc.)
  for (const t of selected) {
    console.log('Running:', t.name);
    if (typeof t.run === 'function') {
      // flow-style test: t.run receives helpers and state, should return a result item
      try {
        const item = await t.run({ runCurlRaw, state, BASE, ACCESS_TOKEN, KEYCLOAK_ID });
        results.push(item);
        console.log(
          `=> ${item.pass ? 'PASS' : 'FAIL'} (status: ${item.response && item.response.status})`,
        );
      } catch (e) {
        console.error('Flow test error:', e);
        results.push({
          name: t.name,
          pass: false,
          response: { error: String(e) },
          when: new Date().toISOString(),
        });
      }
      continue;
    }
    console.log(`➡️  Executando: ${t.name}`);
    const res = await runCurlRaw(t.curl);
    const passStatus = t.expectedStatus ? res.status === t.expectedStatus : true;
    let passBody = true;
    if (t.expectedBody && res.json !== null) passBody = isSubset(t.expectedBody, res.json);
    const pass = passStatus && passBody;
    const item = {
      name: t.name,
      curl: t.curl,
      expectedStatus: t.expectedStatus || null,
      expectedBody: t.expectedBody || null,
      response: res,
      pass,
      passStatus,
      passBody,
      when: new Date().toISOString(),
    };
    results.push(item);
    if (pass) {
      console.log(`✅ ${t.name} passou (status: ${res.status})`);
    } else {
      console.log(`❌ ${t.name} falhou (status: ${res.status})`);
      if (res.body) console.log('Resposta:', res.body);
    }
  }

  const outDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonFile = path.join(outDir, `api-curl-report-${ts}.json`);
  fs.writeFileSync(
    jsonFile,
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
  );

  const mdLines = ['# API CURLS Test Report', '', `Generated: ${new Date().toISOString()}`, ''];
  for (const r of results) {
    mdLines.push(`## ${r.name}`);
    mdLines.push('');
    mdLines.push('```bash');
    mdLines.push(r.curl);
    mdLines.push('```');
    mdLines.push('');
    mdLines.push('```json');
    try {
      mdLines.push(JSON.stringify(r.response.json || JSON.parse(r.response.body || '{}'), null, 2));
    } catch {
      mdLines.push(r.response.body || '');
    }
    mdLines.push('```');
    mdLines.push('');
    mdLines.push(`Expected status: ${r.expectedStatus || 'N/A'}`);
    mdLines.push(`Pass: ${r.pass}`);
    mdLines.push('---');
    mdLines.push('');
  }
  const mdFile = path.join(outDir, `api-curl-report-${ts}.md`);
  fs.writeFileSync(mdFile, mdLines.join('\n'));

  console.log('\nReports generated:');
  console.log(' -', jsonFile);
  console.log(' -', mdFile);
}

if (require.main === module)
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
