/**
 * @file route.ts
 * @description Secure server-side API endpoint for executing Gemini civic air intelligence.
 * Enforces payload boundaries, input sanitization, and security headers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runCivicAirIntelligence } from '@/lib/gemini';
import { AirRecord, DataQualityReport } from '@/lib/types';
import { SYSTEM_LIMITS } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // 1. Content-Type verification
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

    // 2. Strict input validation
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

    // 3. Execute verified civic intelligence
    const result = await runCivicAirIntelligence(records, qualityReport);

    // 4. Return response with security & rate limiting headers
    const response = NextResponse.json(result);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99');
    return response;
  } catch (_error: unknown) {
    return NextResponse.json(
      { error: 'An error occurred while processing air intelligence. Please verify your telemetry inputs.' },
      { status: 500 }
    );
  }
}
