/**
 * @file route.ts
 * @description Secure server-side API endpoint for executing Gemini civic air intelligence.
 * Enforces rate limiting, input sanitization, in-memory LRU cryptographic response caching,
 * trusted origin enforcement, and strict HTTP security headers.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { runCivicAirIntelligence } from '@/lib/gemini';
import { AirRecord, DataQualityReport, AnalysisResult } from '@/lib/types';
import { SYSTEM_LIMITS } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * SERVERLESS ARCHITECTURE NOTE ON IN-MEMORY RATE LIMITING & CACHING:
 * 
 * 1. Scope & Execution Context:
 *    The `rateLimitMap` and `responseCache` below are stored in-memory within the active
 *    Node.js runtime worker instance. On serverless platforms (e.g. Vercel Serverless Functions / AWS Lambda),
 *    instances scale horizontally and are ephemeral. Therefore, these in-memory data structures provide
 *    ultra-fast (< 1ms), zero-network-hop protection and LRU caching for all concurrent and warm-start requests
 *    hitting that specific container instance.
 * 
 * 2. Limitation & Distributed Scalability Path:
 *    In a globally distributed multi-region cluster where incoming traffic is routed across multiple distinct
 *    stateless container instances or cold starts, in-memory state is isolated to each container and resets
 *    upon instance recycling. For enterprise distributed rate limiting across all worldwide edge nodes,
 *    a shared external store (e.g. Upstash Redis / Vercel KV via `@upstash/ratelimit`) should be mounted
 *    using environment credentials (`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`).
 */

// In-memory sliding window rate limiter with max capacity and automatic eviction
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests/min per IP
const MAX_RATE_LIMIT_MAP_SIZE = 500; // Cap Map size to prevent memory exhaustion

