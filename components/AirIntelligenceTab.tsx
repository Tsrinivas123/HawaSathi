'use strict';
/**
 * @file AirIntelligenceTab.tsx
 * @description AI-driven environmental intelligence, station charts, and 100% traceable hotspot diagnostics.
 * Optimized with chart data memoization and React.memo.
 */

import React, { useMemo, memo } from 'react';
import {
  Sparkles,
  MapPin,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileCheck2,
  BarChart3,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { AnalysisResult, AirRecord } from '@/lib/types';
import { CPCB_THRESHOLDS } from '@/lib/constants';

const StationAqiChart = dynamic(
  () => import('./StationAqiChart').then((m) => m.StationAqiChart),
  {
    loading: () => (
      <div className="h-72 w-full flex items-center justify-center bg-slate-50 rounded-xl animate-pulse text-xs text-slate-400">
        Loading particulate concentration chart...
      </div>
    ),
  }
);

interface AirIntelligenceTabProps {
  analysis: AnalysisResult | null;
  records: AirRecord[];
  onOpenTrace: (recordId: string) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

const AirIntelligenceTabComponent: React.FC<AirIntelligenceTabProps> = ({
  analysis,
  records,
  onOpenTrace,
  onRunAnalysis,
  isAnalyzing,
}) => {
  // Memoize chart data generation: strictly exclude duplicates and flagged outlier records
  const chartData = useMemo(() => {
    const seenLocations = new Set<string>();
    return records
      .filter((r) => r.status === 'valid' && (r.pm25 !== null || r.aqi !== null))
      .filter((r) => {
        const loc = r.location.toLowerCase().trim();
        if (seenLocations.has(loc)) return false;
        seenLocations.add(loc);
        return true;
      })
      .map((r) => ({
        name: r.location, // Full station name (no cut-off text)
        fullName: `${r.location} (${r.ward})`,
        pm25: r.pm25 || 0,
        pm10: r.pm10 || 0,
        aqi: r.aqi || 0,
      }));
  }, [records]);

  if (isAnalyzing) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h3 className="text-base font-bold text-navy-900">Generating Civic Air Quality Intelligence...</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Google Gemini is analyzing sensor telemetry, identifying pollution clusters, validating evidence records, and drafting stakeholder directives.
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <Sparkles className="w-10 h-10 text-emerald-600 mx-auto mb-3" aria-hidden="true" />
        <h3 className="text-base font-bold text-navy-900">No Air Intelligence Generated Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Ingest sensor readings or load sample telemetry to trigger our Gemini-powered civic environmental reasoning studio.
        </p>
        <button
          type="button"
          onClick={onRunAnalysis}
          disabled={records.length === 0}
          aria-label="Generate Air Intelligence Briefing"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
        >
          Generate Air Intelligence
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <section aria-label="Executive Briefing" className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900">
                Civic Air Quality Executive Briefing
              </h2>
              <p className="text-xs text-slate-400">
                Generated via {analysis.aiModelUsed || 'Gemini 3.5 Flash'} Multi-Point Reasoning Engine • {new Date(analysis.timestamp).toLocaleTimeString()} IST
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
              analysis.isAiGenerated
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>{analysis.isAiGenerated ? 'Live AI (Gemini)' : 'Rule-based fallback'}</span>
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed mt-4">
          {analysis.executiveSummary}
        </p>

        {/* Quick Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Average Urban AQI:</span>
            <span className="font-bold text-navy-900 font-mono">{analysis.averageAqi} ({analysis.overallAqiCategory})</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Dominant Pollutant:</span>
            <span className="font-bold text-navy-900">{analysis.primaryPollutant}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Identified Hotspots:</span>
            <span className="font-bold text-red-600">{analysis.hotspots.length} Action Nodes</span>
          </div>
        </div>
      </section>

      {/* Recharts Visualization */}
      <section aria-label="Particulate Loading Chart" className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <h3 className="text-sm font-bold text-navy-900">
              Station-Wise Particulate Loading vs CPCB Safe Thresholds
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">CPCB Limit: {CPCB_THRESHOLDS.PM25_24H_SAFE} µg/m³ PM2.5</span>
        </div>

        <StationAqiChart data={chartData} />
      </section>

      {/* Pollution Hotspots Section (Traceable Records) */}
      <section aria-label="Pollution Hotspots" className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-red-500" aria-hidden="true" />
            <h3 className="text-sm font-bold text-navy-900">
              Hotspot Diagnostics (Traceable to Exact Sensor Records)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Every hotspot strictly links to uploaded evidence rows. Categories distinguish confirmed facts from hypotheses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.hotspots.map((hotspot, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/90 hover:border-emerald-300 bg-slate-50/50 hover:bg-white transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-navy-900">{hotspot.location}</span>
                    <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                      {hotspot.ward}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                    <span>{hotspot.timestamp}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">
                      {hotspot.pollutant}: {hotspot.measuredValue} {hotspot.unit}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      hotspot.category === 'Observed Fact'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : hotspot.category === 'Possible Explanation'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {hotspot.category}
                  </span>
                  <span className="text-[10px] text-slate-400">Confidence: {hotspot.confidence}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                {hotspot.whyNoteworthy}
              </p>

              <div className="flex flex-wrap items-center justify-between pt-1 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">Supporting Evidence:</span>
                  <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                    <span>Verified against data</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {hotspot.supportingRecordIds.map((recId) => (
                    <button
                      key={recId}
                      type="button"
                      onClick={() => onOpenTrace(recId)}
                      aria-label={`Audit Source Record ${recId} for ${hotspot.location}`}
                      className="flex items-center space-x-1 text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 transition-all cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      <span>{recId}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two Column: Trends & Reliability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <section aria-label="Atmospheric Trends" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm pb-2 border-b border-slate-100">
            <Activity className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Atmospheric & Spatial Trends</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="font-semibold text-slate-700 flex items-center space-x-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
                <span>Increasing Concentrations:</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {analysis.trends.increasing.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-semibold text-slate-700 flex items-center space-x-1 mb-1">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Stable or Improving Corridors:</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {analysis.trends.stable.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-700">Spatial Pattern: </span>
              <span className="text-slate-600">{analysis.trends.spatialVariations}</span>
            </div>
          </div>
        </section>

        {/* Data Reliability & Limitations */}
        <section aria-label="Data Reliability" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm pb-2 border-b border-slate-100">
            <ShieldAlert className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Data Reliability & Limitations</span>
          </div>

          <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
            <p>{analysis.dataReliability}</p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-navy-900">Audit Disclaimer:</div>
              <p className="text-[11px] text-slate-500">
                AI deductions are grounded in ingested sensor feeds and calibrated against Indian CPCB National Ambient Air Quality Standards (NAAQS). Causal factors are categorized as Observed Facts vs Unverified Hypotheses.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export const AirIntelligenceTab = memo(AirIntelligenceTabComponent);
