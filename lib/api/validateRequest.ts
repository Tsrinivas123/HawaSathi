/**
 * @file validateRequest.ts
 * @description Inbound HTTP request parsing, payload boundaries, and tabular string sanitization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_LIMITS } from '@/lib/constants';
import { AirRecord, DataQualityReport } from '@/lib/types';

export interface ValidatedAnalyzeBody {
  records: AirRecord[];
  qualityReport: DataQualityReport;
}

/**
 * Sanitizes string inputs to prevent XSS and control-character injection.
 * @param str Untrusted input value
 * @returns Cleaned string bounded to MAX_FIELD_LENGTH
 */
export function sanitizeString(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .slice(0, SYSTEM_LIMITS.MAX_FIELD_LENGTH);
}

/**
 * Verifies request headers (Content-Type and Content-Length limits).
 * @param req NextRequest
 * @returns Error NextResponse or null if valid
 */
export function validateHeaders(req: NextRequest): NextResponse | null {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      { error: 'Invalid Content-Type. Expected application/json.' },
      { status: 415 }
    );
  }

  const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
  if (contentLength > SYSTEM_LIMITS.MAX_PAYLOAD_SIZE_BYTES) {
    return NextResponse.json(
      { error: `Payload too large. Exceeds ${SYSTEM_LIMITS.MAX_PAYLOAD_SIZE_BYTES} bytes limit.` },
      { status: 413 }
    );
  }

  return null;
}

/**
 * Validates and sanitizes records array from parsed JSON body.
 * @param records Inbound records array
 * @returns Sanitized records array or error response
 */
export function validateAndSanitizeRecords(
  records: unknown
): { errorResponse: NextResponse | null; sanitized: AirRecord[] } {
  if (!records || !Array.isArray(records) || records.length === 0) {
    return {
      errorResponse: NextResponse.json({ error: 'No records provided for analysis.' }, { status: 400 }),
      sanitized: [],
    };
  }

  if (records.length > SYSTEM_LIMITS.MAX_INGESTION_RECORDS) {
    return {
      errorResponse: NextResponse.json(
        { error: `Batch size exceeded. Max allowed is ${SYSTEM_LIMITS.MAX_INGESTION_RECORDS}.` },
        { status: 413 }
      ),
      sanitized: [],
    };
  }

  const sanitized = (records as AirRecord[]).map((r) => ({
    ...r,
    location: sanitizeString(r.location),
    ward: sanitizeString(r.ward),
    rawLocation: sanitizeString(r.rawLocation),
  }));

  return { errorResponse: null, sanitized };
}
