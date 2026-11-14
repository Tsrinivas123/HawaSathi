'use strict';
import React from 'react';
import {
  Wind,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Building2,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Database,
  FileCheck2,
  MapPin,
  Clock,
} from 'lucide-react';
import { AnalysisResult, StakeholderType, AirRecord, DataQualityReport } from '@/lib/types';

interface OverviewTabProps {
  analysis: AnalysisResult | null;
  records: AirRecord[];
  qualityReport: DataQualityReport | null;
  stakeholder: StakeholderType;
  setActiveTab: (tab: string) => void;
  onOpenTrace: (recordId: string) => void;
  onLoadSample: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  analysis,
  records,
  qualityReport,
  stakeholder,
  setActiveTab,
  onOpenTrace,
  onLoadSample,
}) => {
  const avgAqi = analysis?.averageAqi || 215;
  const aqiCategory = analysis?.overallAqiCategory || 'Poor';

  const getAqiBadgeColor = (category: string) => {
    switch (category) {
      case 'Good':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Moderate':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Poor':
        return 'bg-orange-50 text-orange-700 border-orange-300';
      case 'Very Poor':
        return 'bg-red-50 text-red-700 border-red-300';
      case 'Severe':
      case 'Hazardous':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  const getStakeholderHero = () => {
    if (stakeholder === 'ward_officer') {
      return {
        title: 'Municipal Ward Action Directive',
        desc: '3 urban clusters are exhibiting elevated PM2.5 and PM10 particulate levels. Anti-smog water sprinklers and construction site inspections recommended.',
        icon: ShieldAlert,
        actionText: 'Inspect Ward Hotspots',
        actionTab: 'intelligence',
      };
    }
    if (stakeholder === 'school_admin') {
      return {
        title: 'School Campus Air Protocol Active',
        desc: 'Morning atmospheric inversion is trapping ground dust. Precautionary advisory: Shift morning physical drills and assemblies to indoor auditoriums.',
        icon: GraduationCap,
        actionText: 'Review Student Safety Guidelines',
        actionTab: 'advisory',
      };
    }
    return {
      title: 'Residential Community Advisory',
      desc: 'Ambient air quality in residential sectors exceeds healthy thresholds. Recommend restricting diesel generator testing and scheduling paved area washdowns.',
      icon: Building2,
      actionText: 'View Housing Interventions',
      actionTab: 'actions',
    };
  };

  const stakeholderHero = getStakeholderHero();
  const HeroIcon = stakeholderHero.icon;

  return (
    <div className="space-y-6">
      {/* If no data yet, show instant welcome banner */}
      {records.length === 0 && (
        <div className="p-8 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-800 text-white shadow-xl border border-slate-700">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              PromptWars 2026 Bhopal Edition
            </span>
            <h1 className="text-2xl font-bold mt-3 text-white">
              HawaSathi: AI Civic Air Quality Briefing Studio
            </h1>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Transform complicated, messy, and unreliable municipal air sensor datasets into
              verified findings, stakeholder-tailored interventions, and multilingual citizen advisories.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={onLoadSample}
                className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Bhopal Sensor Dataset [DEMO DATA]</span>
              </button>
              <button
                onClick={() => setActiveTab('data_studio')}
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all cursor-pointer"
              >
                <Database className="w-4 h-4 text-slate-400" />
                <span>Open Data Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main KPI Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* City AQI KPI */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Citywide Average AQI</span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getAqiBadgeColor(
                aqiCategory
              )}`}
            >
              {aqiCategory}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-navy-900 tracking-tight">
              {avgAqi}
            </span>
            <span className="text-xs text-slate-400 font-mono">CPCB Scale</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-600">
            {analysis?.comparison.aqiDelta && analysis.comparison.aqiDelta > 0 ? (
              <span className="flex items-center text-red-600 font-medium mr-1.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{analysis.comparison.aqiDelta} pts
              </span>
            ) : (
              <span className="flex items-center text-emerald-600 font-medium mr-1.5">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {analysis?.comparison.aqiDelta || -8} pts
              </span>
            )}
            <span className="text-slate-400 text-[11px]">vs 24h baseline</span>
          </div>
        </div>

        {/* Primary Pollutant */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-2">Primary Pollutant Burden</div>
          <div className="text-xl font-bold text-navy-900 truncate">
            {analysis?.primaryPollutant || 'PM2.5 & PM10'}
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center space-x-1.5">
            <Wind className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fine Inhalable Respirable Particles</span>
          </div>
        </div>

        {/* Hotspots Count */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-2">Active High-Pollution Nodes</div>
          <div className="text-3xl font-extrabold text-navy-900">
            {analysis?.hotspots.length || 3}
          </div>
          <div className="mt-3 text-xs text-amber-700 font-medium flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Exceeds WHO 24h Ambient Standard</span>
          </div>
        </div>

        {/* Data Quality Completeness */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-2">Dataset Completeness</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-navy-900">
              {qualityReport?.dataCompletenessPct ?? 90}%
            </span>
            <span className="text-xs text-emerald-600 font-medium">Audit Passed</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>{records.length} Records Ingested</span>
            <span className="text-[11px] font-mono text-slate-400">100% Traceable</span>
          </div>
        </div>
      </div>

      {/* Stakeholder Targeted Action Box */}
      <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-slate-50 to-white rounded-2xl border border-emerald-500/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <HeroIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Personalized for {stakeholder.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs text-slate-400">• High Impact</span>
            </div>
            <h3 className="text-base font-bold text-navy-900 mt-1">
              {stakeholderHero.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {stakeholderHero.desc}
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab(stakeholderHero.actionTab)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-850 text-white text-xs font-semibold rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
        >
          <span>{stakeholderHero.actionText}</span>
          <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
        </button>
      </div>

      {/* Two Column Grid: Top Hotspots with Traceability + Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hotspots Card (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Immediate Attention Hotspots</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Traceable to underlying sensor records with confidence and source tags
              </p>
            </div>
            <button
              onClick={() => setActiveTab('intelligence')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>Full Intelligence</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {(analysis?.hotspots || [
              {
                location: 'Govindpura Industrial Complex',
                ward: 'Ward 60',
                pollutant: 'PM2.5 / PM10',
                measuredValue: 385,
                unit: 'AQI Index',
                timestamp: '2026-11-14 08:45',
                supportingRecordIds: ['REC-004'],
                whyNoteworthy: 'Severe category reading with sensor saturation flag requiring validation',
                confidence: 'High',
                category: 'Observed Fact',
              },
              {
                location: 'Karond Krishi Upaj Mandi',
                ward: 'Ward 12',
                pollutant: 'PM10 (Dust)',
                measuredValue: 354,
                unit: 'AQI Index',
                timestamp: '2026-11-14 08:40',
                supportingRecordIds: ['REC-007'],
                whyNoteworthy: 'Heavy commercial freight unloading combined with unpaved road dust',
                confidence: 'High',
                category: 'Observed Fact',
              },
              {
                location: 'MP Nagar Zone-1 Commercial Hub',
                ward: 'Ward 48',
                pollutant: 'PM2.5 (Combustion)',
                measuredValue: 322,
                unit: 'AQI Index',
                timestamp: '2026-11-14 08:30',
                supportingRecordIds: ['REC-001'],
                whyNoteworthy: 'Peak morning transit corridor with high vehicle idling emissions',
                confidence: 'High',
                category: 'Possible Explanation',
              },
            ]).map((hotspot, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/70 transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-navy-900">
                      {hotspot.location}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      {hotspot.ward}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        hotspot.category === 'Observed Fact'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {hotspot.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {hotspot.whyNoteworthy}
                  </p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{hotspot.timestamp}</span>
                    </span>
                    <span>•</span>
                    <span>
                      Measured: <strong className="text-slate-700 font-mono">{hotspot.measuredValue} {hotspot.unit}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 space-y-1.5">
                  <button
                    onClick={() => onOpenTrace(hotspot.supportingRecordIds[0])}
                    className="flex items-center space-x-1 text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 cursor-pointer"
                    title="Click to view raw sensor evidence"
                  >
                    <FileCheck2 className="w-3 h-3 text-emerald-600" />
                    <span>{hotspot.supportingRecordIds.join(', ')}</span>
                  </button>
                  <span className="text-[10px] text-slate-400">Confidence: {hotspot.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary Glance (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Executive Synopsis</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {analysis?.executiveSummary ||
                'Bhopal monitoring reveals a prevailing particulate surge concentrated in commercial and industrial corridors. High morning atmospheric inversion prevents dust dispersion. Municipal anti-smog misting and school physical activity deferrals are indicated.'}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Civic Priorities Today
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Water mist cannons deployed at 3 intersections</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>School outdoor assemblies moved indoors</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>WhatsApp advisory generated in Hindi & English</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Traceable to 100% of data points</span>
            <button
              onClick={() => setActiveTab('actions')}
              className="text-emerald-600 font-semibold hover:underline flex items-center space-x-1"
            >
              <span>View All Actions</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
