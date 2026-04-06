export const ENV_VARS = {
  PORT: 'PORT',
  NODE_ENV: 'NODE_ENV',
  PROJECT_NAME: 'PROJECT_NAME',
  BASE_URL: 'BASE_URL',
  DATABASE_POSTGRES_HOST: 'DATABASE_POSTGRES_HOST',
  DATABASE_POSTGRES_PORT: 'DATABASE_POSTGRES_PORT',
  DATABASE_POSTGRES_NAME: 'DATABASE_POSTGRES_NAME',
  DATABASE_POSTGRES_USER: 'DATABASE_POSTGRES_USER',
  DATABASE_POSTGRES_PASSWORD: 'DATABASE_POSTGRES_PASSWORD',
  DATABASE_POSTGRES_SYNCHRONIZE: 'DATABASE_POSTGRES_SYNCHRONIZE',
  DATABASE_POSTGRES_LOGGING: 'DATABASE_POSTGRES_LOGGING',
  DB_TIMEZONE: 'DB_TIMEZONE',
  BASE_URL_DEVELOPMENT: 'BASE_URL_DEVELOPMENT',
  BASE_URL_STAGING: 'BASE_URL_STAGING',
  BASE_URL_PRODUCTION: 'BASE_URL_PRODUCTION',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ─── Swagger Theme ────────────────────────────────────────────────────────────
// Aplicado via SwaggerCustomOptions.customCss
// Suporta light/dark mode com CSS variables e toggle persistido no localStorage.
// data-theme é setado no elemento <html> pelo JS abaixo.
// ──────────────────────────────────────────────────────────────────────────────

export const SWAGGER_CUSTOM_CSS_FINAL = `
/* ── Fontes ──────────────────────────────────────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── Design tokens — Light (default) ────────────────────────────────────── */
:root {
  --sw-bg:            #f1f5f9;
  --sw-surface:       #ffffff;
  --sw-surface-2:     #f8fafc;
  --sw-border:        #e2e8f0;
  --sw-border-focus:  #6366f1;
  --sw-text:          #0f172a;
  --sw-text-muted:    #64748b;
  --sw-text-subtle:   #94a3b8;
  --sw-accent:        #6366f1;
  --sw-accent-hover:  #4f46e5;
  --sw-accent-soft:   rgba(99,102,241,0.08);
  --sw-topbar-bg:     rgba(255,255,255,0.85);
  --sw-topbar-border: #e2e8f0;
  --sw-code-bg:       #f1f5f9;
  --sw-code-text:     #1e293b;
  --sw-shadow-sm:     0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06);
  --sw-shadow-md:     0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.05);
  --sw-radius:        10px;
  --sw-radius-sm:     6px;
  --sw-font:          'Inter', system-ui, -apple-system, sans-serif;
  --sw-font-mono:     'JetBrains Mono', 'Fira Code', monospace;
  /* HTTP method colors */
  --c-get:    #059669; --c-get-bg:    rgba(5,150,105,.07);
  --c-post:   #6366f1; --c-post-bg:   rgba(99,102,241,.07);
  --c-put:    #d97706; --c-put-bg:    rgba(217,119,6,.07);
  --c-patch:  #7c3aed; --c-patch-bg:  rgba(124,58,237,.07);
  --c-delete: #dc2626; --c-delete-bg: rgba(220,38,38,.07);
}

/* ── Design tokens — Dark ───────────────────────────────────────────────── */
:root[data-theme="dark"] {
  --sw-bg:            #09090b;
  --sw-surface:       #111117;
  --sw-surface-2:     #18181f;
  --sw-border:        #27272a;
  --sw-border-focus:  #818cf8;
  --sw-text:          #f1f5f9;
  --sw-text-muted:    #94a3b8;
  --sw-text-subtle:   #64748b;
  --sw-accent:        #818cf8;
  --sw-accent-hover:  #6366f1;
  --sw-accent-soft:   rgba(129,140,248,0.1);
  --sw-topbar-bg:     rgba(9,9,11,0.9);
  --sw-topbar-border: #27272a;
  --sw-code-bg:       #18181f;
  --sw-code-text:     #c4b5fd;
  --sw-shadow-sm:     0 1px 3px rgba(0,0,0,.4), 0 1px 2px rgba(0,0,0,.3);
  --sw-shadow-md:     0 4px 16px rgba(0,0,0,.5), 0 2px 4px rgba(0,0,0,.3);
  --c-get:    #34d399; --c-get-bg:    rgba(52,211,153,.06);
  --c-post:   #818cf8; --c-post-bg:   rgba(129,140,248,.06);
  --c-put:    #fbbf24; --c-put-bg:    rgba(251,191,36,.06);
  --c-patch:  #a78bfa; --c-patch-bg:  rgba(167,139,250,.06);
  --c-delete: #f87171; --c-delete-bg: rgba(248,113,113,.06);
}

/* ── System dark preference (sem tema explícito salvo) ──────────────────── */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not([data-theme="dark"]) {
    --sw-bg:            #09090b;
    --sw-surface:       #111117;
    --sw-surface-2:     #18181f;
    --sw-border:        #27272a;
    --sw-border-focus:  #818cf8;
    --sw-text:          #f1f5f9;
    --sw-text-muted:    #94a3b8;
    --sw-text-subtle:   #64748b;
    --sw-accent:        #818cf8;
    --sw-accent-hover:  #6366f1;
    --sw-accent-soft:   rgba(129,140,248,0.1);
    --sw-topbar-bg:     rgba(9,9,11,0.9);
    --sw-topbar-border: #27272a;
    --sw-code-bg:       #18181f;
    --sw-code-text:     #c4b5fd;
    --sw-shadow-sm:     0 1px 3px rgba(0,0,0,.4), 0 1px 2px rgba(0,0,0,.3);
    --sw-shadow-md:     0 4px 16px rgba(0,0,0,.5), 0 2px 4px rgba(0,0,0,.3);
    --c-get:    #34d399; --c-get-bg:    rgba(52,211,153,.06);
    --c-post:   #818cf8; --c-post-bg:   rgba(129,140,248,.06);
    --c-put:    #fbbf24; --c-put-bg:    rgba(251,191,36,.06);
    --c-patch:  #a78bfa; --c-patch-bg:  rgba(167,139,250,.06);
    --c-delete: #f87171; --c-delete-bg: rgba(248,113,113,.06);
  }
}

/* ── Reset / base ───────────────────────────────────────────────────────── */
* { box-sizing: border-box; }

body {
  background: var(--sw-bg) !important;
  margin: 0;
}

.swagger-ui {
  font-family: var(--sw-font) !important;
  color: var(--sw-text) !important;
  background: var(--sw-bg) !important;
}

/* ── Topbar ─────────────────────────────────────────────────────────────── */
.swagger-ui .topbar {
  background: var(--sw-topbar-bg) !important;
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid var(--sw-topbar-border) !important;
  padding: 0 !important;
  position: sticky;
  top: 0;
  z-index: 200;
  box-shadow: var(--sw-shadow-sm);
}

.swagger-ui .topbar .wrapper {
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1460px;
  margin: 0 auto;
}

.swagger-ui .topbar-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.swagger-ui .topbar-wrapper a {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.swagger-ui .topbar-wrapper img {
  height: 32px;
  width: auto;
  filter: drop-shadow(0 0 8px var(--sw-accent));
}

.swagger-ui .topbar-wrapper .link span {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--sw-text) !important;
  letter-spacing: -0.02em;
}

.swagger-ui .topbar .download-url-wrapper { display: none !important; }

/* ── Info section ───────────────────────────────────────────────────────── */
.swagger-ui .information-container {
  background: var(--sw-surface) !important;
  border-bottom: 1px solid var(--sw-border);
  padding: 40px 24px !important;
  margin-bottom: 0 !important;
}

.swagger-ui .information-container .wrapper {
  max-width: 1460px;
  margin: 0 auto;
}

.swagger-ui .info {
  margin: 0 !important;
}

.swagger-ui .info .title {
  font-family: var(--sw-font) !important;
  font-size: 2.2rem !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em !important;
  color: var(--sw-text) !important;
  line-height: 1.2 !important;
  margin-bottom: 4px !important;
}

.swagger-ui .info .title small {
  background: var(--sw-accent-soft) !important;
  color: var(--sw-accent) !important;
  border: 1px solid var(--sw-accent) !important;
  border-radius: 20px !important;
  padding: 2px 10px !important;
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.05em !important;
  vertical-align: middle !important;
  margin-left: 8px !important;
}

.swagger-ui .info p,
.swagger-ui .info .description p {
  color: var(--sw-text-muted) !important;
  font-size: 0.95rem !important;
  line-height: 1.7 !important;
}

.swagger-ui .info .description a {
  color: var(--sw-accent) !important;
}

.swagger-ui .info .description strong {
  color: var(--sw-text) !important;
  font-weight: 600 !important;
}

.swagger-ui .info .description code {
  background: var(--sw-code-bg) !important;
  color: var(--sw-accent) !important;
  padding: 1px 6px !important;
  border-radius: 4px !important;
  font-family: var(--sw-font-mono) !important;
  font-size: 0.85em !important;
}

/* ── Servers selector ───────────────────────────────────────────────────── */
.swagger-ui .scheme-container {
  background: var(--sw-surface-2) !important;
  border-bottom: 1px solid var(--sw-border) !important;
  padding: 14px 24px !important;
  box-shadow: none !important;
}

.swagger-ui .scheme-container .wrapper {
  max-width: 1460px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.swagger-ui .servers-title,
.swagger-ui .schemes-title {
  color: var(--sw-text-muted) !important;
  font-size: 0.78rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
}

.swagger-ui .servers > label select,
.swagger-ui .schemes > label select {
  background: var(--sw-surface) !important;
  color: var(--sw-text) !important;
  border: 1px solid var(--sw-border) !important;
  border-radius: var(--sw-radius-sm) !important;
  padding: 6px 10px !important;
  font-family: var(--sw-font) !important;
  font-size: 0.85rem !important;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}

.swagger-ui .servers > label select:focus,
.swagger-ui .schemes > label select:focus {
  border-color: var(--sw-border-focus) !important;
}

/* ── Main content wrapper ───────────────────────────────────────────────── */
.swagger-ui .wrapper {
  max-width: 1460px !important;
  margin: 0 auto !important;
  padding: 24px !important;
}

/* ── Tag groups ─────────────────────────────────────────────────────────── */
.swagger-ui .opblock-tag {
  border-bottom: 1px solid var(--sw-border) !important;
  margin: 8px 0 0 !important;
  padding: 16px 0 !important;
  color: var(--sw-text) !important;
  font-size: 1.05rem !important;
  font-weight: 700 !important;
  letter-spacing: -0.01em !important;
}

.swagger-ui .opblock-tag:hover {
  background: var(--sw-surface-2) !important;
  border-radius: var(--sw-radius-sm) !important;
}

.swagger-ui .opblock-tag small {
  color: var(--sw-text-muted) !important;
  font-size: 0.8rem !important;
  font-weight: 400 !important;
}

.swagger-ui .opblock-tag svg { fill: var(--sw-text-muted) !important; }

/* ── Operation blocks ───────────────────────────────────────────────────── */
.swagger-ui .opblock {
  border-radius: var(--sw-radius) !important;
  border: 1px solid var(--sw-border) !important;
  box-shadow: var(--sw-shadow-sm) !important;
  margin: 8px 0 !important;
  overflow: hidden !important;
  transition: box-shadow 0.2s, transform 0.15s !important;
}

.swagger-ui .opblock:hover {
  box-shadow: var(--sw-shadow-md) !important;
}

.swagger-ui .opblock .opblock-summary {
  padding: 0 !important;
  cursor: pointer;
}

.swagger-ui .opblock .opblock-summary-control {
  padding: 12px 16px !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}

.swagger-ui .opblock .opblock-summary-description {
  color: var(--sw-text-muted) !important;
  font-size: 0.875rem !important;
}

.swagger-ui .opblock .opblock-summary-path {
  font-family: var(--sw-font-mono) !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  color: var(--sw-text) !important;
}

.swagger-ui .opblock .opblock-summary-path__deprecated {
  text-decoration: line-through !important;
  color: var(--sw-text-muted) !important;
}

/* Method color strips */
.swagger-ui .opblock.opblock-get    { border-left: 4px solid var(--c-get)    !important; background: var(--c-get-bg)    !important; }
.swagger-ui .opblock.opblock-post   { border-left: 4px solid var(--c-post)   !important; background: var(--c-post-bg)   !important; }
.swagger-ui .opblock.opblock-put    { border-left: 4px solid var(--c-put)    !important; background: var(--c-put-bg)    !important; }
.swagger-ui .opblock.opblock-patch  { border-left: 4px solid var(--c-patch)  !important; background: var(--c-patch-bg)  !important; }
.swagger-ui .opblock.opblock-delete { border-left: 4px solid var(--c-delete) !important; background: var(--c-delete-bg) !important; }

/* Method badges */
.swagger-ui .opblock-summary-method {
  border-radius: var(--sw-radius-sm) !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.06em !important;
  min-width: 62px !important;
  text-align: center !important;
  padding: 4px 10px !important;
}

.swagger-ui .opblock.opblock-get    .opblock-summary-method { background: var(--c-get)    !important; }
.swagger-ui .opblock.opblock-post   .opblock-summary-method { background: var(--c-post)   !important; }
.swagger-ui .opblock.opblock-put    .opblock-summary-method { background: var(--c-put)    !important; }
.swagger-ui .opblock.opblock-patch  .opblock-summary-method { background: var(--c-patch)  !important; }
.swagger-ui .opblock.opblock-delete .opblock-summary-method { background: var(--c-delete) !important; }

/* Expanded body */
.swagger-ui .opblock .opblock-body {
  background: var(--sw-surface) !important;
  border-top: 1px solid var(--sw-border) !important;
}

.swagger-ui .opblock-section-header {
  background: var(--sw-surface-2) !important;
  border-bottom: 1px solid var(--sw-border) !important;
  padding: 10px 16px !important;
}

.swagger-ui .opblock-section-header h4 {
  color: var(--sw-text) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  margin: 0 !important;
}

/* ── Parameters table ───────────────────────────────────────────────────── */
.swagger-ui table {
  background: transparent !important;
  border-collapse: collapse !important;
  width: 100% !important;
}

.swagger-ui table thead tr th {
  background: var(--sw-surface-2) !important;
  color: var(--sw-text-muted) !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  padding: 10px 14px !important;
  border-bottom: 1px solid var(--sw-border) !important;
}

.swagger-ui table tbody tr td {
  padding: 10px 14px !important;
  border-bottom: 1px solid var(--sw-border) !important;
  color: var(--sw-text) !important;
  vertical-align: top !important;
  font-size: 0.875rem !important;
}

.swagger-ui table tbody tr:last-child td { border-bottom: none !important; }

.swagger-ui .parameter__name {
  color: var(--sw-text) !important;
  font-family: var(--sw-font-mono) !important;
  font-weight: 500 !important;
  font-size: 0.85rem !important;
}

.swagger-ui .parameter__name.required::after {
  color: var(--c-delete) !important;
}

.swagger-ui .parameter__type {
  color: var(--sw-accent) !important;
  font-family: var(--sw-font-mono) !important;
  font-size: 0.78rem !important;
}

.swagger-ui .parameter__in {
  color: var(--sw-text-subtle) !important;
  font-size: 0.75rem !important;
}

/* ── Response codes ─────────────────────────────────────────────────────── */
.swagger-ui .response-col_status {
  font-family: var(--sw-font-mono) !important;
  font-weight: 700 !important;
  font-size: 0.9rem !important;
}

.swagger-ui .response-col_description { color: var(--sw-text-muted) !important; font-size: 0.875rem !important; }

.swagger-ui table.responses-table tbody tr td { border-bottom: 1px solid var(--sw-border) !important; }

/* ── Form elements ──────────────────────────────────────────────────────── */
.swagger-ui input[type="text"],
.swagger-ui input[type="email"],
.swagger-ui input[type="file"],
.swagger-ui input[type="password"],
.swagger-ui textarea,
.swagger-ui select {
  background: var(--sw-surface) !important;
  color: var(--sw-text) !important;
  border: 1px solid var(--sw-border) !important;
  border-radius: var(--sw-radius-sm) !important;
  font-family: var(--sw-font) !important;
  font-size: 0.875rem !important;
  padding: 8px 12px !important;
  outline: none !important;
  transition: border-color 0.15s !important;
  width: 100% !important;
}

.swagger-ui input:focus,
.swagger-ui textarea:focus,
.swagger-ui select:focus {
  border-color: var(--sw-border-focus) !important;
  box-shadow: 0 0 0 3px var(--sw-accent-soft) !important;
}

.swagger-ui input::placeholder,
.swagger-ui textarea::placeholder { color: var(--sw-text-subtle) !important; }

/* ── Buttons ────────────────────────────────────────────────────────────── */
.swagger-ui .btn {
  border-radius: var(--sw-radius-sm) !important;
  font-family: var(--sw-font) !important;
  font-weight: 600 !important;
  font-size: 0.8rem !important;
  cursor: pointer !important;
  transition: all 0.15s !important;
}

.swagger-ui .btn.execute {
  background: var(--sw-accent) !important;
  color: #fff !important;
  border: none !important;
  padding: 8px 20px !important;
  letter-spacing: 0.02em !important;
}

.swagger-ui .btn.execute:hover {
  background: var(--sw-accent-hover) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(99,102,241,0.4) !important;
}

.swagger-ui .btn.cancel {
  background: transparent !important;
  color: var(--sw-text-muted) !important;
  border: 1px solid var(--sw-border) !important;
  padding: 8px 20px !important;
}

.swagger-ui .btn.cancel:hover {
  border-color: var(--c-delete) !important;
  color: var(--c-delete) !important;
}

.swagger-ui .btn.authorize {
  background: transparent !important;
  color: var(--sw-accent) !important;
  border: 1px solid var(--sw-accent) !important;
  padding: 6px 16px !important;
}

.swagger-ui .btn.authorize:hover {
  background: var(--sw-accent-soft) !important;
}

.swagger-ui .btn.authorize svg,
.swagger-ui .btn.authorize svg * { fill: var(--sw-accent) !important; }

/* Try-it-out button */
.swagger-ui .try-out__btn {
  color: var(--sw-accent) !important;
  border-color: var(--sw-accent) !important;
  background: var(--sw-accent-soft) !important;
}

/* ── Code blocks ────────────────────────────────────────────────────────── */
.swagger-ui .highlight-code,
.swagger-ui pre {
  background: var(--sw-code-bg) !important;
  border: 1px solid var(--sw-border) !important;
  border-radius: var(--sw-radius-sm) !important;
  padding: 16px !important;
  overflow-x: auto !important;
}

.swagger-ui pre code,
.swagger-ui .highlight-code code {
  font-family: var(--sw-font-mono) !important;
  font-size: 0.82rem !important;
  color: var(--sw-code-text) !important;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}

/* Inline code */
.swagger-ui .model code,
.swagger-ui p code,
.swagger-ui td code {
  background: var(--sw-code-bg) !important;
  color: var(--sw-accent) !important;
  font-family: var(--sw-font-mono) !important;
  font-size: 0.82em !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
  border: 1px solid var(--sw-border) !important;
}

/* ── Models / Schemas ───────────────────────────────────────────────────── */
.swagger-ui section.models {
  border: 1px solid var(--sw-border) !important;
  border-radius: var(--sw-radius) !important;
  background: var(--sw-surface) !important;
  box-shadow: var(--sw-shadow-sm) !important;
  overflow: hidden !important;
  margin: 24px 0 !important;
}

.swagger-ui section.models h4 {
  color: var(--sw-text) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  padding: 14px 16px !important;
  margin: 0 !important;
  background: var(--sw-surface-2) !important;
  border-bottom: 1px solid var(--sw-border) !important;
  cursor: pointer;
}

.swagger-ui .model-container {
  background: var(--sw-surface-2) !important;
  border-radius: var(--sw-radius-sm) !important;
  margin: 8px !important;
  padding: 12px !important;
  border: 1px solid var(--sw-border) !important;
}

.swagger-ui .model-container:hover {
  border-color: var(--sw-border-focus) !important;
}

.swagger-ui .model-title {
  color: var(--sw-text) !important;
  font-family: var(--sw-font-mono) !important;
  font-size: 0.9rem !important;
  font-weight: 600 !important;
}

.swagger-ui .model {
  color: var(--sw-text-muted) !important;
  font-family: var(--sw-font-mono) !important;
  font-size: 0.82rem !important;
}

.swagger-ui .model .property.primitive { color: var(--sw-accent) !important; }
.swagger-ui .model span.prop-name { color: var(--sw-text) !important; }
.swagger-ui .model span.prop-type { color: var(--c-get) !important; }
.swagger-ui .model span.prop-format { color: var(--sw-text-subtle) !important; }

.swagger-ui .model-box {
  background: var(--sw-code-bg) !important;
  border: 1px solid var(--sw-border) !important;
  border-radius: var(--sw-radius-sm) !important;
  padding: 12px !important;
}

/* ── Authorization modal ─────────────────────────────────────────────────── */
.swagger-ui .dialog-ux .modal-ux {
  background: var(--sw-surface) !important;
  border: 1px solid var(--sw-border) !important;
  border-radius: var(--sw-radius) !important;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4) !important;
  color: var(--sw-text) !important;
}

.swagger-ui .dialog-ux .modal-ux-header {
  background: var(--sw-surface-2) !important;
  border-bottom: 1px solid var(--sw-border) !important;
  border-radius: var(--sw-radius) var(--sw-radius) 0 0 !important;
  padding: 20px 24px !important;
}

.swagger-ui .dialog-ux .modal-ux-header h3 {
  color: var(--sw-text) !important;
  font-size: 1.1rem !important;
  font-weight: 700 !important;
}

.swagger-ui .dialog-ux .modal-ux-content { padding: 20px 24px !important; }

.swagger-ui .dialog-ux .modal-ux-content p,
.swagger-ui .dialog-ux .modal-ux-content label { color: var(--sw-text-muted) !important; font-size: 0.875rem !important; }

.swagger-ui .auth-container h4 { color: var(--sw-text) !important; font-weight: 600 !important; }

/* ── Expand/collapse arrows ─────────────────────────────────────────────── */
.swagger-ui .expand-operation svg * { fill: var(--sw-text-muted) !important; }

/* ── Loading / Spinner ──────────────────────────────────────────────────── */
.swagger-ui .loading-container .loading::after { border-color: var(--sw-accent) transparent !important; }

/* ── Markdown / description ─────────────────────────────────────────────── */
.swagger-ui .markdown p { color: var(--sw-text-muted) !important; line-height: 1.7 !important; }
.swagger-ui .markdown h1,.swagger-ui .markdown h2,.swagger-ui .markdown h3 { color: var(--sw-text) !important; }

/* ── Filter search box ──────────────────────────────────────────────────── */
.swagger-ui .filter-container .operation-filter-input {
  background: var(--sw-surface) !important;
  border: 1px solid var(--sw-border) !important;
  border-radius: var(--sw-radius-sm) !important;
  color: var(--sw-text) !important;
  padding: 8px 14px !important;
  font-size: 0.875rem !important;
  transition: border-color 0.15s !important;
}

.swagger-ui .filter-container .operation-filter-input:focus {
  border-color: var(--sw-border-focus) !important;
  outline: none !important;
}

/* ── Theme toggle button ────────────────────────────────────────────────── */
#sw-theme-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--sw-surface);
  color: var(--sw-text);
  border: 1px solid var(--sw-border);
  border-radius: var(--sw-radius-sm);
  padding: 6px 14px;
  font-family: var(--sw-font);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}

#sw-theme-toggle:hover {
  background: var(--sw-accent-soft);
  border-color: var(--sw-accent);
  color: var(--sw-accent);
}

#sw-theme-toggle svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* ── Scrollbar ──────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--sw-border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--sw-text-subtle); }
`;

// ─── Swagger Theme Toggle JS ──────────────────────────────────────────────────
// Roda após o Swagger UI renderizar.
// Aplica data-theme no <html> (onde as CSS variables são definidas).
// ──────────────────────────────────────────────────────────────────────────────
export const SWAGGER_THEME_TOGGLE_JS = `
(function () {
  const STORAGE_KEY = 'sw-theme';

  const ICON_MOON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const ICON_SUN  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function resolveTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.getElementById('sw-theme-toggle');
    if (!btn) return;
    if (theme === 'dark') {
      btn.innerHTML = ICON_SUN + '<span>Light</span>';
      btn.title = 'Switch to light mode';
    } else {
      btn.innerHTML = ICON_MOON + '<span>Dark</span>';
      btn.title = 'Switch to dark mode';
    }
  }

  function mountToggle() {
    if (document.getElementById('sw-theme-toggle')) return;
    const wrapper = document.querySelector('.topbar-wrapper');
    if (!wrapper) return;

    const btn = document.createElement('button');
    btn.id = 'sw-theme-toggle';
    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') || resolveTheme();
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    wrapper.appendChild(btn);
    applyTheme(resolveTheme());
  }

  // Inicializar tema imediatamente (antes do paint) para evitar flash
  document.documentElement.setAttribute('data-theme', resolveTheme());

  // Montar o botão quando o DOM do Swagger UI estiver pronto
  function tryMount() {
    if (document.querySelector('.topbar-wrapper')) {
      mountToggle();
    } else {
      setTimeout(tryMount, 150);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryMount);
  } else {
    tryMount();
  }

  // Sincronizar com preferência do sistema (caso o usuário não tenha salvo preferência)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
})();
`;
