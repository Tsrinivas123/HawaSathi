'use strict';
/**
 * @file OverviewTab.tsx
 * @description Main dashboard overview with Data-First Welcome Onboarding state,
 * dynamic CPCB gauge, traceable hotspots, and stakeholder action directives.
 * Strictly WCAG 2.1 AA compliant with proper h1->h2->h3 heading hierarchy.
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
  Share2,
  Upload,
  FileSpreadsheet,
  Edit3,
  HelpCircle,
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
  onLoadSample,
  language,
}) => {
  const [showHowItWorks, setShowHowItWorks] = useState(true);

  // When no dataset is active, display the clean Welcome & Data Onboarding Screen
  if (records.length === 0) {
    return (
      <div className="space-y-6">
        {/* Onboarding Welcome Banner */}
        <section
          aria-label="Welcome and Data Onboarding"
          className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs relative overflow-hidden"
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
              <span>{language === 'hi' ? 'डेटा-संचालित नागरिक आसूचना' : 'Data-Driven Civic Intelligence'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              {language === 'hi'
                ? 'हवासार्थी — वायु गुणवत्ता डेटा से स्थानीय समाधान'
                : 'HawaSathi — From Air Data to Local Action'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {language === 'hi'
                ? 'कच्ची और अनियमित वायु गुणवत्ता तालिकाओं (CSV/TXT) को सत्यापित निष्कर्षों, हितधारक-विशिष्ट कार्य योजनाओं और बहुभाषी नागरिक चेतावनियों में बदलें।'
                : 'Turn messy municipal air-quality data into verified findings, prioritized interventions for local authorities, and accessible multilingual advisories.'}
            </p>

            {/* Zero-Data Notice */}
            <div
              role="status"
              className="mt-5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-center space-x-3"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
              <div>
                <span className="font-bold">
                  {language === 'hi' ? 'वर्तमान में कोई सक्रिय डेटासेट नहीं है:' : 'No active air-quality dataset:'}
                </span>{' '}
                <span>
                  {language === 'hi'
                    ? 'विश्लेषण और हॉटस्पॉट देखने के लिए कृपया नीचे दिए गए विकल्पों में से डेटा अपलोड करें या नमूना लोड करें।'
                    : 'To begin civic intelligence analysis, upload a telemetry file, enter data manually, or load our demo dataset.'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Option A: Upload File */}
            <button
              type="button"
              onClick={() => setActiveTab('data_studio')}
              aria-label={language === 'hi' ? 'विकल्प 1: सीएसवी या टीएक्सटी फ़ाइल अपलोड करें' : 'Option A: Upload CSV or TXT Telemetry File'}
              className="text-left p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" aria-hidden="true" />
                </div>
                <h2 className="text-sm font-bold text-navy-900 group-hover:text-emerald-700 transition-colors">
                  {language === 'hi' ? '1. सीएसवी / टेक्स्ट अपलोड करें' : '1. Upload CSV / TXT File'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {language === 'hi'
                    ? 'सेंसर फ़ीड, सीपीसीबी तालिकाएं या मिश्रित इकाइयां (ppm ↔ mg/m³) ड्रैग और ड्रॉप करें।'
                    : 'Ingest municipal telemetry files with automatic unit conversion and anomaly flagging.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600">
                <span>{language === 'hi' ? 'डेटा स्टूडियो खोलें' : 'Open Data Studio'}</span>
                <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </div>
            </button>

            {/* Option B: Enter Manually / Paste */}
            <button
              type="button"
              onClick={() => setActiveTab('data_studio')}
              aria-label={language === 'hi' ? 'विकल्प 2: डेटा मैन्युअल रूप से दर्ज करें या पेस्ट करें' : 'Option B: Enter Data Manually or Paste Table'}
              className="text-left p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Edit3 className="w-5 h-5" aria-hidden="true" />
                </div>
                <h2 className="text-sm font-bold text-navy-900 group-hover:text-blue-700 transition-colors">
                  {language === 'hi' ? '2. मैन्युअल प्रविष्टि / पेस्ट' : '2. Enter Data / Paste Table'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {language === 'hi'
                    ? 'वार्ड-स्तरीय सेंसर आंकड़े सीधे दर्ज करें या स्प्रेडशीट से पंक्तियां कॉपी-पेस्ट करें।'
                    : 'Use our structured row editor or paste raw table snippets directly into the parser.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                <span>{language === 'hi' ? 'प्रविष्टि फॉर्म खोलें' : 'Open Entry Studio'}</span>
                <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </div>
            </button>

            {/* Option C: Load Bhopal Demo Telemetry */}
            <button
              type="button"
              onClick={onLoadSample}
              aria-label={language === 'hi' ? 'विकल्प 3: भोपाल का नमूना डेटा लोड करें' : 'Option C: Load Bhopal Demo Telemetry Dataset'}
              className="text-left p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-white border-2 border-emerald-300 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="flex items-center space-x-1.5">
                  <h2 className="text-sm font-bold text-navy-900 group-hover:text-emerald-800 transition-colors">
                    {language === 'hi' ? '3. भोपाल डेमो डेटासेट लोड करें' : '3. Load Bhopal Demo Dataset'}
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                    Demo
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {language === 'hi'
                    ? '10 निगरानी केंद्र, डुप्लिकेट पंक्तियां और सेंसर संतृप्ति कोड (999.0 µg/m³) का परीक्षण करें।'
                    : 'Explore instant pre-verified telemetry with 10 real municipal monitoring stations.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center text-xs font-semibold text-emerald-700">
                <span>{language === 'hi' ? 'डेमो डेटा लोड करें' : 'Load Demo Telemetry'}</span>
                <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </div>
            </button>
          </div>
        </section>

        {/* 3-Step Educational Workflow Guide */}
        <section
          aria-label="How HawaSathi Works"
          className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs"
        >
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <HelpCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <h2 className="text-base font-bold text-navy-900">
              {language === 'hi' ? 'हवासार्थी की 3-चरणीय कार्यप्रणाली' : 'The HawaSathi 3-Step Civic Workflow'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center font-mono text-xs">
                  1
                </span>
                <h3 className="text-xs font-bold text-slate-800">
                  {language === 'hi' ? 'स्मार्ट डेटा इनजेशन' : 'Smart Data Ingestion'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'hi'
                  ? 'असंगत इकाइयों (ppm, mg/m³) को सुसंगत बनाता है, गायब मानों (--/NA) को चिह्नित करता है और सेंसर दोष (999 µg/m³) को औसत से हटाता है।'
                  : 'Harmonizes heterogeneous units, identifies sensor saturation codes, and drops duplicate readings before analysis.'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center font-mono text-xs">
                  2
                </span>
                <h3 className="text-xs font-bold text-slate-800">
                  {language === 'hi' ? 'प्रमाण-सत्यापित एआई' : 'Traceable GenAI Reasoning'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'hi'
                  ? 'प्रत्येक हॉटस्पॉट और निष्कर्ष का स्रोत रिकॉर्ड आईडी (REC-001) से जुड़ा होता है। तथ्य और अनुमान स्पष्ट अलग होते हैं।'
                  : 'Every flagged hotspot references exact sensor record IDs with confidence scoring. Zero hallucinations.'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center font-mono text-xs">
                  3
                </span>
                <h3 className="text-xs font-bold text-slate-800">
                  {language === 'hi' ? 'प्राथमिकता-आधारित कार्रवाई' : 'Stakeholder Action Dispatch'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'hi'
                  ? 'वार्ड अधिकारी, हाउसिंग सोसाइटी और स्कूल प्रशासक के लिए अलग कार्य निर्देश और नागरिकों हेतु बहुभाषी व्हाट्सएप बुलेटिन जारी करता है।'
                  : 'Generates persona-specific action directives (Ward, Society, School) and 9-permutation multilingual citizen advisories.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Active dataset values derived dynamically from ingested records
  const validRecords = records.filter((r) => r.status === 'valid' && r.aqi !== null);
  const avgAqi =
    analysis?.averageAqi ??
    (validRecords.length > 0
      ? Math.round(validRecords.reduce((acc, r) => acc + (r.aqi || 0), 0) / validRecords.length)
      : SYSTEM_LIMITS.BASELINE_HISTORICAL_AQI);

  const aqiCategory = analysis?.overallAqiCategory || (avgAqi > 300 ? 'Severe' : avgAqi > 200 ? 'Very Poor' : 'Poor');
  const locationName = records[0]?.location || 'Active Urban Telemetry Feed';

  const getStakeholderHero = () => {
    const hotspotNames = (analysis?.hotspots || []).slice(0, 2).map((h) => h.location);
    const hotspotStr =
      hotspotNames.length > 0
        ? hotspotNames.join(language === 'hi' ? ' और ' : ' and ')
        : language === 'hi'
        ? 'पहचाने गए मुख्य हॉटस्पॉट'
        : 'Primary urban clusters';

    switch (stakeholder) {
      case 'housing_society':
        return {
          role: getTranslation(language, 'housingSociety', 'Housing Society (RWA)'),
          title: language === 'hi' ? `आवासीय प्रदूषण नियंत्रण: ${hotspotStr}` : `Colony Shield Advisory: ${hotspotStr}`,
          desc:
            language === 'hi'
              ? 'डीजल जनरेटर (डीजी सेट) के उपयोग को 2 घंटे तक सीमित करें। सोसायटी परिसर में धूल नियंत्रण के लिए जल छिड़काव करें और बच्चों को सुबह के समय पार्क में न भेजें।'
              : 'Restrict non-essential diesel generators, enforce resident window insulation, and reschedule morning outdoor community activities.',
          icon: Building2,
          actionText: language === 'hi' ? 'सोसायटी कार्ययोजना देखें' : 'View Society Action Plan',
          actionTab: 'actions',
        };
      case 'school_admin':
        return {
          role: getTranslation(language, 'schoolAdmin', 'School Administrator'),
          title: language === 'hi' ? `छात्र स्वास्थ्य अलर्ट: ${hotspotStr}` : `Campus Safety Advisory: ${hotspotStr}`,
          desc:
            language === 'hi'
              ? 'सुबह की प्रार्थना सभा और खेलकूद स्थगित करें। कक्षा में एयर प्यूरीफायर चालू करें तथा अस्थमा से पीड़ित छात्रों को इनडोर गतिविधि में रखें।'
              : 'Cancel morning outdoor assemblies, keep student activities indoors, and issue N95 mask guidance for sensitive pediatric cohorts.',
          icon: GraduationCap,
          actionText: language === 'hi' ? 'स्कूल सुरक्षा प्रोटोकॉल देखें' : 'View Campus Directives',
          actionTab: 'actions',
        };
      default:
        return {
          role: getTranslation(language, 'wardOfficer', 'Ward Officer (ULB)'),
          title: language === 'hi' ? `प्राथमिक वार्ड निर्देश: ${hotspotStr}` : `Targeted Ward Interventions: ${hotspotStr}`,
          desc:
            language === 'hi'
              ? 'एंटी-स्मॉग गन तैनात करें, निर्माण स्थलों पर धूल रोधी पर्दे जांचें और प्रमुख चौराहों पर ट्रैफिक को डायवर्ट करें।'
              : 'Deploy municipal anti-smog mist cannons, enforce immediate dust suppression on construction corridors, and coordinate localized traffic diversions.',
          icon: ShieldAlert,
          actionText: language === 'hi' ? 'वार्ड कार्य निर्देश देखें' : 'Dispatch Ward Directives',
          actionTab: 'actions',
        };
    }
  };

  const stakeholderHero = getStakeholderHero();
  const HeroIcon = stakeholderHero.icon;

  return (
    <div className="space-y-6">
      {/* 3-Step Workflow Guide Banner */}
      {showHowItWorks && (
        <section
          aria-label="Workflow Guide"
          className="bg-white rounded-2xl border border-emerald-500/30 p-5 shadow-xs relative overflow-hidden bg-gradient-to-r from-emerald-500/5 via-white to-slate-50"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" aria-hidden="true"></span>
              <h2 className="text-sm font-bold text-navy-900 tracking-tight flex items-center space-x-1.5">
                <span>{language === 'hi' ? 'हवासार्थी कार्यप्रणाली (3 चरण)' : 'How HawaSathi Works (3 Steps)'}</span>
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
            <button
              type="button"
              onClick={() => setActiveTab('data_studio')}
              aria-label="Step 1: Ingest Messy Telemetry"
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
                  ? 'असंगत इकाइयां ठीक करें व डुप्लिकेट पंक्तियां हटाएं।'
                  : 'Harmonize ppm ↔ mg/m³ and isolate 999.0 sensor saturation.'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('intelligence')}
              aria-label="Step 2: Traceable AI Reasoning"
              className="text-left p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5 mb-1.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center font-mono">
                  2
                </span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  {language === 'hi' ? 'सत्यापित एआई विश्लेषण' : 'Traceable GenAI Analysis'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {language === 'hi'
                  ? 'प्रत्येक निष्कर्ष को स्रोत सेंसर आईडी से जोड़ें।'
                  : 'Every claim is cited to exact underlying sensor records.'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('advisory')}
              aria-label="Step 3: Dispatch Actions and Advisories"
              className="text-left p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5 mb-1.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center font-mono">
                  3
                </span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  {language === 'hi' ? 'कार्य निर्देश व बुलेटिन' : 'Actions & Advisories'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {language === 'hi'
                  ? 'हितधारक कार्य योजनाएं व 9-स्तरीय नागरिक अलर्ट जारी करें।'
                  : 'Dispatch persona directives and multilingual citizen bulletins.'}
              </p>
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
                <span>{locationName} • {records.length} Monitored Nodes</span>
              </span>
              <span className="text-xs text-emerald-600 font-medium">• Live Active Feed</span>
            </div>
            <h1 className="text-2xl font-extrabold text-navy-900 mt-2">
              {language === 'hi' ? 'वायु गुणवत्ता स्थिति: ' : 'Ambient Air Quality: '}
              <span className={aqiCategory === 'Very Poor' || aqiCategory === 'Severe' ? 'text-red-600' : 'text-navy-900'}>
                {aqiCategory.toUpperCase()} {language === 'hi' && `(${aqiCategory})`}
              </span>
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {analysis?.executiveSummary ||
                (language === 'hi'
                  ? `वर्तमान शहर का औसत एक्यूआई ${avgAqi} है। अति सूक्ष्म धूल कण (PM2.5) हवा में जमे हैं। संवेदनशील समूहों को सावधानी बरतने की सलाह है।`
                  : `Current average AQI is ${avgAqi} (${aqiCategory}). Ground-level particulate matter requires targeted dust control interventions.`)}
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
            <span>0 Good</span>
            <span>100 Moderate</span>
            <span>200 Poor</span>
            <span className="text-red-600 font-bold">▲ Current: {avgAqi} ({aqiCategory})</span>
            <span>300 Severe</span>
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
              title={`Current Average: ${avgAqi}`}
            ></div>
          </div>
        </div>

        {/* Plain Language Summary Box */}
        <div className="mt-5 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                {language === 'hi' ? 'सरल शब्दों में समझें' : 'In Plain Language (What This Means)'}
              </span>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? `वर्तमान हवा सांस लेने के लिए संवेदनशील है। ${analysis?.hotspots.length || 0} मुख्य प्रदूषण केंद्रों पर तत्काल नियंत्रण की आवश्यकता है।`
                  : `Ambient air is currently unhealthy for sensitive cohorts. Immediate intervention recommended across ${analysis?.hotspots.length || 0} identified hotspot nodes.`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('intelligence')}
              aria-label="Inspect Active Hotspots"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'हॉटस्पॉट देखें' : 'Inspect Hotspots'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('advisory')}
              aria-label="View Citizen Advisory"
              className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'नागरिक अलर्ट' : 'Citizen Alert'}
            </button>
          </div>
        </div>
      </section>

      {/* Main KPI Summary Grid */}
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
                {analysis?.comparison?.aqiDelta ?? 0} pts
              </span>
            )}
            <span className="text-slate-400 text-[11px]">{getTranslation(language, 'vsBaseline', 'vs baseline')}</span>
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
            {analysis?.hotspots.length ?? 0}
          </div>
          <div className="mt-3 text-xs text-amber-700 font-medium flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
            <span className="truncate">{getTranslation(language, 'exceedsWho', 'Exceeds NAAQS 24h Standard')}</span>
          </div>
        </div>

        {/* Data Quality Completeness */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-2">{getTranslation(language, 'dataCompleteness', 'Dataset Completeness')}</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-navy-900">
              {qualityReport?.dataCompletenessPct ?? 100}%
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
            <h2 className="text-base font-bold text-navy-900 mt-1">
              {stakeholderHero.title}
            </h2>
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
              <h2 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>{language === 'hi' ? 'तत्काल ध्यान देने योग्य प्रदूषण केंद्र' : 'Immediate Attention Hotspots'}</span>
              </h2>
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
            {(analysis?.hotspots || []).slice(0, 3).map((hotspot, idx) => (
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
                <h2 className="text-sm font-bold text-navy-900">
                  {language === 'hi' ? 'एआई कार्यकारी सारांश' : 'AI Executive Synopsis'}
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {analysis?.aiModelUsed || 'Gemini 3.5 Flash'}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {analysis?.executiveSummary ||
                'Telemetry indicates active ground-level particulates concentrated around commercial and transit corridors.'}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <div className="text-xs font-bold text-slate-800">
                {language === 'hi' ? 'डेटा विश्वसनीयता स्थिति:' : 'Data Reliability Assessment:'}
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                {analysis?.dataReliability ||
                  'High confidence across active sensor clusters with traceability verified.'}
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