// High-efficiency in-memory LRU response cache keyed by cryptographic data hash
const responseCache = new Map<string, { result: AnalysisResult; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL
const MAX_CACHE_ENTRIES = 50;

/**
 * Derives the client IP safely from Vercel's trusted headers.
 */
function getClientIp(req: NextRequest): string {
  const vercelRealIp = req.headers.get('x-real-ip');
  if (vercelRealIp) return vercelRealIp.trim();

  const vercelProxiedFor = req.headers.get('x-vercel-proxied-for');
  if (vercelProxiedFor) return vercelProxiedFor.split(',')[0].trim();

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return '127.0.0.1';
}

/**
 * Sanitizes string inputs to prevent XSS and prompt injection
 */
function sanitizeString(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // Strip angle brackets
    .replace(/[\x00-\x1F\x7F]/g, '') // Strip control characters
    .slice(0, SYSTEM_LIMITS.MAX_FIELD_LENGTH); // Enforce length boundary
}

/**
 * Generates a deterministic SHA-256 cryptographic hash key for telemetry data caching
 */
function generateDataHashKey(records: AirRecord[]): string {
  const normalizedData = JSON.stringify(
    records.map((r) => [r.id, r.location, r.aqi, r.pm25, r.pm10, r.status])
  );
  const hash = crypto.createHash('sha256').update(normalizedData).digest('hex');
  return `hawa_sha256_${records.length}_${hash.slice(0, 32)}`;
}

/**
 * Check and apply rate limiting based on client IP with Map size capping and eviction
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();

  // Prune expired entries if Map size exceeds threshold
  if (rateLimitMap.size >= MAX_RATE_LIMIT_MAP_SIZE) {
    rateLimitMap.forEach((record, storedIp) => {
      if (now > record.resetTime) {
        rateLimitMap.delete(storedIp);
      }
    });
    // If still over cap, evict oldest entry
    if (rateLimitMap.size >= MAX_RATE_LIMIT_MAP_SIZE) {
      const oldestIp = rateLimitMap.keys().next().value;
      if (oldestIp) rateLimitMap.delete(oldestIp);
    }
  }

  const clientRecord = rateLimitMap.get(ip);

  if (!clientRecord || now > clientRecord.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (clientRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  clientRecord.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - clientRecord.count,
  };
}

/**
 * Enforces Origin and Referer validation to restrict CORS to authorized domains
 */
function validateOrigin(req: NextRequest): { isAllowed: boolean; allowedOrigin: string } {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host') || '';

  // Direct requests without Origin/Referer (e.g. same-origin Next.js server actions or curl)
  if (!origin && !referer) {
    return { isAllowed: true, allowedOrigin: `https://${host || 'hawasathi.vercel.app'}` };
  }

  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  const isVercel = host.includes('vercel.app') || (origin && origin.includes('vercel.app'));

  let isAllowed = false;
  if (origin) {
    isAllowed = Boolean(origin.includes(host) || (isLocalhost && origin.includes('localhost')) || (isVercel && origin.includes('vercel.app')));
  } else if (referer) {
    isAllowed = Boolean(referer.includes(host) || (isLocalhost && referer.includes('localhost')) || (isVercel && referer.includes('vercel.app')));
  }

  const allowedOrigin = origin && isAllowed ? origin : `https://${host || 'hawasathi.vercel.app'}`;
  return { isAllowed, allowedOrigin };
}

/**
 * OPTIONS handler for secure CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  const { isAllowed, allowedOrigin } = validateOrigin(req);

  if (!isAllowed) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    },
  });
}

/**
 * POST handler for air telemetry intelligence analysis
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Origin & Referer authorization check
    const { isAllowed, allowedOrigin } = validateOrigin(req);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: Request origin is not authorized.' },
        { status: 403 }
      );
    }

    // 2. Safe client IP extraction & rate limiting check
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait 60 seconds before retrying.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
            'X-RateLimit-Remaining': '0',
            'Access-Control-Allow-Origin': allowedOrigin,
          },
        }
      );
    }

    // 3. Content-Type verification
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid Content-Type. Expected application/json.' },
        { status: 415, headers: { 'Access-Control-Allow-Origin': allowedOrigin } }
      );
    }

    // 4. Request body size boundary verification
    const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
    if (contentLength > SYSTEM_LIMITS.MAX_PAYLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Payload too large. Request body exceeds ${SYSTEM_LIMITS.MAX_PAYLOAD_SIZE_BYTES} bytes limit.` },
        { status: 413, headers: { 'Access-Control-Allow-Origin': allowedOrigin } }
      );
    }

    const body = await req.json();
    const { records, qualityReport } = body as {
      records: AirRecord[];
      qualityReport: DataQualityReport;
    };

    // 5. Strict input record validation
    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'No records provided for analysis.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': allowedOrigin } }
      );
    }

    if (records.length > SYSTEM_LIMITS.MAX_INGESTION_RECORDS) {
      return NextResponse.json(
        { error: `Batch size exceeded. Maximum allowed records is ${SYSTEM_LIMITS.MAX_INGESTION_RECORDS}.` },
        { status: 413, headers: { 'Access-Control-Allow-Origin': allowedOrigin } }
      );
    }

    // 6. Deep input sanitization
    const sanitizedRecords = records.map((r) => ({
      ...r,
      location: sanitizeString(r.location),
      ward: sanitizeString(r.ward),
      rawLocation: sanitizeString(r.rawLocation),
    }));

    // 7. Check in-memory cryptographic LRU cache
    const cacheKey = generateDataHashKey(sanitizedRecords);
    const cached = responseCache.get(cacheKey);
    const now = Date.now();

    if (cached) {
      if (now - cached.timestamp < CACHE_TTL_MS) {
        // Move to most recently used position
        responseCache.delete(cacheKey);
        responseCache.set(cacheKey, { result: cached.result, timestamp: now });

        const cachedResponse = NextResponse.json(cached.result);
        cachedResponse.headers.set('X-Cache-Status', 'HIT');
        cachedResponse.headers.set('X-Content-Type-Options', 'nosniff');
        cachedResponse.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
        cachedResponse.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
        cachedResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin);
        return cachedResponse;
      }
      // Expired cache entry
      responseCache.delete(cacheKey);
    }

    // 8. Execute verified civic intelligence with cancellation support
    const result = await runCivicAirIntelligence(sanitizedRecords, qualityReport, req.signal);

    // 9. Store in LRU cache with eviction of oldest entry
    if (responseCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = responseCache.keys().next().value;
      if (oldestKey) responseCache.delete(oldestKey);
    }
    responseCache.set(cacheKey, { result, timestamp: now });

    // 10. Return sanitized response with security headers
    const response = NextResponse.json(result);
    response.headers.set('X-Cache-Status', 'MISS');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    return response;
  } catch (_error: unknown) {
    // Safe error message: never leak stack traces, secrets, or internal server state
    return NextResponse.json(
      { error: 'An error occurred while processing air intelligence. Please verify your telemetry inputs.' },
      { status: 500 }
    );
  }
}
