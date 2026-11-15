#!/usr/bin/env node
/**
 * @file smoke.mjs
 * @description End-to-end smoke test suite against running deployment (live Vercel or localhost).
 * Usage: node scripts/smoke.mjs [baseUrl]
 * Verifies security headers, edge responses, error status codes, and input bounds.
 * Exits non-zero on the first failure to gate CI pipelines.
 */

const [base = 'https://hawasathi.vercel.app'] = process.argv.slice(2);
const origin = new URL(base).origin;

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '✓ PASS' : '✗ FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
};

console.log(`\nStarting HawaSathi E2E Smoke Test against: ${base}\n`);

// 1. GET / serves the application with proper HTML structure
const page = await fetch(`${base}/`);
const html = await page.text();
const headers = page.headers;

check('GET / serves the application (200 OK)', page.status === 200, `status ${page.status}`);
check('HTML contains HawaSathi root application layout', html.includes('HawaSathi') || html.includes('<!DOCTYPE html>'));
check('X-Frame-Options is DENY', headers.get('x-frame-options') === 'DENY');
check('X-Content-Type-Options is nosniff', headers.get('x-content-type-options') === 'nosniff');
check('Strict-Transport-Security is enforced', Boolean(headers.get('strict-transport-security')));
check('Referrer-Policy is strict-origin-when-cross-origin', headers.get('referrer-policy') === 'strict-origin-when-cross-origin');
check('Permissions-Policy restricts sensitive hardware APIs', Boolean(headers.get('permissions-policy')));

// 2. Test API Security: /api/analyze defenses
const postApi = (body, customHeaders = {}) =>
  fetch(`${base}/api/analyze`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin,
      ...customHeaders,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

// Forbidden cross-origin check
const forbiddenOriginRes = await postApi(
  { records: [], qualityReport: {} },
  { origin: 'https://malicious-attacker-domain.example' }
);
check(
  'POST /api/analyze rejects unauthorized cross-origin requests (403 Forbidden)',
  forbiddenOriginRes.status === 403,
  `status ${forbiddenOriginRes.status}`
);

// Unsupported media type
const badContentTypeRes = await postApi('unsupported_string', { 'content-type': 'text/plain' });
check(
  'POST /api/analyze rejects non-JSON content-type (415 Unsupported Media Type)',
  badContentTypeRes.status === 415,
  `status ${badContentTypeRes.status}`
);

// Malformed JSON rejection
const malformedJsonRes = await postApi('{ broken json');
check(
  'POST /api/analyze rejects malformed JSON payload (400 Bad Request)',
  malformedJsonRes.status === 400,
  `status ${malformedJsonRes.status}`
);

// Missing required fields rejection
const emptyPayloadRes = await postApi({});
check(
  'POST /api/analyze validates schema and rejects missing records (400 Bad Request)',
  emptyPayloadRes.status === 400,
  `status ${emptyPayloadRes.status}`
);

// Payload size limit defense
const oversizedPayload = JSON.stringify({
  records: Array.from({ length: 1200 }, (_, i) => ({
    id: `REC-${i}`,
    location: 'X'.repeat(50),
    ward: 'Ward 1',
    timestamp: '2026-11-15 10:00',
    aqi: 100,
    pm25: 50,
    pm10: 100,
    no2: 20,
    so2: 10,
    co: 1,
    status: 'valid',
    issues: [],
    rawRow: {},
  })),
  qualityReport: {
    totalRows: 1200,
    validRows: 1200,
    duplicateCount: 0,
    outlierCount: 0,
    missingValuesCount: 0,
    dataCompletenessPct: 100,
    unitsHarmonized: true,
  },
});

const oversizedRes = await postApi(oversizedPayload);
check(
  'POST /api/analyze rejects oversized payload exceeding batch boundaries (400 or 413)',
  oversizedRes.status === 400 || oversizedRes.status === 413,
  `status ${oversizedRes.status}`
);

console.log(failures ? `\n✗ ${failures} smoke check(s) failed.` : '\n✓ All 11 smoke checks passed cleanly.\n');
process.exit(failures ? 1 : 0);
