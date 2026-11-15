'use strict';
/**
 * @file Sidebar.tsx
 * @description Persistent sidebar navigation for the HawaSathi Civic Studio.
 * Wrapped in React.memo to prevent unnecessary re-renders when active tab content updates.
 */

import React, { memo } from 'react';
import {
  LayoutDashboard,
  Database,
  Sparkles,
  ClipboardCheck,
  Megaphone,
  History,
  Settings,
  Wind,
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
} from 'lucide-react';
import { StakeholderType, Language } from '@/lib/types';
import { getTranslation } from '@/lib/i18n';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stakeholder: StakeholderType;
  setStakeholder: (s: StakeholderType) => void;
  language: Language;
}

const SidebarComponent: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  stakeholder,
  setStakeholder,
  language,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: getTranslation(language, 'overview', 'Overview'),
      subtitle: language === 'hi' ? 'शहर का हाल' : 'City Snapshot',
      icon: LayoutDashboard,
    },
    {
      id: 'data_studio',
      label: getTranslation(language, 'data_studio', 'Data Studio'),
      subtitle: language === 'hi' ? 'डेटा अपलोड' : 'CSV Ingestion',
      icon: Database,
    },
    {
      id: 'intelligence',
      label: getTranslation(language, 'intelligence', 'Air Intelligence'),
      subtitle: language === 'hi' ? 'हॉटस्पॉट विश्लेषण' : 'Gemini AI Insights',
      icon: Sparkles,
    },
    {
      id: 'actions',
      label: getTranslation(language, 'actions', 'Local Actions'),
      subtitle: language === 'hi' ? 'कार्ययोजना' : 'Directives & Tasks',
      icon: ClipboardCheck,
    },
    {
      id: 'advisory',
      label: getTranslation(language, 'advisory', 'Citizen Advisory'),
      subtitle: language === 'hi' ? 'नागरिक अलर्ट' : 'Bilingual Bulletins',
      icon: Megaphone,
    },
    {
      id: 'history',
      label: getTranslation(language, 'history', 'Report History'),
      subtitle: language === 'hi' ? '24h तुलना' : 'Baseline Delta',
      icon: History,
    },
    {
      id: 'settings',
      label: getTranslation(language, 'settings', 'Settings'),
      subtitle: language === 'hi' ? 'कॉन्फ़िगरेशन' : 'Studio Config',
      icon: Settings,
    },
  ];

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="w-64 bg-[#07111F] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <Wind className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white tracking-tight text-lg">
                {language === 'hi' ? 'हवासार्थी' : 'HawaSathi'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {getTranslation(language, 'tagline', 'Air Data to Local Action')}
            </p>
          </div>
        </div>
      </div>

      {/* Stakeholder Persona Box */}
      <div className="p-3.5 mx-3 my-3 rounded-xl bg-slate-900/90 border border-slate-800/90">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>{getTranslation(language, 'activeStakeholder', 'Active Stakeholder')}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
        </div>
        <div className="flex flex-col gap-1.5" role="group" aria-label="Select Target Stakeholder">
          <button
            type="button"
            onClick={() => setStakeholder('ward_officer')}
            aria-pressed={stakeholder === 'ward_officer'}
            aria-label="Switch to Ward Officer Role"
            className={`flex items-center space-x-2 text-xs px-2.5 py-2 rounded-lg transition-all text-left font-medium cursor-pointer ${
              stakeholder === 'ward_officer'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <div className="truncate">
              <div className="font-semibold text-slate-200">
                {language === 'hi' ? 'वार्ड अधिकारी' : 'Ward Officer'}
              </div>
              <div className="text-[10px] text-slate-500">Nagar Nigam</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStakeholder('housing_society')}
            aria-pressed={stakeholder === 'housing_society'}
            aria-label="Switch to Housing Society Role"
            className={`flex items-center space-x-2 text-xs px-2.5 py-2 rounded-lg transition-all text-left font-medium cursor-pointer ${
              stakeholder === 'housing_society'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <div className="truncate">
              <div className="font-semibold text-slate-200">
                {language === 'hi' ? 'आवास समिति' : 'Housing Society'}
              </div>
              <div className="text-[10px] text-slate-500">Colony RWA</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStakeholder('school_admin')}
            aria-pressed={stakeholder === 'school_admin'}
            aria-label="Switch to School Administrator Role"
            className={`flex items-center space-x-2 text-xs px-2.5 py-2 rounded-lg transition-all text-left font-medium cursor-pointer ${
              stakeholder === 'school_admin'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" aria-hidden="true" />
            <div className="truncate">
              <div className="font-semibold text-slate-200">
                {language === 'hi' ? 'स्कूल प्रशासक' : 'School Admin'}
              </div>
              <div className="text-[10px] text-slate-500">Campus Safety</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStakeholder('citizen')}
            aria-pressed={stakeholder === 'citizen'}
            aria-label="Switch to General Citizen Role"
            className={`flex items-center space-x-2 text-xs px-2.5 py-2 rounded-lg transition-all text-left font-medium cursor-pointer ${
              stakeholder === 'citizen'
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
            <div className="truncate">
              <div className="font-semibold text-slate-200">
                {language === 'hi' ? 'आम नागरिक' : 'General Citizen'}
              </div>
              <div className="text-[10px] text-slate-500">Public Health</div>
            </div>
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav aria-label="Studio Main Navigation" className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5">
          {getTranslation(language, 'studioNavigation', 'Studio Navigation')}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${item.label} - ${item.subtitle}`}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 font-semibold'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                <span className="font-medium text-left">{item.label}</span>
              </div>
              <span className={`text-[10px] font-normal ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                {item.subtitle}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-[#060D17] text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-300">PromptWars 2026</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">Bhopal</span>
        </div>
        <p className="text-slate-400 leading-tight">
          {language === 'hi' ? 'नागरिक वायु गुणवत्ता स्टूडियो' : 'Civic Air Quality Briefing Studio'}
        </p>
      </div>
    </aside>
  );
};

export const Sidebar = memo(SidebarComponent);
