import { NextRequest, NextResponse } from 'next/server';
import { runCivicAirIntelligence } from '@/lib/gemini';
import { AirRecord, DataQualityReport } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_ALLOWED_RECORDS = 1000;

export async function POST(req: NextRequest) {
  try {
    // 1. Content-Type check
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

    // 2. Input validation & sanitize
    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'No records provided for analysis.' },
        { status: 400 }
      );
    }

    if (records.length > MAX_ALLOWED_RECORDS) {
      return NextResponse.json(
        { error: `Batch size exceeded. Maximum allowed records is ${MAX_ALLOWED_RECORDS}.` },
        { status: 413 }
      );
    }

    // 3. Run verified Civic Intelligence
    const result = await runCivicAirIntelligence(records, qualityReport);
    
    // 4. Return response with security & rate limiting headers
    const response = NextResponse.json(result);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99');
    return response;
  } catch (error: any) {
    console.error('API Error in /api/analyze:', error?.message);
    return NextResponse.json(
      { error: 'An error occurred while processing air intelligence. Please verify your telemetry inputs.' },
      { status: 500 }
    );
  }
}
