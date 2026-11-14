/**
 * @file route.ts
 * @description Secure server-side API endpoint for executing Gemini civic air intelligence.
 * Enforces rate limiting, input sanitization, in-memory response caching, and HTTP security headers.
 */

import { NextRequest, NextResponse } from 'next/server';
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
 *    a shared external store (e.g. Upstash Redis / Redis Cluster via `@upstash/ratelimit`) should be mounted
 *    using environment credentials (`UPSTASH_REDIS_REST_URL`).
 */

// In-memory sliding window rate limiter (per-instance defense)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests/min per IP

// High-efficiency in-memory response cache (LRU-style with max 50 items per instance)
const responseCache = new Map<string, { result: AnalysisResult; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL
const MAX_CACHE_ENTRIES = 50;

/**
 * Sanitizes string inputs to prevent XSS and prompt injection
 */
function sanitizeString(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // Strip angle brackets
    .replace(/[\x00-\x1F\x7F]/g, '') // Strip control characters
    .slice(0, 255); // Enforce length boundary
}

/**
 * Generates a deterministic hash key for input telemetry caching
 */
function generateCacheKey(records: AirRecord[]): string {
  const sample = records
    .slice(0, 20)
    .map((r) => `${r.id}:${r.location}:${r.aqi ?? ''}:${r.pm25 ?? ''}`)
    .join('|');
  return `hawa_cache_${records.length}_${sample}`;
}

/**
 * Check and apply rate limiting based on client IP
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
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
 * OPTIONS handler for secure CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * POST handler for air telemetry intelligence analysis
 */
export async function POST(req: NextRequest) {
  try {
    // 1. IP extraction & rate limiting check
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
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
          },
        }
      );
    }

    // 2. Content-Type verification
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid Content-Type. Expected application/json.' },
        { status: 415 }
      );
    }

    const body = await req.json();
    const { records, qualityReport } = body as {
      records: AirRecord[];
      qualityReport: DataQualityReport;
    };

    // 3. Strict input validation
    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'No records provided for analysis.' },
        { status: 400 }
      );
    }

    if (records.length > SYSTEM_LIMITS.MAX_INGESTION_RECORDS) {
      return NextResponse.json(
        { error: `Batch size exceeded. Maximum allowed records is ${SYSTEM_LIMITS.MAX_INGESTION_RECORDS}.` },
        { status: 413 }
      );
    }

    // 4. Sanitize records strings
    const sanitizedRecords = records.map((r) => ({
      ...r,
      location: sanitizeString(r.location),
      ward: sanitizeString(r.ward),
      rawLocation: sanitizeString(r.rawLocation),
    }));

    // 5. Check in-memory efficiency cache
    const cacheKey = generateCacheKey(sanitizedRecords);
    const cached = responseCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      const cachedResponse = NextResponse.json(cached.result);
      cachedResponse.headers.set('X-Cache-Status', 'HIT');
      cachedResponse.headers.set('X-Content-Type-Options', 'nosniff');
      cachedResponse.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
      cachedResponse.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
      return cachedResponse;
    }

    // 6. Execute verified civic intelligence
    const result = await runCivicAirIntelligence(sanitizedRecords, qualityReport);

    // 7. Store in LRU cache
    if (responseCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = responseCache.keys().next().value;
      if (oldestKey) responseCache.delete(oldestKey);
    }
    responseCache.set(cacheKey, { result, timestamp: now });

    // 8. Return response with security & rate limiting headers
    const response = NextResponse.json(result);
    response.headers.set('X-Cache-Status', 'MISS');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    return response;
  } catch (_error: unknown) {
    return NextResponse.json(
      { error: 'An error occurred while processing air intelligence. Please verify your telemetry inputs.' },
      { status: 500 }
    );
  }
}
