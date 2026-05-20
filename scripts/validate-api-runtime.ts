#!/usr/bin/env tsx
/**
 * Phase 2: Application Runtime & API Health Validation
 * Tests all API routes unauthenticated + with demo session cookie
 */

const BASE = 'http://localhost:3001';

interface RouteResult {
  route: string;
  method: string;
  status: number;
  latencyMs: number;
  ok: boolean;
  error?: string;
  body?: string;
}

const results: RouteResult[] = [];
let sessionCookie = '';

// ── Utility ──────────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for runtime validation`);
  }
  return value;
}

async function req(
  method: string,
  path: string,
  opts: { body?: unknown; expectAuth?: boolean; cookie?: string } = {}
): Promise<RouteResult> {
  const start = Date.now();
  const url = `${BASE}${path}`;
  let status = 0;
  let body = '';
  let error: string | undefined;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (opts.cookie ?? sessionCookie) headers['Cookie'] = opts.cookie ?? sessionCookie;

    const res = await fetch(url, {
      method,
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    status = res.status;
    body = await res.text().catch(() => '');
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : String(e);
    status = 0;
  }

  const latencyMs = Date.now() - start;
  let ok: boolean;
  if (error) {
    ok = false;
  } else if (opts.expectAuth) {
    ok = [200, 201, 400, 422].includes(status); // auth expected, 401/403 = bad
  } else {
    ok = [200, 201, 302, 307, 308, 400, 401, 403, 422, 404].includes(status); // 500 = bad
  }

  const result: RouteResult = { route: path, method, status, latencyMs, ok, error, body: body.slice(0, 200) };
  results.push(result);
  return result;
}

function authLabel(status: number): string {
  if (status === 401) return ' [401 needs-auth]';
  if (status === 403) return ' [403 forbidden]';
  return '';
}

function report(r: RouteResult) {
  const icon = r.ok ? '✅' : '❌';
  const auth = authLabel(r.status);
  const perf = r.latencyMs > 3000 ? ` ⚠️ SLOW(${r.latencyMs}ms)` : ` (${r.latencyMs}ms)`;
  const errStr = r.error ? ` ERROR: ${r.error}` : '';
  const s5xx = r.status >= 500 ? ` ❌ SERVER-ERROR` : '';
  console.log(`  ${icon} ${r.method.padEnd(6)} ${r.route.padEnd(60)} ${r.status}${auth}${perf}${errStr}${s5xx}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  PHASE 2: API RUNTIME VALIDATION');
  console.log('══════════════════════════════════════════════════\n');

  // ── 2.1 Unauthenticated public routes ──
  console.log('── 2.1 Public / Auth Routes (no cookie) ──');
  for (const r of [
    await req('GET', '/'),
    await req('GET', '/login'),
    await req('GET', '/register'),
    await req('GET', '/forgot-password'),
  ]) report(r);

  // ── 2.2 NextAuth session endpoint ──
  console.log('\n── 2.2 NextAuth Session Endpoint ──');
  const sessionRes = await req('GET', '/api/auth/session');
  report(sessionRes);

  // ── 2.3 Attempt demo login ──
  console.log('\n── 2.3 Demo Login (CSRF + credentials) ──');
  let csrfToken = '';
  let csrfCookie = '';
  try {
    const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
    const csrfData = await csrfRes.json() as { csrfToken?: string };
    csrfToken = csrfData.csrfToken ?? '';
    // Capture the CSRF cookie — NextAuth validates that the token in the body matches the cookie
    const csrfCookies = csrfRes.headers.getSetCookie?.() ?? [];
    csrfCookie = csrfCookies.map(c => c.split(';')[0]).join('; ');
    console.log(`  ℹ️  CSRF token acquired: ${csrfToken ? csrfToken.slice(0, 16) + '…' : 'MISSING'}`);
  } catch (e: unknown) {
    console.warn(`  ⚠️  CSRF fetch failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (csrfToken) {
    try {
      const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Must include the csrf cookie so NextAuth can validate the double-submit token
          ...(csrfCookie ? { Cookie: csrfCookie } : {}),
        },
        body: new URLSearchParams({
          csrfToken,
          email: 'demo+alice.johnson.job.seeker.senior.0@careerpropel.dev',
          password: requireEnv('DEMO_PASSWORD'),
          redirect: 'false',
          callbackUrl: `${BASE}/dashboard`,
          json: 'true',
        }),
        redirect: 'manual',
      });
      const setCookies = loginRes.headers.getSetCookie?.() ?? [];
      const sessionCookies = setCookies.filter(c =>
        c.includes('next-auth.session-token') || c.includes('__Secure-next-auth.session-token')
      );
      if (sessionCookies.length) {
        // Merge all cookies (csrf + callback-url + session-token) for subsequent requests
        const allCookies = [...csrfCookie.split('; '), ...setCookies.map(c => c.split(';')[0])];
        sessionCookie = [...new Set(allCookies)].join('; ');
        console.log(`  ✅ Session cookie obtained (${setCookies.length} set-cookie headers, ${sessionCookies.length} session)`);
      } else {
        const body = await loginRes.text().catch(() => '');
        console.warn(`  ⚠️  Login returned ${loginRes.status} — no session cookie. Body: ${body.slice(0, 120)}`);
      }
    } catch (e: any) {
      console.warn(`  ⚠️  Login attempt failed: ${e.message}`);
    }
  }

  // ── 2.4 API Routes (unauthenticated — expect 401) ──
  console.log('\n── 2.4 Protected API Routes (no-auth, expect 401/403/302) ──');
  const protectedApis = [
    '/api/jobs',
    '/api/interviews',
    '/api/offers',
    '/api/documents',
    '/api/profile',
    '/api/profile/completeness',
    '/api/profile/recommendations',
    '/api/audit-logs',
    '/api/calendar/events',
  ];
  for (const p of protectedApis) {
    const r = await req('GET', p, { cookie: '' });
    const isUnauth = r.status === 401 || r.status === 403;
    const ok = isUnauth || r.status === 302 || r.status === 307;
    console.log(`  ${ok ? '✅' : '❌'} GET    ${p.padEnd(54)} ${r.status} ${ok ? '[correctly requires auth]' : '[⚠️ NO AUTH GUARD]'} (${r.latencyMs}ms)`);
    results.push({ ...r, ok });
  }

  // ── 2.5 Authenticated API Routes ──
  console.log('\n── 2.5 Authenticated API Routes ──');
  if (!sessionCookie) {
    console.warn('  ⚠️  No session — skipping authenticated API checks');
  } else {
    const authApis = [
      { method: 'GET', path: '/api/jobs' },
      { method: 'GET', path: '/api/jobs?limit=5' },
      { method: 'GET', path: '/api/interviews' },
      { method: 'GET', path: '/api/offers' },
      { method: 'GET', path: '/api/documents' },
      { method: 'GET', path: '/api/profile' },
      { method: 'GET', path: '/api/profile/completeness' },
      { method: 'GET', path: '/api/audit-logs' },
    ];
    for (const { method, path } of authApis) {
      const r = await req(method, path, { expectAuth: true });
      report(r);
    }
  }

  // ── 2.6 Server-Rendered Pages ──
  console.log('\n── 2.6 Server-Rendered App Pages (unauthenticated redirect check) ──');
  const appPages = [
    '/dashboard', '/jobs', '/interview-prep', '/interviews',
    '/offers', '/documents', '/emails', '/profile',
    '/calendar', '/analytics', '/audit-logs',
    '/settings/account', '/settings/security',
  ];
  for (const path of appPages) {
    const r = await req('GET', path, { cookie: '' });
    // These should redirect to /login when unauthenticated, or return 200 with login redirect
    const ok = [200, 302, 307, 308].includes(r.status);
    console.log(`  ${ok ? '✅' : '❌'} GET    ${path.padEnd(40)} ${r.status} (${r.latencyMs}ms) ${r.status >= 500 ? '❌ SERVER ERROR' : ''}`);
    results.push({ ...r, ok });
  }

  // ── 2.7 Critical API Health Checks ──
  console.log('\n── 2.7 Critical API Endpoints ──');

  // POST to jobs (create) without auth — must 401
  const createJobNoAuth = await req('POST', '/api/jobs', {
    cookie: '',
    body: { title: 'Test', company: 'Test Co', stage: 'interested' },
  });
  console.log(`  ${createJobNoAuth.status === 401 ? '✅' : '❌'} POST job without auth: ${createJobNoAuth.status} (expect 401)`);

  // Search endpoint
  const searchNoAuth = await req('GET', '/api/jobs/search?q=engineer', { cookie: '' });
  console.log(`  ${searchNoAuth.status === 401 || searchNoAuth.status === 404 ? '✅' : '⚠️ '} GET /api/jobs/search: ${searchNoAuth.status}`);

  // ── SUMMARY ──────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════');
  const failures = results.filter(r => !r.ok);
  const serverErrors = results.filter(r => r.status >= 500);
  const slow = results.filter(r => r.latencyMs > 3000);

  console.log(`  Total checks: ${results.length}`);
  console.log(`  ✅ OK: ${results.filter(r => r.ok).length}`);
  console.log(`  ❌ Failures: ${failures.length}`);
  console.log(`  💀 5xx Errors: ${serverErrors.length}`);
  console.log(`  🐢 Slow (>3s): ${slow.length}`);

  if (serverErrors.length) {
    console.log('\n  SERVER ERRORS:');
    serverErrors.forEach(r => console.log(`    ❌ ${r.method} ${r.route} → ${r.status}\n       ${r.body?.slice(0, 200)}`));
  }
  if (failures.length) {
    console.log('\n  FAILURES:');
    failures.forEach(r => console.log(`    ❌ ${r.method} ${r.route} → ${r.status} ${r.error ?? ''}`));
  }
}

main().catch(e => { console.error('\n[FATAL]', e.message); process.exit(1); });
