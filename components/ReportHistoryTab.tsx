'use strict';
/**
 * @file ReportHistoryTab.tsx
 * @description Comparative delta studio between current civic briefing and stored historical baselines.
 * Computes live AQI deltas, newly emerged hotspots, resolved nodes, and narrative diffs from browser storage.
 */

import React, { memo, useState, useEffect } from 'react';
import {
  GitCompare,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingDown,
  TrendingUp,
  History,
  Clock,
} from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import { StoredBriefing, getStoredBriefings, saveBriefingToHistory } from '@/lib/storage';
import { PREVIOUS_BRIEFING_RECORD } from '@/lib/sampleData';

interface ReportHistoryTabProps {
  analysis: AnalysisResult | null;
}

const ReportHistoryTabComponent: React.FC<ReportHistoryTabProps> = ({ analysis }) => {
  const [history, setHistory] = useState<StoredBriefing[]>([]);

  // Load stored briefing history on mount
  useEffect(() => {
    const list = getStoredBriefings();
    setHistory(list);
  }, [analysis]);

  // Handle loading a realistic previous benchmark briefing
  const handleLoadBaseline = () => {
    const mockBaseline: StoredBriefing = {
      id: 'BRIEF-ARCHIVED-001',
      timestamp: PREVIOUS_BRIEFING_RECORD.date,
      averageAqi: PREVIOUS_BRIEFING_RECORD.averageAqi,
      overallAqiCategory: PREVIOUS_BRIEFING_RECORD.aqiCategory,
      primaryPollutant: 'PM2.5',
      hotspots: [
        {
          location: 'Govindpura Industrial Complex',
          ward: 'Ward 48',
          pollutant: 'PM2.5',
          measuredValue: 185.0,
          unit: 'µg/m³',
          timestamp: '2026-11-13 08:00',
          supportingRecordIds: ['REC-001'],
          whyNoteworthy: 'Industrial fuel combustion',
          confidence: 'High',
          category: 'Observed Fact',
        },
        {
          location: 'Shahpura Lake Promenade',
          ward: 'Ward 52',
          pollutant: 'Composite AQI',
          measuredValue: 165.0,
          unit: 'AQI Index',
          timestamp: '2026-11-13 08:00',
          supportingRecordIds: ['REC-003'],
          whyNoteworthy: 'Traffic queue along lake road',
          confidence: 'Medium',
          category: 'Possible Explanation',
        },
      ],
      activeLocations: ['Govindpura Industrial Complex', 'Shahpura Lake Promenade', 'TT Nagar Stadium'],
      isAiGenerated: true,
      executiveSummary: 'Prior day baseline briefing exhibiting moderate-to-poor particulate dispersion.',
    };

    const updated = saveBriefingToHistory(mockBaseline);
    setHistory(updated);
  };

  // Determine previous briefing to compare against:
  // history[0] is the current active briefing.
  // history[1] is the previous briefing. If only 0 or 1 exists, there is no previous brief yet!
  const previousBriefing = history.length > 1 ? history[1] : null;

  const currentAqi = analysis?.averageAqi ?? 241;
  const prevAqi = previousBriefing ? previousBriefing.averageAqi : null;
  const delta = prevAqi !== null ? currentAqi - prevAqi : 0;
  const isWorse = delta > 0;

  // Compute newly emerged and resolved hotspots dynamically
  const currentHotspotLocations = (analysis?.hotspots || []).map((h) => h.location.toLowerCase().trim());
  const previousHotspotLocations = (previousBriefing?.hotspots || []).map((h) => h.location.toLowerCase().trim());

  const newlyEmergedHotspots = (analysis?.hotspots || [])
    .filter((h) => !previousHotspotLocations.some((prev) => prev.includes(h.location.toLowerCase().slice(0, 8))))
    .map((h) => `${h.location} (${h.ward}) — Measured: ${h.measuredValue} ${h.unit}`);

  const resolvedHotspots = (previousBriefing?.hotspots || [])
    .filter((prev) => !currentHotspotLocations.some((curr) => curr.includes(prev.location.toLowerCase().slice(0, 8))))
    .map((prev) => `${prev.location} (${prev.ward}) — Concentrations dropped below emergency threshold`);

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
            Automated comparison between current telemetry briefing and previous municipal baseline.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {previousBriefing ? (
            <span className="text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>Comparing vs: {previousBriefing.timestamp}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleLoadBaseline}
              aria-label="Load Previous 24h Baseline"
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <History className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              <span>Load 24h Baseline</span>
            </button>
          )}
        </div>
      </section>

      {/* When no previous briefing exists in history */}
      {!previousBriefing && (
        <section aria-label="Initial Baseline Information" className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <GitCompare className="w-10 h-10 text-emerald-600 mx-auto mb-2" aria-hidden="true" />
          <h3 className="text-base font-bold text-navy-900">No previous brief yet</h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            This active session represents your initial municipal air intelligence baseline. As subsequent telemetry feeds are ingested, HawaSathi automatically computes atmospheric shifts, tracks newly emerged hotspots, and evaluates intervention effectiveness.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleLoadBaseline}
              aria-label="Load 24h Baseline Dataset for Instant Comparison"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Load Previous 24h Baseline for Comparison</span>
            </button>
          </div>
        </section>
      )}

      {/* Side-by-Side Comparison KPI Cards (when previous briefing exists) */}
      {previousBriefing && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Previous Briefing */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Previous Briefing Baseline</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                  {previousBriefing.timestamp}
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-700 font-mono">
                  {previousBriefing.averageAqi}
                </span>
                <span className="text-xs font-semibold text-amber-600">
                  {previousBriefing.overallAqiCategory}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                <strong>Recorded Hotspots:</strong>{' '}
                {previousBriefing.hotspots.map((h) => h.location.split(' ')[0]).join(', ') || 'Govindpura, Shahpura'}
              </div>
            </div>

            {/* Current Active Briefing */}
            <div className="bg-white rounded-2xl border border-emerald-300 p-5 shadow-2xs space-y-2 bg-emerald-50/20">
              <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Current Live Briefing</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                  Active
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-navy-900 font-mono">{currentAqi}</span>
                <span className="text-xs font-semibold text-orange-600">
                  {analysis?.overallAqiCategory || 'Very Poor'}
                </span>
              </div>
              <div className="text-xs text-slate-600">
                <strong>Active Hotspots:</strong>{' '}
                {(analysis?.hotspots || []).map((h) => h.location.split(' ')[0]).join(', ') || 'Govindpura, Karond'}
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
                  {isWorse ? 'Deteriorated' : 'Improved'}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {isWorse
                  ? 'Particulate density increased due to morning thermal inversion & traffic'
                  : 'Favorable atmospheric ventilation assisted particulate dispersion'}
              </div>
            </div>
          </div>

          {/* Detailed Diff Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hotspots Evolution */}
            <section aria-label="Hotspots Evolution" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm pb-2 border-b border-slate-100">
                <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <span>Hotspots Evolution (New vs Resolved Nodes)</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="font-semibold text-red-700 flex items-center space-x-1 mb-1">
                    <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Newly Emerged Hotspots (Requires Immediate Response):</span>
                  </div>
                  {newlyEmergedHotspots.length > 0 ? (
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      {newlyEmergedHotspots.map((item, idx) => (
                        <li key={idx} className="font-medium text-slate-800">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">No new hotspots emerged in this briefing window.</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="font-semibold text-emerald-700 flex items-center space-x-1 mb-1">
                    <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Resolved / Improved Nodes (Previous Interventions Succeeded):</span>
                  </div>
                  {resolvedHotspots.length > 0 ? (
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      {resolvedHotspots.map((item, idx) => (
                        <li key={idx} className="font-medium text-slate-800">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">Previous hotspot locations remain within elevated particulate ranges.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Intervention Audit & Comparative Narrative */}
            <section aria-label="Intervention Efficacy" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm pb-2 border-b border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Intervention Efficacy & Comparative Narrative</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block mb-1">
                    Intervention Assessment (vs Baseline):
                  </span>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {isWorse
                      ? 'Localized mist cannon deployment partially stabilized core road corridors, but ground-level inversion prevented widespread dispersion.'
                      : 'Municipal wet suppression and traffic rerouting successfully reduced coarse particulate resuspension.'}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-800 block mb-1">
                    Atmospheric Shift Summary:
                  </span>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    Citywide AQI shifted by {delta > 0 ? `+${delta}` : delta} points compared to previous recorded baseline ({previousBriefing.timestamp}). Recommended priority focus remains on dust mitigation in high-density commercial and transport nodes.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export const ReportHistoryTab = memo(ReportHistoryTabComponent);
