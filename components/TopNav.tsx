'use strict';
/**
 * @file TopNav.tsx
 * @description Header bar with persona switching, multilingual selector, active dataset status, and AI trigger.
 * Wrapped in React.memo for high rendering efficiency.
 */

import React, { memo } from 'react';
import {
  Globe,
  Sparkles,
  ShieldCheck,
  Building2,
  GraduationCap,
  Cpu,
  RefreshCw,
  HelpCircle,
  Database,
  Trash2,
  Users,
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
  onToggleGuide?: () => void;
  onResetWorkspace?: () => void;
}

const TopNavComponent: React.FC<TopNavProps> = ({
  stakeholder,
  setStakeholder,
  language,
  setLanguage,
  onRunAnalysis,
  isAnalyzing,
  hasData,
  recordCount,
  onToggleGuide,
  onResetWorkspace,
}) => {
  const stakeholderLabels: Record<
    StakeholderType,
    { name: string; icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>; color: string; badge: string }
  > = {
    ward_officer: {
      name: getTranslation(language, 'wardOfficer', 'Ward Officer (ULB)'),
      icon: ShieldCheck,
      color: 'text-blue-500',
      badge: 'Nagar Nigam',
    },
    housing_society: {
      name: getTranslation(language, 'housingSociety', 'Housing Society (RWA)'),
      icon: Building2,
      color: 'text-amber-500',
      badge: 'Colony RWA',
    },
    school_admin: {
      name: getTranslation(language, 'schoolAdmin', 'School Administrator'),
      icon: GraduationCap,
      color: 'text-emerald-500',
      badge: 'Campus Safety',
    },
    citizen: {
      name: getTranslation(language, 'citizen', 'General Citizen'),
      icon: Users,
      color: 'text-violet-500',
      badge: 'Public Health',
    },
  };

  const CurrentIcon = stakeholderLabels[stakeholder].icon;

  return (
    <header role="banner" className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0 shadow-xs">
      {/* Left: Active Role & Context */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Role Switcher Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors">
          <CurrentIcon className={`w-4 h-4 shrink-0 ${stakeholderLabels[stakeholder].color}`} aria-hidden="true" />
          <label htmlFor="stakeholder-select" className="text-xs font-semibold text-slate-800 cursor-pointer">
            <span className="hidden md:inline">{stakeholderLabels[stakeholder].name}</span>
            <span className="md:hidden">{stakeholderLabels[stakeholder].badge}</span>
          </label>
          <span className="text-slate-300">|</span>
          <select
            id="stakeholder-select"
            value={stakeholder}
            onChange={(e) => setStakeholder(e.target.value as StakeholderType)}
            aria-label="Select Active Stakeholder Persona"
            className="text-xs bg-transparent text-slate-600 focus:outline-hidden font-medium cursor-pointer"
          >
            <option value="ward_officer">{getTranslation(language, 'wardOfficer', 'Ward Officer')}</option>
            <option value="housing_society">{getTranslation(language, 'housingSociety', 'Housing Society')}</option>
            <option value="school_admin">{getTranslation(language, 'schoolAdmin', 'School Admin')}</option>
            <option value="citizen">{getTranslation(language, 'citizen', 'General Citizen')}</option>
          </select>
        </div>

        {/* Dataset Status Indicator */}
        {!hasData ? (
          <div
            role="status"
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true"></span>
            <span>{language === 'hi' ? 'कोई डेटा नहीं' : 'No Active Dataset'}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div
              role="status"
              aria-live="polite"
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
              <span>{recordCount} {getTranslation(language, 'recordsActive', 'Records Active')}</span>
            </div>
            {onResetWorkspace && (
              <button
                type="button"
                onClick={onResetWorkspace}
                aria-label="Clear active dataset and reset workspace"
                className="hidden sm:inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-medium border border-transparent hover:border-red-200 transition-colors"
                title="Clear Dataset"
              >
                <Trash2 className="w-3 h-3" aria-hidden="true" />
                <span className="text-[11px]">{language === 'hi' ? 'हटाएं' : 'Clear'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right: Controls & AI Status */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Guide Button */}
        {onToggleGuide && (
          <button
            type="button"
            onClick={onToggleGuide}
            aria-label="How HawaSathi Works Guide"
            className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-medium transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>{language === 'hi' ? 'कैसे काम करता है?' : 'How It Works'}</span>
          </button>
        )}

        {/* Gemini Engine Status */}
        <div
          role="status"
          aria-label="AI Engine: Google Gemini 3.5 Flash Active"
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-700 text-xs"
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span className="font-semibold text-slate-800">Gemini 3.5 Flash</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" aria-hidden="true"></span>
        </div>

        {/* Language Selector */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-800">
          <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            aria-label="Choose Studio Display Language"
            className="text-xs bg-transparent focus:outline-hidden font-semibold cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>

        {/* Run AI Analysis Action Button */}
        <button
          type="button"
          onClick={onRunAnalysis}
          disabled={isAnalyzing || !hasData}
          aria-label={isAnalyzing ? 'Analyzing with Google Gemini' : 'Run Live Gemini Air Intelligence'}
          className={`flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
            isAnalyzing || !hasData
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:shadow-md'
          }`}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              <span>{getTranslation(language, 'analyzing', 'Analyzing...')}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{getTranslation(language, 'runAiBriefing', 'Run Gemini Brief')}</span>
              <span className="sm:hidden">{language === 'hi' ? 'एआई' : 'AI'}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export const TopNav = memo(TopNavComponent);
