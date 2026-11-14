'use strict';
import React from 'react';
import {
  Sparkles,
  MapPin,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Info,
  Clock,
  CheckCircle2,
  FileCheck2,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { AnalysisResult, AirRecord } from '@/lib/types';

interface AirIntelligenceTabProps {
  analysis: AnalysisResult | null;
  records: AirRecord[];
  onOpenTrace: (recordId: string) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export const AirIntelligenceTab: React.FC<AirIntelligenceTabProps> = ({
  analysis,
  records,
  onOpenTrace,
  onRunAnalysis,
  isAnalyzing,
}) => {
  if (!analysis) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <Sparkles className="w-10 h-10 text-emerald-600 mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-navy-900">No Air Intelligence Generated Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Ingest sensor readings or load the sample dataset to trigger our Gemini-powered civic environmental reasoning engine.
        </p>
        <button
          onClick={onRunAnalysis}
          disabled={records.length === 0 || isAnalyzing}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
        >
          {isAnalyzing ? 'Analyzing...' : 'Generate Air Intelligence'}
        </button>
      </div>
    );
  }

  // Chart data from records
  const chartData = records
    .filter((r) => r.pm25 !== null || r.aqi !== null)
    .slice(0, 8)
    .map((r) => ({
      name: r.location.split(' ')[0],
      fullName: r.location,
      pm25: r.pm25 || 0,
      pm10: r.pm10 || 0,
      aqi: r.aqi || 0,
    }));

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900">
                Civic Air Quality Executive Briefing
              </h2>
              <p className="text-xs text-slate-400">
                Generated via Gemini 2.5 Multi-Point Reasoning Engine • {new Date(analysis.timestamp).toLocaleTimeString()} IST
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{analysis.isAiGenerated ? 'Gemini 2.5 Live' : 'Deterministic Engine Verified'}</span>
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed mt-4">
          {analysis.executiveSummary}
        </p>

        {/* Quick Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Average Urban AQI:</span>
            <span className="font-bold text-navy-900 font-mono">{analysis.averageAqi} ({analysis.overallAqiCategory})</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Dominant Pollutant:</span>
            <span className="font-bold text-navy-900">{analysis.primaryPollutant}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Identified Hotspots:</span>
            <span className="font-bold text-red-600">{analysis.hotspots.length} Action Nodes</span>
          </div>
        </div>
      </div>

      {/* Recharts Visualization */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-navy-900">
              Station-Wise Particulate Loading vs CPCB Safe Thresholds
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">CPCB Limit: 60 µg/m³ PM2.5</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#07111F', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                labelFormatter={(val, items) => items?.[0]?.payload?.fullName || val}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <ReferenceLine y={60} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Safe 60 µg/m³', fill: '#EF4444', fontSize: 10 }} />
              <Bar dataKey="pm25" name="PM2.5 (µg/m³)" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pm10" name="PM10 (µg/m³)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pollution Hotspots Section (Traceable Records) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-red-500" />
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
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-white transition-all space-y-2.5"
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
                    <Clock className="w-3 h-3 text-slate-400" />
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

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Supporting Evidence:</span>
                <div className="flex items-center space-x-1.5">
                  {hotspot.supportingRecordIds.map((recId) => (
                    <button
                      key={recId}
                      onClick={() => onOpenTrace(recId)}
                      className="flex items-center space-x-1 text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-300 transition-all cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{recId}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column: Trends & Reliability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm pb-2 border-b border-slate-100">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Atmospheric & Spatial Trends</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="font-semibold text-slate-700 flex items-center space-x-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-red-500" />
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
                <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                <span>Decreasing / Ventilated Zones:</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {analysis.trends.decreasing.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-700">Spatial Pattern: </span>
              <span className="text-slate-600">{analysis.trends.spatialVariations}</span>
            </div>

            <div>
              <span className="font-semibold text-slate-700">Temporal Cycle: </span>
              <span className="text-slate-600">{analysis.trends.temporalPattern}</span>
            </div>
          </div>
        </div>

        {/* Data Reliability & Limitations */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm pb-2 border-b border-slate-100">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Data Reliability & Limitations Audit</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {analysis.dataReliability}
          </p>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>Scientific Rigor Safeguard</span>
            </div>
            <p className="text-[11px] leading-snug">
              HawaSathi never invents unmeasured values or assumes pollution sources. All findings are anchored in uploaded telemetry records with clear hypothesis demarcation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
