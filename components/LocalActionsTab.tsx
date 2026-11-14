'use strict';
/**
 * @file LocalActionsTab.tsx
 * @description Local interventions and stakeholder action dispatch studio.
 * Optimized with memoized filtering, typed action dispatches, and React.memo.
 */

import React, { useState, useMemo, memo } from 'react';
import {
  ClipboardCheck,
  ShieldCheck,
  Building2,
  GraduationCap,
  Copy,
  Check,
  MapPin,
  PlusCircle,
  X,
} from 'lucide-react';
import { StakeholderAction, StakeholderType } from '@/lib/types';

interface LocalActionsTabProps {
  actions: StakeholderAction[];
  currentStakeholder: StakeholderType;
  onUpdateActionStatus: (id: string, status: StakeholderAction['status']) => void;
  onCreateAction?: (action: StakeholderAction) => void;
}

const LocalActionsTabComponent: React.FC<LocalActionsTabProps> = ({
  actions,
  currentStakeholder,
  onUpdateActionStatus,
  onCreateAction,
}) => {
  const [filterStakeholder, setFilterStakeholder] = useState<StakeholderType | 'all'>(currentStakeholder);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New action form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStakeholder, setNewStakeholder] = useState<StakeholderType>(currentStakeholder);
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newLocations, setNewLocations] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [newType, setNewType] = useState<'confirmed_action' | 'investigative_hypothesis'>('confirmed_action');

  // Efficiency: memoize filtered actions
  const filtered = useMemo(() => {
    return actions.filter(
      (a) => filterStakeholder === 'all' || a.stakeholder === filterStakeholder
    );
  }, [actions, filterStakeholder]);

  const handleCopyAction = (action: StakeholderAction) => {
    const text = `[HAWASATHI ACTION MEMO]\nTitle: ${action.actionTitle}\nTarget Wards: ${action.targetLocations.join(', ')}\nPriority: ${action.priority}\nDirective: ${action.description}\nEvidence Basis: ${action.evidenceBasis}`;
    navigator.clipboard.writeText(text);
    setCopiedId(action.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const newAct: StakeholderAction = {
      id: `ACT-${String(actions.length + 1).padStart(2, '0')}`,
      stakeholder: newStakeholder,
      priority: newPriority,
      actionTitle: newTitle.trim(),
      description: newDescription.trim(),
      targetLocations: newLocations.split(',').map((s) => s.trim()).filter(Boolean),
      evidenceBasis: newEvidence.trim() || 'Observed telemetry anomaly requiring field dispatch',
      type: newType,
      status: 'pending',
    };

    if (onCreateAction) {
      onCreateAction(newAct);
    }
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewLocations('');
    setNewEvidence('');
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
      <section aria-label="Action Directives Filter" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-navy-900 flex items-center space-x-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <span>Targeted Local Interventions & Action Directives</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evidence-backed civic directives prioritized by stakeholder responsibilities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Create Action Button */}
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            aria-label="Dispatch New Civic Action Directive"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Dispatch New Action</span>
          </button>

          {/* Filter buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium" role="group" aria-label="Filter Actions by Role">
            <button
              type="button"
              onClick={() => setFilterStakeholder('all')}
              aria-pressed={filterStakeholder === 'all'}
              aria-label="Show all action roles"
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStakeholder === 'all'
                  ? 'bg-white text-navy-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Roles ({actions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStakeholder('ward_officer')}
              aria-pressed={filterStakeholder === 'ward_officer'}
              aria-label="Filter by Ward Officer"
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStakeholder === 'ward_officer'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ward Officer</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStakeholder('housing_society')}
              aria-pressed={filterStakeholder === 'housing_society'}
              aria-label="Filter by Housing Society"
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStakeholder === 'housing_society'
                  ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Housing Society</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStakeholder('school_admin')}
              aria-pressed={filterStakeholder === 'school_admin'}
              aria-label="Filter by School Administrator"
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStakeholder === 'school_admin'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
              <span>School Admin</span>
            </button>
          </div>
        </div>
      </section>

      {/* Action Cards List */}
      <section aria-label="Action Directives List" className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 text-slate-400 text-xs">
            No action directives currently configured for this filter.
          </div>
        ) : (
          filtered.map((action) => (
            <div
              key={action.id}
              className={`p-5 rounded-2xl border transition-all bg-white shadow-2xs ${
                action.status === 'completed'
                  ? 'border-emerald-200 bg-emerald-50/10 opacity-75'
                  : 'border-slate-200/90 hover:border-slate-300'
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
                  <label htmlFor={`status-select-${action.id}`} className="sr-only">Action Status</label>
                  <select
                    id={`status-select-${action.id}`}
                    value={action.status}
                    onChange={(e) =>
                      onUpdateActionStatus(action.id, e.target.value as StakeholderAction['status'])
                    }
                    aria-label={`Update status for ${action.id}`}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-hidden ${
                      action.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : action.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleCopyAction(action)}
                    aria-label={`Copy action directive ${action.id}`}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    {copiedId === action.id ? (
                      <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <Copy className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center space-x-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>Target Wards: </span>
                  <span className="font-semibold text-slate-700">
                    {action.targetLocations.join(', ')}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-slate-500">
                  <span className="font-medium">Evidence Basis: </span>
                  <span>{action.evidenceBasis}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Modal: Create Custom Action */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-action-title"
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="modal-action-title" className="text-base font-bold text-navy-900">
                Dispatch New Civic Action Directive
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close modal"
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="action-title" className="block text-xs font-semibold text-slate-700 mb-1">
                  Action Directive Title
                </label>
                <input
                  id="action-title"
                  type="text"
                  required
                  placeholder="e.g., Deploy Mist Cannon to MP Nagar Junction"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="target-stakeholder-select" className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Stakeholder
                  </label>
                  <select
                    id="target-stakeholder-select"
                    value={newStakeholder}
                    onChange={(e) => setNewStakeholder(e.target.value as StakeholderType)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="ward_officer">Ward Officer (ULB)</option>
                    <option value="housing_society">Housing Society (RWA)</option>
                    <option value="school_admin">School Administrator</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="action-priority-select" className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority Tier
                  </label>
                  <select
                    id="action-priority-select"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="action-type-select" className="block text-xs font-semibold text-slate-700 mb-1">
                    Action Classification
                  </label>
                  <select
                    id="action-type-select"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'confirmed_action' | 'investigative_hypothesis')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="confirmed_action">Confirmed Action</option>
                    <option value="investigative_hypothesis">Investigative Hypothesis</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="action-directive-desc" className="block text-xs font-semibold text-slate-700 mb-1">
                  Directive Description & SOP Instructions
                </label>
                <textarea
                  id="action-directive-desc"
                  required
                  rows={3}
                  placeholder="Specific actions to be executed by the field team..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="target-locations-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Wards / Locations (comma-separated)
                </label>
                <input
                  id="target-locations-input"
                  type="text"
                  placeholder="e.g., MP Nagar Zone-1, Ward 48"
                  value={newLocations}
                  onChange={(e) => setNewLocations(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="evidence-basis-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Evidence Basis (Sensor Record ID or Observed Anomaly)
                </label>
                <input
                  id="evidence-basis-input"
                  type="text"
                  placeholder="e.g., Elevated PM2.5 detected in REC-001 (148.5 µg/m³)"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs cursor-pointer"
                >
                  Create Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const LocalActionsTab = memo(LocalActionsTabComponent);
