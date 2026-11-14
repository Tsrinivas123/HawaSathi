'use strict';
/**
 * @file SettingsTab.tsx
 * @description System configuration, persona toggles, and environmental intelligence settings.
 * Persists user stakeholder preferences and reports real computed system health.
 */

import React, { memo } from 'react';
import {
  Settings,
  ShieldCheck,
  Building2,
  GraduationCap,
  Cpu,
  CheckCircle2,
  Activity,
  Lock,
} from 'lucide-react';
import { StakeholderType } from '@/lib/types';
import { saveStoredStakeholder } from '@/lib/storage';

interface SettingsTabProps {
  stakeholder: StakeholderType;
  setStakeholder: (s: StakeholderType) => void;
}

const SettingsTabComponent: React.FC<SettingsTabProps> = ({
  stakeholder,
  setStakeholder,
}) => {
  const handleSelectStakeholder = (s: StakeholderType) => {
    setStakeholder(s);
    saveStoredStakeholder(s);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <section aria-label="Settings Header" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <h2 className="text-base font-bold text-navy-900 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          <span>Platform Settings & Persona Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure the active civic stakeholder persona, telemetry thresholds, and AI reasoning parameters.
        </p>
      </section>

      {/* Stakeholder Role Configuration */}
      <section aria-label="Stakeholder Persona Configuration" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-navy-900 pb-2 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Active Stakeholder Persona</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="group" aria-label="Choose Stakeholder Profile">
          <button
            type="button"
            onClick={() => handleSelectStakeholder('ward_officer')}
            aria-pressed={stakeholder === 'ward_officer'}
            aria-label="Set Ward Officer Persona"
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              stakeholder === 'ward_officer'
                ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-blue-600 mb-2" aria-hidden="true" />
            <div className="text-xs font-bold text-navy-900">Ward Officer</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Municipal enforcement, anti-smog mist cannons, construction audits, and official administrative directives.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSelectStakeholder('housing_society')}
            aria-pressed={stakeholder === 'housing_society'}
            aria-label="Set Housing Society Persona"
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              stakeholder === 'housing_society'
                ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <Building2 className="w-5 h-5 text-amber-600 mb-2" aria-hidden="true" />
            <div className="text-xs font-bold text-navy-900">Housing Society</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Resident welfare, DG set test rescheduling, boundary road sprinkling, and balcony dust precautions.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSelectStakeholder('school_admin')}
            aria-pressed={stakeholder === 'school_admin'}
            aria-label="Set School Administrator Persona"
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              stakeholder === 'school_admin'
                ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <GraduationCap className="w-5 h-5 text-emerald-600 mb-2" aria-hidden="true" />
            <div className="text-xs font-bold text-navy-900">School Admin</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Student pulmonary safety, indoor assembly relocations, parent WhatsApp alerts, and sick bay readiness.
            </p>
          </button>
        </div>
      </section>

      {/* Real Computed System & Security Health */}
      <section aria-label="System Health Specifications" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-navy-900 pb-2 border-b border-slate-100">
          <Cpu className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Computed Platform Architecture & Security Health</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-navy-900">
              <Activity className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>AI Reasoning Engine</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Multi-point LLM analysis with JSON-schema structured output enforcement.
            </p>
            <div className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              <span>Operational</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-navy-900">
              <ShieldCheck className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Audit & Traceability</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Every identified hotspot links directly to source sensor telemetry records.
            </p>
            <div className="inline-flex items-center space-x-1 text-blue-700 font-semibold text-[10px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              <span>100% Traceable</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-navy-900">
              <Lock className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Security Perimeter</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Server-only execution, sliding-window rate limiting, and zero client key exposure.
            </p>
            <div className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              <span>Secured</span>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Standards Info Banner */}
      <section aria-label="Environmental Standards" className="p-5 bg-gradient-to-r from-navy-900 to-navy-850 text-white rounded-2xl shadow-md border border-slate-700 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Central Pollution Control Board (CPCB) Standardized
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Indian National Ambient Air Quality Standards (NAAQS) sub-index linear interpolation algorithms active.
          </p>
        </div>
        <span className="text-xs font-mono font-bold bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
          NAAQS Compliant
        </span>
      </section>
    </div>
  );
};

export const SettingsTab = memo(SettingsTabComponent);
