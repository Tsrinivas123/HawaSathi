'use strict';
import React from 'react';
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
} from 'lucide-react';
import { StakeholderType } from '@/lib/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stakeholder: StakeholderType;
  setStakeholder: (s: StakeholderType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  stakeholder,
  setStakeholder,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'data_studio', label: 'Data Studio', icon: Database },
    { id: 'intelligence', label: 'Air Intelligence', icon: Sparkles },
    { id: 'actions', label: 'Local Actions', icon: ClipboardCheck },
    { id: 'advisory', label: 'Citizen Advisory', icon: Megaphone },
    { id: 'history', label: 'Report History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#07111F] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <Wind className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white tracking-tight text-lg">HawaSathi</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono font-semibold">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Air Data to Local Action</p>
          </div>
        </div>
      </div>

      {/* Stakeholder Persona Box */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Active Stakeholder</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setStakeholder('ward_officer')}
            className={`flex items-center space-x-2 text-xs px-2.5 py-1.5 rounded-lg transition-all text-left font-medium ${
              stakeholder === 'ward_officer'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Ward Officer (ULB)</span>
          </button>
          <button
            onClick={() => setStakeholder('housing_society')}
            className={`flex items-center space-x-2 text-xs px-2.5 py-1.5 rounded-lg transition-all text-left font-medium ${
              stakeholder === 'housing_society'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Housing Society (RWA)</span>
          </button>
          <button
            onClick={() => setStakeholder('school_admin')}
            className={`flex items-center space-x-2 text-xs px-2.5 py-1.5 rounded-lg transition-all text-left font-medium ${
              stakeholder === 'school_admin'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'hover:bg-slate-800/60 text-slate-400'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">School Administrator</span>
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5">
          Studio Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 font-semibold'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-[#060D17] text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-300">PromptWars 2026</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Bhopal</span>
        </div>
        <p className="text-slate-400 leading-tight">AI Civic Environmental Intelligence Suite</p>
      </div>
    </aside>
  );
};
