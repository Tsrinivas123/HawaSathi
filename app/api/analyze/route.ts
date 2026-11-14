import { NextRequest, NextResponse } from 'next/server';
import { runCivicAirIntelligence } from '@/lib/gemini';
import { AirRecord, DataQualityReport } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { records, qualityReport } = body as {
      records: AirRecord[];
      qualityReport: DataQualityReport;
    };

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'No records provided for analysis.' },
        { status: 400 }
      );
    }

    const result = await runCivicAirIntelligence(records, qualityReport);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error in /api/analyze:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error while processing air intelligence.' },
      { status: 500 }
    );
  }
}
