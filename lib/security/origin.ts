/**
 * @file origin.ts
 * @description Origin and Referer validation module for strict CORS restriction.
 * Ensures API access is permitted only from verified application domains.
 */

import { NextRequest } from 'next/server';
import { SECURITY_CONSTANTS } from '@/lib/constants';

export interface OriginValidationResult {
  isAllowed: boolean;
  allowedOrigin: string;
}

/**
 * Checks whether a given hostname or origin matches permitted patterns.
 * @param domain Origin or Referer domain
 * @param host Request Host header
 * @returns Boolean indicating domain authorization
 */
function isDomainAuthorized(domain: string, host: string): boolean {
  if (host && domain.includes(host)) return true;
  return SECURITY_CONSTANTS.ALLOWED_ORIGIN_PATTERNS.some((pattern) =>
    domain.includes(pattern)
  );
}

/**
 * Validates the Origin and Referer headers of an incoming request.
 * @param req Incoming NextRequest
 * @returns Object with isAllowed flag and allowedOrigin header string
 */
export function validateOrigin(req: NextRequest): OriginValidationResult {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host') || '';

  // Allow direct same-origin requests (e.g. Next.js internal calls or curl without Origin)
  if (!origin && !referer) {
    return { isAllowed: true, allowedOrigin: `https://${host || 'hawasathi.vercel.app'}` };
  }

  let isAllowed = false;
  if (origin) {
    isAllowed = isDomainAuthorized(origin, host);
  } else if (referer) {
    isAllowed = isDomainAuthorized(referer, host);
  }

  const allowedOrigin = origin && isAllowed ? origin : `https://${host || 'hawasathi.vercel.app'}`;
  return { isAllowed, allowedOrigin };
}

/**
 * Builds standard restricted CORS headers for preflight and API responses.
 * @param allowedOrigin Target origin header value
 * @returns HeadersInit object
 */
export function buildCorsHeaders(allowedOrigin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': String(SECURITY_CONSTANTS.CORS_MAX_AGE_SECONDS),
    'Vary': 'Origin',
  };
}
