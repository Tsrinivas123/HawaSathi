'use strict';
import React, { useState } from 'react';
import {
  ClipboardCheck,
  ShieldCheck,
  Building2,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  Copy,
  Check,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { StakeholderAction, StakeholderType } from '@/lib/types';

interface LocalActionsTabProps {
  actions: StakeholderAction[];
  currentStakeholder: StakeholderType;
  onUpdateActionStatus: (id: string, status: StakeholderAction['status']) => void;
}

export const LocalActionsTab: React.FC<LocalActionsTabProps> = ({
  actions,
  currentStakeholder,
  onUpdateActionStatus,
}) => {
  const [filterStakeholder, setFilterStakeholder] = useState<StakeholderType | 'all'>(currentStakeholder);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = actions.filter(
    (a) => filterStakeholder === 'all' || a.stakeholder === filterStakeholder
  );

  const handleCopyAction = (action: StakeholderAction) => {
    const text = `[HAWASATHI ACTION MEMO]\nTitle: ${action.actionTitle}\nTarget Wards: ${action.targetLocations.join(', ')}\nPriority: ${action.priority}\nDirective: ${action.description}\nEvidence Basis: ${action.evidenceBasis}`;
    navigator.clipboard.writeText(text);
    setCopiedId(action.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-navy-900 flex items-center space-x-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            <span>Targeted Local Interventions & Action Directives</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evidence-backed civic directives prioritized by stakeholder responsibilities.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setFilterStakeholder('all')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filterStakeholder === 'all'
                ? 'bg-white text-navy-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Roles ({actions.length})
          </button>
          <button
            onClick={() => setFilterStakeholder('ward_officer')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filterStakeholder === 'ward_officer'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ward Officer</span>
          </button>
          <button
            onClick={() => setFilterStakeholder('housing_society')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filterStakeholder === 'housing_society'
                ? 'bg-white text-amber-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Housing Society</span>
          </button>
          <button
            onClick={() => setFilterStakeholder('school_admin')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filterStakeholder === 'school_admin'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>School Admin</span>
          </button>
        </div>
      </div>

      {/* Action Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No action directives currently configured for this filter.
          </div>
        ) : (
          filtered.map((action) => (
            <div
              key={action.id}
              className={`p-5 rounded-xl border transition-all bg-white shadow-xs ${
                action.status === 'completed'
                  ? 'border-emerald-200 bg-emerald-50/10 opacity-75'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {action.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadge(
                        action.priority
                      )}`}
                    >
                      {action.priority} Priority
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        action.type === 'confirmed_action'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {action.type === 'confirmed_action' ? 'Confirmed Action' : 'Investigative Hypothesis'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-navy-900">
                    {action.actionTitle}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                {/* Status Switcher & Copy */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  <select
                    value={action.status}
                    onChange={(e) =>
                      onUpdateActionStatus(action.id, e.target.value as any)
                    }
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-hidden cursor-pointer ${
                      action.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : action.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="in_progress">🔄 In Progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>

                  <button
                    onClick={() => handleCopyAction(action)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer"
                    title="Copy Action Order Text"
                  >
                    {copiedId === action.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Footer Evidence & Target Locations */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Target Wards:</span>
                  <span className="font-semibold text-slate-800">
                    {action.targetLocations.join(', ')}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-slate-400">Evidence:</span>
                  <span className="font-medium text-slate-700 truncate max-w-xs">
                    {action.evidenceBasis}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
