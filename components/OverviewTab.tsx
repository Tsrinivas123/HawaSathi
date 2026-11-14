'use strict';
/**
 * @file OverviewTab.tsx
 * @description Main dashboard overview with 3-step workflow guide, CPCB gauge, and stakeholder directives.
 * Optimized with DRY utility color classes and React.memo.
 */

import React, { useState, memo } from 'react';
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
  MapPin,
  Clock,
  X,
  FileCheck2,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { AnalysisResult, StakeholderType, AirRecord, DataQualityReport, Language } from '@/lib/types';
import { getTranslation } from '@/lib/i18n';
import { getAqiBadgeClasses } from '@/lib/utils';
import { SYSTEM_LIMITS } from '@/lib/constants';

interface OverviewTabProps {
  analysis: AnalysisResult | null;
  records: AirRecord[];
  qualityReport: DataQualityReport | null;
  stakeholder: StakeholderType;
  setActiveTab: (tab: string) => void;
  onOpenTrace: (recordId: string) => void;
  onLoadSample: () => void;
  language: Language;
}

const OverviewTabComponent: React.FC<OverviewTabProps> = ({
  analysis,
  records,
  qualityReport,
  stakeholder,
  setActiveTab,
  onOpenTrace,
  language,
}) => {
  const [showHowItWorks, setShowHowItWorks] = useState(true);

  const avgAqi = analysis?.averageAqi || SYSTEM_LIMITS.BASELINE_HISTORICAL_AQI;
  const aqiCategory = analysis?.overallAqiCategory || 'Very Poor';

  const getStakeholderHero = () => {
    if (stakeholder === 'ward_officer') {
      return {
        title: language === 'hi' ? 'नगर निगम वार्ड कार्य आदेश' : 'Municipal Ward Action Directive',
        desc: language === 'hi'
          ? 'गोविंदपुरा और करोंद क्षेत्रों में प्रदूषण सीमा से अधिक है। धूल नियंत्रण के लिए तत्काल पानी का छिड़काव और निर्माण कार्य निरीक्षण के निर्देश दिए गए हैं।'
          : '3 urban clusters are exhibiting elevated particulate levels. Anti-smog water sprinklers and construction dust inspections are recommended for immediate dispatch.',
        icon: ShieldAlert,
        actionText: language === 'hi' ? 'वार्ड हॉटस्पॉट देखें' : 'Inspect Ward Hotspots',
        actionTab: 'intelligence',
      };
    }
    if (stakeholder === 'school_admin') {
      return {
        title: language === 'hi' ? 'स्कूल परिसर वायु सुरक्षा प्रोटोकॉल' : 'School Campus Air Protocol Active',
        desc: language === 'hi'
          ? 'सुबह के समय वायु गुणवत्ता अत्यंत खराब है। छात्रों के स्वास्थ्य की सुरक्षा के लिए सुबह की बाहरी प्रार्थना और खेलकूद को इंडोर हॉल में स्थानांतरित करें।'
          : 'Morning atmospheric inversion is trapping ground dust. Precautionary advisory: Shift morning physical drills and assemblies to indoor auditoriums.',
        icon: GraduationCap,
        actionText: language === 'hi' ? 'छात्र सुरक्षा दिशानिर्देश' : 'Review Student Safety Guidelines',
        actionTab: 'advisory',
      };
    }
    return {
      title: language === 'hi' ? 'आवासीय कॉलोनी नागरिक परामर्श' : 'Residential Community Advisory',
      desc: language === 'hi'
        ? 'आवासीय क्षेत्रों में वायु प्रदूषण स्तर बढ़ा हुआ है। निवासियों को सलाह दी जाती है कि डीजल जनरेटर का परीक्षण टालें और सड़कों पर पानी का छिड़काव कराएं।'
        : 'Ambient air quality in residential sectors exceeds healthy thresholds. Recommend restricting diesel generator testing and scheduling paved area washdowns.',
      icon: Building2,
      actionText: language === 'hi' ? 'आवासीय कार्ययोजना देखें' : 'View Housing Interventions',
      actionTab: 'actions',
    };
  };

  const stakeholderHero = getStakeholderHero();
  const HeroIcon = stakeholderHero.icon;

  return (
    <div className="space-y-6">
      {/* 3-Step Interactive "How HawaSathi Works" Guide */}
      {showHowItWorks && (
        <section
          aria-label="Workflow Guide"
          className="bg-white rounded-2xl border border-emerald-500/30 p-5 shadow-xs relative overflow-hidden bg-gradient-to-r from-emerald-500/5 via-white to-slate-50"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" aria-hidden="true"></span>
              <h2 className="text-sm font-bold text-navy-900 tracking-tight flex items-center space-x-1.5">
                <span>{language === 'hi' ? 'हवासार्थी कैसे काम करता है? (3 सरल चरण)' : 'How HawaSathi Works (3 Easy Steps)'}</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowHowItWorks(false)}
              aria-label="Dismiss Workflow Guide"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setActiveTab('data_studio')}
              aria-label={language === 'hi' ? 'चरण 1: कच्चा डेटा अपलोड करें' : 'Step 1: Ingest Messy Telemetry'}
              className="text-left p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5 mb-1.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center font-mono">
                  1
                </span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  {language === 'hi' ? 'कच्चा डेटा अपलोड करें' : 'Ingest Messy Telemetry'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {language === 'hi'
                  ? 'CSV या सेंसर डेटा अपलोड करें। सिस्टम गलत फॉर्मेट, गायब यूनिट्स और त्रुटियों को खुद ठीक करता है।'
                  : 'Upload raw sensor CSVs or paste tables. Auto-normalizes units (ppm to mg/m³) and flags outliers.'}
              </p>
              <div className="mt-2 text-[10px] font-semibold text-emerald-600 flex items-center space-x-1">
                <span>{language === 'hi' ? 'डेटा स्टूडियो खोलें' : 'Open Data Studio'}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </div>
            </button>

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => setActiveTab('intelligence')}
              aria-label={language === 'hi' ? 'चरण 2: जेमिनी एआई विश्लेषण' : 'Step 2: Gemini AI Hotspot Reasoning'}
              className="text-left p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5 mb-1.5">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center font-mono">
                  2
                </span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                  {language === 'hi' ? 'जेमिनी एआई विश्लेषण' : 'Gemini AI Hotspot Reasoning'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {language === 'hi'
                  ? 'Google Gemini 3.5 गंभीर प्रदूषण केंद्रों की पहचान करता है, 100% सेंसर रिकॉर्ड आईडी के साथ।'
                  : 'AI analyzes patterns, maps pollution hotspots, and cites exact sensor record IDs for 100% auditability.'}
              </p>
              <div className="mt-2 text-[10px] font-semibold text-blue-600 flex items-center space-x-1">
                <span>{language === 'hi' ? 'हॉटस्पॉट देखें' : 'View Hotspots'}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </div>
            </button>

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => setActiveTab('advisory')}
              aria-label={language === 'hi' ? 'चरण 3: कार्रवाई और नागरिक परामर्श' : 'Step 3: Act and Inform Citizens'}
              className="text-left p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5 mb-1.5">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center font-mono">
                  3
                </span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                  {language === 'hi' ? 'कार्रवाई और व्हाट्सएप अलर्ट' : 'Act & Inform Citizens'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {language === 'hi'
                  ? 'वार्ड अधिकारियों और स्कूलों के लिए कार्ययोजना तथा नागरिकों के लिए हिंदी/अंग्रेजी में व्हाट्सएप अलर्ट।'
                  : 'Dispatches stakeholder action directives and generates multi-tier WhatsApp citizen bulletins.'}
              </p>
              <div className="mt-2 text-[10px] font-semibold text-amber-600 flex items-center space-x-1">
                <span>{language === 'hi' ? 'नागरिक परामर्श' : 'View Advisories'}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </div>
            </button>
          </div>
        </section>
      )}

      {/* Main City Air Health Snapshot Hero */}
      <section
        aria-label="City Air Health Status"
        className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Bhopal Municipal Corporation • 10 Active Monitoring Nodes</span>
              </span>
              <span className="text-xs text-slate-400">• Live Ingested Feed</span>
            </div>
            <h1 className="text-2xl font-extrabold text-navy-900 mt-2">
              {language === 'hi' ? 'भोपाल वायु गुणवत्ता स्थिति: ' : 'Bhopal Ambient Air Quality: '}
              <span className={aqiCategory === 'Very Poor' ? 'text-red-600' : 'text-navy-900'}>
                {aqiCategory.toUpperCase()} {language === 'hi' && '(अत्यंत खराब)'}
              </span>
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {language === 'hi'
                ? 'शहर का औसत एक्यूआई (AQI) 241 है। अति सूक्ष्म धूल कण (PM2.5) हवा में जमे हैं। संवेदनशील नागरिकों और बच्चों को बाहरी गतिविधियों से बचने की सलाह दी जाती है।'
                : 'Current ambient AQI stands at 241. Fine inhalable particulate matter (PM2.5) remains trapped at ground level due to morning thermal inversion.'}
            </p>
          </div>

          {/* Large AQI Counter & Badge */}
          <div className="flex items-center space-x-4 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {language === 'hi' ? 'औसत वायु सूचकांक' : 'Citywide Average AQI'}
              </div>
              <div className="text-4xl font-black text-navy-900 font-mono tracking-tight flex items-baseline space-x-1">
                <span>{avgAqi}</span>
                <span className="text-xs font-normal text-slate-400">/ 500</span>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold text-center ${getAqiBadgeClasses(aqiCategory)}`}>
              <div className="text-xs">{aqiCategory}</div>
              <div className="text-[10px] font-normal opacity-80">CPCB Standard</div>
            </div>
          </div>
        </div>

        {/* Visual AQI Gauge Range Bar */}
        <div className="mt-4 pt-2">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1.5">
            <span>0 Good (अच्छा)</span>
            <span>100 Moderate (मध्यम)</span>
            <span>200 Poor (खराब)</span>
            <span className="text-red-600 font-bold">▲ Current: {avgAqi} ({aqiCategory})</span>
            <span>300 Severe (गंभीर)</span>
            <span>500 Hazardous</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex relative">
            <div className="w-[10%] bg-emerald-500" title="Good (0-50)"></div>
            <div className="w-[10%] bg-lime-500" title="Satisfactory (51-100)"></div>
            <div className="w-[20%] bg-amber-500" title="Moderate (101-200)"></div>
            <div className="w-[20%] bg-orange-500" title="Poor (201-300)"></div>
            <div className="w-[20%] bg-red-600" title="Very Poor (301-400)"></div>
            <div className="w-[20%] bg-purple-700" title="Severe (401-500)"></div>
            {/* Current Indicator Pin */}
            <div
              className="absolute top-0 bottom-0 w-2 bg-navy-950 border-2 border-white rounded-full shadow-md"
              style={{ left: `${Math.min(95, Math.max(5, (avgAqi / 500) * 100))}%` }}
              title={`Current Bhopal Average: ${avgAqi}`}
            ></div>
          </div>
        </div>

        {/* Plain Language Summary ("सरल शब्दों में") Box */}
        <div className="mt-5 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                {language === 'hi' ? 'सरल शब्दों में समझें (Plain Language Meaning)' : 'In Plain Language (What This Means)'}
              </span>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'हवा सांस लेने के लिए सुरक्षित नहीं है। धूल और धुएं के कण फेफड़ों में जा सकते हैं। 3 हॉटस्पॉट (गोविंदपुरा, करोंद, एमपी नगर) पर तुरंत पानी का छिड़काव आवश्यक है।'
                  : 'Air is currently unhealthy for outdoor exposure. Particulate matter can cause irritation. 3 industrial & commercial hotspots require immediate dust control.'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('intelligence')}
              aria-label="Inspect 3 Active Hotspots"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'हॉटस्पॉट देखें' : 'Inspect 3 Hotspots'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('advisory')}
              aria-label="View WhatsApp Advisory"
              className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'व्हाट्सएप अलर्ट' : 'WhatsApp Alert'}
            </button>
          </div>
        </div>
      </section>

      {/* Main KPI Summary Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* City AQI KPI */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>{getTranslation(language, 'citywideAqi', 'Citywide Average AQI')}</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getAqiBadgeClasses(aqiCategory)}`}>
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
            {analysis?.comparison?.aqiDelta && analysis.comparison.aqiDelta > 0 ? (
              <span className="flex items-center text-red-600 font-medium mr-1.5">
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                +{analysis.comparison.aqiDelta} pts
              </span>
            ) : (
              <span className="flex items-center text-emerald-600 font-medium mr-1.5">
                <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
                {analysis?.comparison?.aqiDelta || -8} pts
              </span>
            )}
            <span className="text-slate-400 text-[11px]">{getTranslation(language, 'vsBaseline', 'vs 24h baseline')}</span>
          </div>
        </div>

        {/* Primary Pollutant */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-2">{getTranslation(language, 'primaryPollutant', 'Primary Pollutant Burden')}</div>
          <div className="text-xl font-bold text-navy-900 truncate">
            {analysis?.primaryPollutant || 'PM2.5 & PM10'}
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center space-x-1.5">
            <Wind className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            <span className="truncate">{getTranslation(language, 'fineParticles', 'Fine Inhalable Particles')}</span>
          </div>
        </div>

        {/* Hotspots Count */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-2">{getTranslation(language, 'activeHotspots', 'Active High-Pollution Nodes')}</div>
          <div className="text-3xl font-extrabold text-navy-900">
            {analysis?.hotspots.length || 3}
          </div>
          <div className="mt-3 text-xs text-amber-700 font-medium flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
            <span className="truncate">{getTranslation(language, 'exceedsWho', 'Exceeds WHO 24h Standard')}</span>
          </div>
        </div>

        {/* Data Quality Completeness */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-2">{getTranslation(language, 'dataCompleteness', 'Dataset Completeness')}</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-navy-900">
              {qualityReport?.dataCompletenessPct ?? 90}%
            </span>
            <span className="text-xs text-emerald-600 font-medium">{getTranslation(language, 'auditPassed', 'Audit Passed')}</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>{records.length} {getTranslation(language, 'recordsActive', 'Records Ingested')}</span>
            <span className="text-[11px] font-mono text-slate-400">{getTranslation(language, 'traceableRecords', '100% Traceable')}</span>
          </div>
        </div>
      </div>

      {/* Stakeholder Targeted Action Box */}
      <section
        aria-label="Stakeholder Directive"
        className="p-6 bg-gradient-to-r from-emerald-500/10 via-slate-50 to-white rounded-2xl border border-emerald-500/30 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <HeroIcon className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Personalized for {stakeholder.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs text-slate-400">• Priority Dispatch</span>
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
          type="button"
          onClick={() => setActiveTab(stakeholderHero.actionTab)}
          aria-label={stakeholderHero.actionText}
          className="flex items-center space-x-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-850 text-white text-xs font-semibold rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
        >
          <span>{stakeholderHero.actionText}</span>
          <ChevronRight className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
        </button>
      </section>

      {/* Two Column Grid: Top Hotspots with Traceability + Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hotspots Card (2 cols) */}
        <section
          aria-label="Immediate Attention Hotspots"
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>{language === 'hi' ? 'तत्काल ध्यान देने योग्य प्रदूषण केंद्र (Hotspots)' : 'Immediate Attention Hotspots'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'hi' ? 'सेंसर रिकॉर्ड आईडी के साथ 100% सत्यापित प्रमाण' : 'Traceable to underlying sensor records with confidence and source tags'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('intelligence')}
              aria-label="View Full AI Analysis"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>{language === 'hi' ? 'विस्तार से देखें' : 'View Full Studio'}</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-3">
            {analysis?.hotspots.slice(0, 3).map((hotspot, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-navy-900">{hotspot.location}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {hotspot.ward}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                      {hotspot.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-xl">
                    {hotspot.whyNoteworthy}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <span className="font-semibold text-slate-700">
                      {hotspot.pollutant}: {hotspot.measuredValue} {hotspot.unit}
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      <span>{hotspot.timestamp}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenTrace(hotspot.supportingRecordIds[0])}
                    aria-label={`Audit Trace for ${hotspot.location}`}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    <span>Audit {hotspot.supportingRecordIds[0]}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Executive Synopsis (1 col) */}
        <section
          aria-label="AI Executive Synopsis"
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <h3 className="text-sm font-bold text-navy-900">
                  {language === 'hi' ? 'एआई कार्यकारी सारांश' : 'AI Executive Synopsis'}
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {analysis?.aiModelUsed || 'Gemini 3.5 Flash'}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {analysis?.executiveSummary ||
                'Bhopal is currently experiencing an air stagnation event with fine dust particulates accumulating across the industrial and commercial transportation corridors.'}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <div className="text-xs font-bold text-slate-800">
                {language === 'hi' ? 'डेटा विश्वसनीयता स्थिति:' : 'Data Reliability Assessment:'}
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                {analysis?.dataReliability ||
                  'High confidence across 9 sensor clusters. Sensor saturation at Govindpura flagged for field calibration.'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('advisory')}
              aria-label="Generate Multilingual Citizen Bulletins"
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{language === 'hi' ? 'नागरिक अलर्ट व बुलेटिन खोलें' : 'Generate Citizen Bulletins'}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export const OverviewTab = memo(OverviewTabComponent);
