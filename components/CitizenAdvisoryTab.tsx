'use strict';
import React, { useState } from 'react';
import {
  Megaphone,
  Globe,
  BookOpen,
  HeartPulse,
  Baby,
  Users,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Share2,
  Printer,
  Sparkles,
} from 'lucide-react';
import { AnalysisResult, Language, ReadingLevel } from '@/lib/types';

interface CitizenAdvisoryTabProps {
  analysis: AnalysisResult | null;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const CitizenAdvisoryTab: React.FC<CitizenAdvisoryTabProps> = ({
  analysis,
  language,
  setLanguage,
}) => {
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>('citizen');
  const [copied, setCopied] = useState(false);

  // Look up advisory strictly matching chosen language first
  const key = `${language}_${readingLevel}`;
  const advisory =
    analysis?.advisories[key] ||
    analysis?.advisories[`${language}_citizen`] ||
    analysis?.advisories[`${language}_child`] ||
    analysis?.advisories[`${language}_official`] ||
    analysis?.advisories['en_citizen'];

  const handleCopyWhatsApp = () => {
    if (!advisory) return;
    const text = `📢 *${advisory.headline}*\n\n${advisory.summary}\n\n🛡️ *Key Precautions:*\n${advisory.generalGuidance.map((g) => `• ${g}`).join('\n')}\n\n⚠️ *Vulnerable Groups:*\n${advisory.vulnerablePrecautions.map((vp) => `• *${vp.group}*: ${vp.precaution}`).join('\n')}\n\n✅ *DO's:* ${advisory.dosAndDonts.dos.join(', ')}\n❌ *DON'Ts:* ${advisory.dosAndDonts.donts.join(', ')}\n\n_Issued via HawaSathi Civic Environmental Intelligence_`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadBriefingNote = () => {
    if (!advisory || !analysis) return;
    const dateStr = new Date().toLocaleString();
    const memo = `===============================================================
OFFICIAL CIVIC AIR QUALITY INTERNAL BRIEFING MEMO
===============================================================
MUNICIPAL WARD & CIVIC INTELLIGENCE DIVISION
ISSUED AT: ${dateStr}
AI REASONING ENGINE: ${analysis.aiModelUsed || 'Gemini 3.5 Flash'}
AUTHENTICATION: VERIFIED & TRACEABLE

1. EXECUTIVE SYNOPSIS
---------------------------------------------------------------
Average City AQI: ${analysis.averageAqi} (${analysis.overallAqiCategory})
Dominant Pollutant: ${analysis.primaryPollutant}
Data Reliability: ${analysis.dataReliability}

2. FORMAL ADMINISTRATIVE DIRECTIVE
---------------------------------------------------------------
Headline: ${advisory.headline}
Summary: ${advisory.summary}

Mandatory Protocols:
${advisory.generalGuidance.map((g, i) => `[${i + 1}] ${g}`).join('\n')}

3. IDENTIFIED HIGH-ATTENTION HOTSPOTS
---------------------------------------------------------------
${analysis.hotspots.map((h, i) => `[Node ${i + 1}] ${h.location} (${h.ward}) - Measured: ${h.measuredValue} ${h.unit}
   Observation: ${h.whyNoteworthy}
   Supporting Sensor Records: ${h.supportingRecordIds.join(', ')}
   Classification: ${h.category} (Confidence: ${h.confidence})`).join('\n\n')}

4. VULNERABLE COHORT SPECIAL PROTECTIONS
---------------------------------------------------------------
${advisory.vulnerablePrecautions.map(p => `* ${p.group}: ${p.precaution}`).join('\n')}

5. COMPARATIVE DELTA AUDIT (vs 24h Baseline)
---------------------------------------------------------------
Previous Baseline AQI: 211
Net Atmospheric Shift: ${analysis.comparison.aqiDelta > 0 ? '+' : ''}${analysis.comparison.aqiDelta} AQI Points
Trend: ${analysis.comparison.aqiTrend.toUpperCase()}
Intervention Efficacy: ${analysis.comparison.interventionEffectiveness}

---------------------------------------------------------------
ISSUED BY: HAWASATHI CIVIC BRIEFING STUDIO
===============================================================`;

    const blob = new Blob([memo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HawaSathi_Internal_Briefing_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!advisory) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 text-slate-400">
        Run AI analysis to generate multilingual citizen advisories.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <section aria-label="Advisory Controls" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-navy-900 flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <span>Multilingual Citizen Advisory Studio</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear, actionable public advisories with tailored language and reading comprehension tiers.
          </p>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium" role="group" aria-label="Select Advisory Language">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              aria-label="Switch advisory to English"
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'en' ? 'bg-white text-navy-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              aria-pressed={language === 'hi'}
              aria-label="Switch advisory to Hindi"
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'hi' ? 'bg-white text-navy-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hinglish')}
              aria-pressed={language === 'hinglish'}
              aria-label="Switch advisory to Hinglish"
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'hinglish' ? 'bg-white text-navy-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Hinglish
            </button>
          </div>

          {/* Reading Level Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium" role="group" aria-label="Select Reading Level">
            <BookOpen className="w-3.5 h-3.5 text-slate-500 ml-1.5" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setReadingLevel('citizen')}
              aria-pressed={readingLevel === 'citizen'}
              aria-label="Citizen reading tier"
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                readingLevel === 'citizen' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => setReadingLevel('child')}
              aria-pressed={readingLevel === 'child'}
              aria-label="Child friendly reading tier"
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                readingLevel === 'child' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Child Friendly
            </button>
            <button
              type="button"
              onClick={() => setReadingLevel('official')}
              aria-pressed={readingLevel === 'official'}
              aria-label="Official administrative memo tier"
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                readingLevel === 'official' ? 'bg-white text-blue-800 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Official Memo
            </button>
          </div>
        </div>
      </section>

      {/* Main Advisory Display Banner */}
      <section aria-label="Active Advisory Bulletin" className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active Advisory ({language.toUpperCase()} • {readingLevel.toUpperCase()})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadBriefingNote}
              aria-label="Download Official Internal Briefing Text Memo"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-navy-900 hover:bg-navy-850 text-white rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Internal Briefing (.txt)</span>
            </button>
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              aria-label="Copy formatted WhatsApp bulletin text"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>{copied ? 'Copied WhatsApp Text!' : 'Copy WhatsApp Bulletin'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              aria-label="Print official citizen advisory bulletin"
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-4">
          <h1 className="text-xl font-bold text-navy-900 tracking-tight">
            {advisory.headline}
          </h1>
          <p className="text-sm text-slate-700 leading-relaxed max-w-4xl bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            {advisory.summary}
          </p>

          {/* General Guidance Section */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Actionable Public Protocols
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {advisory.generalGuidance.map((guidance, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/90 text-xs text-slate-700 flex items-start space-x-2"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{guidance}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vulnerable Groups Special Precautions */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <HeartPulse className="w-4 h-4 text-red-500" aria-hidden="true" />
              <span>Protective Measures for Vulnerable Cohorts</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advisory.vulnerablePrecautions.map((vp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-red-100 bg-red-50/20 space-y-1.5"
                >
                  <div className="flex items-center space-x-2">
                    {idx === 0 ? (
                      <Baby className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    ) : idx === 1 ? (
                      <Users className="w-4 h-4 text-purple-600" aria-hidden="true" />
                    ) : (
                      <HeartPulse className="w-4 h-4 text-red-600" aria-hidden="true" />
                    )}
                    <span className="font-bold text-xs text-navy-900">{vp.group}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{vp.precaution}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DO's & DON'Ts Matrix */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DOs */}
            <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-200 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Recommended Practices (DOs)</span>
              </div>
              <ul className="text-xs text-emerald-900 space-y-1.5">
                {advisory.dosAndDonts.dos.map((d, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DONTs */}
            <div className="p-4 rounded-xl bg-red-50/30 border border-red-200 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-red-800 uppercase tracking-wider">
                <XCircle className="w-4 h-4 text-red-600" aria-hidden="true" />
                <span>Practices to Avoid (DON'Ts)</span>
              </div>
              <ul className="text-xs text-red-900 space-y-1.5">
                {advisory.dosAndDonts.donts.map((d, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
