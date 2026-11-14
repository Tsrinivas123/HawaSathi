/**
 * @file rateLimiter.ts
 * @description Sliding-window in-memory rate limiter with safe IP derivation and Map size capping.
 * 
 * SERVERLESS ARCHITECTURE NOTE:
 * On stateless platforms (e.g. Vercel Serverless / AWS Lambda), in-memory Map structures
 * provide ultra-fast (< 1ms) protection for all warm-start executions on that worker instance.
 * For global distributed rate limiting across all worldwide edge nodes, an external distributed
 * key-value store (e.g. Upstash Redis / Vercel KV) should be connected via environment credentials.
 */

import { NextRequest } from 'next/server';
import { SECURITY_CONSTANTS } from '@/lib/constants';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Derives the client IP safely from Vercel trusted headers or falls back to loopback.
 * @param req Incoming NextRequest
 * @returns Client IP address string
 */
export function getClientIp(req: NextRequest): string {
  const vercelRealIp = req.headers.get('x-real-ip');
  if (vercelRealIp) return vercelRealIp.trim();

  const vercelProxiedFor = req.headers.get('x-vercel-proxied-for');
  if (vercelProxiedFor) return vercelProxiedFor.split(',')[0].trim();

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return SECURITY_CONSTANTS.DEFAULT_CLIENT_IP;
}

/**
 * Prunes expired or excess entries from the rate limiter map.
 * @param now Current epoch timestamp
 */
function pruneRateLimitMap(now: number): void {
  if (rateLimitMap.size < SECURITY_CONSTANTS.MAX_RATE_LIMIT_MAP_SIZE) return;

  rateLimitMap.forEach((record, ip) => {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  });

  if (rateLimitMap.size >= SECURITY_CONSTANTS.MAX_RATE_LIMIT_MAP_SIZE) {
    const oldest = rateLimitMap.keys().next().value;
    if (oldest) rateLimitMap.delete(oldest);
  }
}

/**
 * Checks and records rate limit quota for a given client IP.
 * @param ip Client IP address
 * @returns Allowed status and remaining requests
 */
export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  pruneRateLimitMap(now);

  const client = rateLimitMap.get(ip);
  if (!client || now > client.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + SECURITY_CONSTANTS.RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: SECURITY_CONSTANTS.MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (client.count >= SECURITY_CONSTANTS.MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  client.count += 1;
  return {
    allowed: true,
    remaining: SECURITY_CONSTANTS.MAX_REQUESTS_PER_WINDOW - client.count,
  };
}
