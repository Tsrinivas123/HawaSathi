/**
 * @file route.ts
 * @description Slim orchestrator API route for Gemini civic air intelligence.
 * Delegates security, validation, caching, and execution to modular libraries.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';
import { validateOrigin, buildCorsHeaders } from '@/lib/security/origin';
import { generateDataHashKey, getCachedAnalysis, setCachedAnalysis } from '@/lib/cache/lruCache';
import { validateHeaders, validateAndSanitizeRecords } from '@/lib/api/validateRequest';
import { runCivicAirIntelligence } from '@/lib/gemini';
import { SECURITY_CONSTANTS } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Attaches standard security, rate limit, and caching headers to outgoing response.
 */
function attachResponseHeaders(
  res: NextResponse,
  allowedOrigin: string,
  remaining: number,
  cacheStatus: 'HIT' | 'MISS'
): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-RateLimit-Limit', String(SECURITY_CONSTANTS.MAX_REQUESTS_PER_WINDOW));
  res.headers.set('X-RateLimit-Remaining', String(remaining));
  res.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  res.headers.set('X-Cache-Status', cacheStatus);
  return res;
}

/**
 * Handles CORS preflight requests with origin verification.
 */
export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  const { isAllowed, allowedOrigin } = validateOrigin(req);
  if (!isAllowed) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: buildCorsHeaders(allowedOrigin) });
}

/**
 * Handles telemetry intelligence analysis requests.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { isAllowed, allowedOrigin } = validateOrigin(req);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden: Unauthorized origin.' }, { status: 403 });
    }

    const rate = checkRateLimit(getClientIp(req));
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait 60 seconds.' },
        { status: 429, headers: { 'Retry-After': String(SECURITY_CONSTANTS.RETRY_AFTER_SECONDS) } }
      );
    }

    const headerError = validateHeaders(req);
    if (headerError) return headerError;

    const body = await req.json();
    const { errorResponse, sanitized } = validateAndSanitizeRecords(body.records);
    if (errorResponse) return errorResponse;

    const cacheKey = generateDataHashKey(sanitized);
    const cached = getCachedAnalysis(cacheKey);
    if (cached) {
      return attachResponseHeaders(NextResponse.json(cached), allowedOrigin, rate.remaining, 'HIT');
    }

    const result = await runCivicAirIntelligence(sanitized, body.qualityReport, req.signal);
    setCachedAnalysis(cacheKey, result);

    return attachResponseHeaders(NextResponse.json(result), allowedOrigin, rate.remaining, 'MISS');
  } catch (_error: unknown) {
    return NextResponse.json(
      { error: 'An error occurred while processing air intelligence.' },
      { status: 500 }
    );
  }
}
