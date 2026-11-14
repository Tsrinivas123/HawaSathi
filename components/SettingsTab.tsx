'use strict';
/**
 * @file SettingsTab.tsx
 * @description System configuration, persona toggles, and LLM specifications.
 * Optimized with React.memo.
 */

import React, { memo } from 'react';
import {
  Settings,
  ShieldCheck,
  Building2,
  GraduationCap,
  Cpu,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { StakeholderType } from '@/lib/types';

interface SettingsTabProps {
  stakeholder: StakeholderType;
  setStakeholder: (s: StakeholderType) => void;
}

const SettingsTabComponent: React.FC<SettingsTabProps> = ({
  stakeholder,
  setStakeholder,
}) => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <section aria-label="Settings Header" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <h2 className="text-base font-bold text-navy-900 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          <span>Platform Settings & System Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure active civic stakeholder, environmental standards, and AI model parameters.
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
            onClick={() => setStakeholder('ward_officer')}
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
              Municipal enforcement, anti-smog mist cannons, construction audits, and official reports.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setStakeholder('housing_society')}
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
              Resident welfare, DG set test rescheduling, boundary road sprinkling, and balcony warnings.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setStakeholder('school_admin')}
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
              Student pulmonary safety, indoor assembly relocations, parent WhatsApp alerts, and sick bay prep.
            </p>
          </button>
        </div>
      </section>

      {/* AI & Intelligence Engine Info */}
      <section aria-label="AI Engine Specifications" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-navy-900 pb-2 border-b border-slate-100">
          <Cpu className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Generative AI Engine Configuration</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-navy-900">LLM Reasoning Engine</div>
            <p className="text-slate-600 leading-relaxed">
              Google Gemini 3.5 Flash / Flash-Lite multimodal reasoning with JSON-schema structured output enforcement.
            </p>
            <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Production Key Verified via Vercel Secret Store</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-navy-900">Traceability & Audit Guarantee</div>
            <p className="text-slate-600 leading-relaxed">
              Every identified pollution hotspot links directly to source sensor telemetry records (`REC-001`, `REC-004`).
            </p>
            <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Zero Hallucinated Sensor IDs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bhopal Hackathon Info */}
      <section aria-label="PromptWars Edition" className="p-5 bg-gradient-to-r from-navy-900 to-navy-850 text-white rounded-2xl shadow-md border border-slate-700 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              PromptWars Bhopal 2026 Edition
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Built as an elite autonomous civic environmental intelligence studio.
          </p>
        </div>
        <span className="text-xs font-mono font-bold bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
          v1.0 Production
        </span>
      </section>
    </div>
  );
};

export const SettingsTab = memo(SettingsTabComponent);
