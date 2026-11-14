'use strict';
import React from 'react';
import {
  Settings,
  ShieldCheck,
  Building2,
  GraduationCap,
  Cpu,
  Sliders,
  CheckCircle2,
  Info,
  Award,
} from 'lucide-react';
import { StakeholderType } from '@/lib/types';

interface SettingsTabProps {
  stakeholder: StakeholderType;
  setStakeholder: (s: StakeholderType) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  stakeholder,
  setStakeholder,
}) => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-base font-bold text-navy-900 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <span>Platform Settings & System Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure active civic stakeholder, environmental standards, and AI model parameters.
        </p>
      </div>

      {/* Stakeholder Role Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-navy-900 pb-2 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Active Stakeholder Persona</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setStakeholder('ward_officer')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              stakeholder === 'ward_officer'
                ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-blue-600 mb-2" />
            <div className="text-xs font-bold text-navy-900">Ward Officer</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Municipal enforcement, anti-smog mist cannons, construction audits, and official reports.
            </p>
          </button>

          <button
            onClick={() => setStakeholder('housing_society')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              stakeholder === 'housing_society'
                ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <Building2 className="w-5 h-5 text-amber-600 mb-2" />
            <div className="text-xs font-bold text-navy-900">Housing Society</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Resident welfare, DG set test rescheduling, boundary road sprinkling, and balcony warnings.
            </p>
          </button>

          <button
            onClick={() => setStakeholder('school_admin')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              stakeholder === 'school_admin'
                ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <GraduationCap className="w-5 h-5 text-emerald-600 mb-2" />
            <div className="text-xs font-bold text-navy-900">School Admin</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Student pulmonary safety, indoor assembly relocations, parent WhatsApp alerts, and sick bay prep.
            </p>
          </button>
        </div>
      </div>

      {/* AI & Intelligence Engine Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-navy-900 pb-2 border-b border-slate-100">
          <Cpu className="w-4 h-4 text-emerald-600" />
          <span>Generative AI Engine Configuration</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-400 font-medium">Underlying Model:</span>
            <div className="font-bold text-navy-900 flex items-center space-x-1.5">
              <span>Google Gemini 3.5 Flash-Lite / Flash</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Low-latency reasoning model optimized for real-time civic tabular parsing and JSON structuring.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-400 font-medium">Security & API Privacy:</span>
            <div className="font-bold text-emerald-700 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Server-Side Isolated (Zero Client Leakage)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              API keys are strictly managed inside secure server environment variables (`process.env.GEMINI_API_KEY`).
            </p>
          </div>
        </div>
      </div>

      {/* Hackathon Project Metadata */}
      <div className="p-5 bg-gradient-to-r from-navy-900 to-navy-850 rounded-xl text-white shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              PromptWars Bhopal 2026
            </span>
          </div>
          <h4 className="text-sm font-bold">HawaSathi: From Air Data to Local Action</h4>
          <p className="text-xs text-slate-300">
            Engineered to empower local authorities, RWAs, and schools to convert raw sensor feeds into verified interventions.
          </p>
        </div>
        <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg font-mono font-semibold shrink-0">
          ₹50,000 Grand Prize Track
        </span>
      </div>
    </div>
  );
};
