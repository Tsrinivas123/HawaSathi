'use strict';
import React from 'react';
import {
  Globe,
  Sparkles,
  ShieldCheck,
  Building2,
  GraduationCap,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { StakeholderType, Language } from '@/lib/types';
import { getTranslation } from '@/lib/i18n';

interface TopNavProps {
  stakeholder: StakeholderType;
  setStakeholder: (s: StakeholderType) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  hasData: boolean;
  recordCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  stakeholder,
  setStakeholder,
  language,
  setLanguage,
  onRunAnalysis,
  isAnalyzing,
  hasData,
  recordCount,
}) => {
  const stakeholderLabels: Record<StakeholderType, { name: string; icon: any; color: string }> = {
    ward_officer: { name: getTranslation(language, 'wardOfficer', 'Ward Officer (ULB)'), icon: ShieldCheck, color: 'text-blue-500' },
    housing_society: { name: getTranslation(language, 'housingSociety', 'Housing Society (RWA)'), icon: Building2, color: 'text-amber-500' },
    school_admin: { name: getTranslation(language, 'schoolAdmin', 'School Administrator'), icon: GraduationCap, color: 'text-emerald-500' },
  };

  const CurrentIcon = stakeholderLabels[stakeholder].icon;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 shrink-0 shadow-xs">
      {/* Left: Active Role & Context */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
          <CurrentIcon className={`w-4 h-4 ${stakeholderLabels[stakeholder].color}`} />
          <span className="text-xs font-semibold text-slate-700">
            {stakeholderLabels[stakeholder].name}
          </span>
          <span className="text-slate-300">|</span>
          <select
            value={stakeholder}
            onChange={(e) => setStakeholder(e.target.value as StakeholderType)}
            className="text-xs bg-transparent text-slate-600 focus:outline-hidden font-medium cursor-pointer"
          >
            <option value="ward_officer">{getTranslation(language, 'wardOfficer', 'Ward Officer')}</option>
            <option value="housing_society">{getTranslation(language, 'housingSociety', 'Housing Society')}</option>
            <option value="school_admin">{getTranslation(language, 'schoolAdmin', 'School Admin')}</option>
          </select>
        </div>

        {hasData && (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{recordCount} {getTranslation(language, 'recordsActive', 'Records Active')}</span>
          </span>
        )}
      </div>

      {/* Right: Controls & AI Status */}
      <div className="flex items-center space-x-3">
        {/* Gemini Engine Status */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs">
          <Cpu className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium">Google Gemini 3.5 Flash</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </div>

        {/* Language Selector */}
        <div className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-transparent focus:outline-hidden cursor-pointer font-bold"
          >
            <option value="en">English (US)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onRunAnalysis}
          disabled={!hasData || isAnalyzing}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all ${
            !hasData
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : isAnalyzing
              ? 'bg-emerald-600 text-white cursor-wait opacity-90'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 active:scale-95'
          }`}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{getTranslation(language, 'analyzingData', 'Analyzing Air Data...')}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{getTranslation(language, 'generateBriefing', 'Generate AI Briefing')}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
