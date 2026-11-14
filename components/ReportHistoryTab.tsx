'use strict';
import React from 'react';
import {
  History,
  GitCompare,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import { PREVIOUS_BRIEFING_RECORD } from '@/lib/sampleData';

interface ReportHistoryTabProps {
  analysis: AnalysisResult | null;
}

export const ReportHistoryTab: React.FC<ReportHistoryTabProps> = ({ analysis }) => {
  const comparison = analysis?.comparison;
  const avgAqi = analysis?.averageAqi || 241;
  const delta = comparison ? comparison.aqiDelta : avgAqi - PREVIOUS_BRIEFING_RECORD.averageAqi;
  const isWorse = delta > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section aria-label="Briefing Comparison Header" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-navy-900 flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <span>Briefing Comparison & Historical Delta Studio</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Requirement 8: Automated comparison between current briefing and T-24h municipal baseline.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
          Baseline: 24 Hours Ago
        </span>
      </section>

      {/* Side-by-Side Comparison KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Previous Briefing */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Previous Briefing (T-24h)</span>
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              Archived
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-700 font-mono">
              {PREVIOUS_BRIEFING_RECORD.averageAqi}
            </span>
            <span className="text-xs font-semibold text-amber-600">
              {PREVIOUS_BRIEFING_RECORD.aqiCategory}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            <strong>Key Hotspots:</strong> {PREVIOUS_BRIEFING_RECORD.primaryHotspots.join(', ')}
          </div>
        </div>

        {/* Current Active Briefing */}
        <div className="bg-white rounded-2xl border border-emerald-300 p-5 shadow-2xs space-y-2 bg-emerald-50/20">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Current Ingested Briefing</span>
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
              Live
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-navy-900 font-mono">{avgAqi}</span>
            <span className="text-xs font-semibold text-orange-600">
              {analysis?.overallAqiCategory || 'Very Poor'}
            </span>
          </div>
          <div className="text-xs text-slate-600">
            <strong>Active Hotspots:</strong>{' '}
            {analysis?.hotspots.map((h) => h.location.split(' ')[0]).join(', ') || 'Govindpura, Karond'}
          </div>
        </div>

        {/* Net Shift Delta */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="text-xs text-slate-500 font-medium">Net Citywide Atmospheric Shift</div>
          <div className="flex items-center space-x-2">
            {isWorse ? (
              <div className="flex items-center space-x-1 text-red-600">
                <ArrowUpRight className="w-7 h-7" aria-hidden="true" />
                <span className="text-3xl font-extrabold font-mono">+{delta}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-emerald-600">
                <ArrowDownRight className="w-7 h-7" aria-hidden="true" />
                <span className="text-3xl font-extrabold font-mono">{delta}</span>
              </div>
            )}
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                isWorse ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {comparison?.aqiTrend || (isWorse ? 'Deteriorated' : 'Improved')}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {isWorse
              ? 'Pollution increased due to thermal inversion & vehicle load'
              : 'Ambient dispersion aided by wind ventilation'}
          </div>
        </div>
      </div>

      {/* Detailed Diff Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hotspots Evolution */}
        <section aria-label="Hotspots Evolution" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm pb-2 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span>Hotspots Evolution (New vs Resolved)</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="font-semibold text-red-700 flex items-center space-x-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Newly Emerged Hotspots (Requires Immediate Response):</span>
              </div>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                {(comparison?.newHotspots || ['Karond Krishi Upaj Mandi (Heavy freight dust loading)']).map(
                  (item, idx) => (
                    <li key={idx} className="font-medium text-slate-800">
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="font-semibold text-emerald-700 flex items-center space-x-1 mb-1">
                <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Resolved / Improved Nodes (Previous Interventions Succeeded):</span>
              </div>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                {(comparison?.resolvedHotspots || ['Shahpura Lake Promenade (Returned to Moderate AQI 115)']).map(
                  (item, idx) => (
                    <li key={idx} className="font-medium text-slate-800">
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* Intervention Audit & Narrative Diff */}
        <section aria-label="Intervention Efficacy" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Intervention Efficacy & Comparative Narrative</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-800 block mb-1">
                Efficacy of Yesterday's Implemented Actions:
              </span>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {comparison?.interventionEffectiveness ||
                  'Mist cannon mobilization mitigated rapid localized deterioration in Central Bhopal, though ambient inversion prevented full dispersion.'}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-800 block mb-1">
                AI Comparative Summary Diff:
              </span>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {comparison?.narrativeDiff ||
                  'Citywide AQI shows persistent particulate stress. Morning inversion trapped fine emissions across northern commercial nodes.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
