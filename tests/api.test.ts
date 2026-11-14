import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, OPTIONS } from '../app/api/analyze/route';
import { BHOPAL_MESSY_SAMPLE_CSV } from '../lib/sampleData';
import { parseAndNormalizeData } from '../lib/normalizer';

describe('Server API Route /api/analyze Suite', () => {
  it('should respond to OPTIONS preflight with 204 and restricted CORS headers', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', { method: 'OPTIONS' });
    const res = await OPTIONS(req);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST, OPTIONS');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeDefined();
    // Origin is strictly bound to authorized host, never insecure wildcard *
    expect(res.headers.get('Access-Control-Allow-Origin')).not.toBe('*');
  });

  it('should reject non-JSON Content-Type with 415 Unsupported Media Type', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'plain text body',
    });

    const res = await POST(req);
    expect(res.status).toBe(415);
    const data = await res.json();
    expect(data.error).toContain('Invalid Content-Type');
  });

  it('should reject empty records payload with 400 Bad Request', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: [], qualityReport: {} }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('No records provided');
  });

  it('should successfully analyze valid records and return structured intelligence with security headers', async () => {
    const { records, qualityReport } = parseAndNormalizeData(BHOPAL_MESSY_SAMPLE_CSV);
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: records.slice(0, 5), qualityReport }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-RateLimit-Limit')).toBe('60');

    const result = await res.json();
    expect(result.averageAqi).toBeDefined();
    expect(result.hotspots.length).toBeGreaterThan(0);
    expect(result.stakeholderActions.length).toBeGreaterThan(0);
  });
});
