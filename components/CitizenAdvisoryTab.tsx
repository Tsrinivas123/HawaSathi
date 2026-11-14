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

  // Look up advisory or fallback to citizen
  const key = `${language}_${readingLevel}`;
  const advisory =
    analysis?.advisories[key] ||
    analysis?.advisories[`${language}_citizen`] ||
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

  if (!advisory) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
        Run AI analysis to generate multilingual citizen advisories.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-navy-900 flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            <span>Multilingual Citizen Advisory Studio</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear, actionable public advisories with tailored language and reading comprehension tiers.
          </p>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                language === 'en' ? 'bg-white text-navy-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                language === 'hi' ? 'bg-white text-navy-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLanguage('hinglish')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                language === 'hinglish' ? 'bg-white text-navy-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Hinglish
            </button>
          </div>

          {/* Reading Level Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
            <BookOpen className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <button
              onClick={() => setReadingLevel('citizen')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                readingLevel === 'citizen' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Citizen
            </button>
            <button
              onClick={() => setReadingLevel('child')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                readingLevel === 'child' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Child Friendly
            </button>
            <button
              onClick={() => setReadingLevel('official')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                readingLevel === 'official' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Official Memo
            </button>
          </div>
        </div>
      </div>

      {/* Main Advisory Display Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Active Advisory ({language.toUpperCase()} • {readingLevel.toUpperCase()})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyWhatsApp}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied WhatsApp Text!' : 'Copy WhatsApp Bulletin'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all border border-slate-200 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bulletin</span>
            </button>
          </div>
        </div>

        {/* Headline & Body */}
        <div className="mt-4 space-y-2">
          <h1 className="text-xl font-extrabold text-navy-900 leading-tight">
            {advisory.headline}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            {advisory.summary}
          </p>
        </div>

        {/* General Guidance Bulletins */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Essential Protective Measures</span>
          </h4>
          <ul className="text-xs text-slate-700 space-y-2">
            {advisory.generalGuidance.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold mt-0.5">✔</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* High Risk Vulnerable Cohorts (Requirement 11) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center space-x-2 mb-3">
            <HeartPulse className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-navy-900">
              Special Precautions for Vulnerable & Sensitive Cohorts
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {advisory.vulnerablePrecautions.map((vp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-red-50/20 hover:border-red-300 transition-all space-y-1.5"
              >
                <div className="flex items-center space-x-2">
                  {vp.group.toLowerCase().includes('child') ? (
                    <Baby className="w-4 h-4 text-amber-600" />
                  ) : vp.group.toLowerCase().includes('senior') ? (
                    <Users className="w-4 h-4 text-blue-600" />
                  ) : (
                    <HeartPulse className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-xs font-bold text-navy-900">{vp.group}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {vp.precaution}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dos and Don'ts */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recommended Civic Actions (DO's)</span>
            </div>
            <ul className="text-xs text-emerald-950 space-y-1.5">
              {advisory.dosAndDonts.dos.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="font-bold text-emerald-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-red-50/50 border border-red-200 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-red-800">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>Harmful Practices to Avoid (DON'Ts)</span>
            </div>
            <ul className="text-xs text-red-950 space-y-1.5">
              {advisory.dosAndDonts.donts.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="font-bold text-red-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
