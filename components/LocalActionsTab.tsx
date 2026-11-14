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

export const LocalActionsTab: React.FC<LocalActionsTabProps> = ({
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

  const filtered = actions.filter(
    (a) => filterStakeholder === 'all' || a.stakeholder === filterStakeholder
  );

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

        <div className="flex flex-wrap items-center gap-2">
          {/* Create Action Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Dispatch New Action</span>
          </button>

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

      {/* Create New Action Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold">Dispatch New Civic Action Order</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deploy Mist Cannons along Kolar Road"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational Directive</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Specific task details, schedules, and instructions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Stakeholder</label>
                  <select
                    value={newStakeholder}
                    onChange={(e) => setNewStakeholder(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="ward_officer">Ward Officer</option>
                    <option value="housing_society">Housing Society</option>
                    <option value="school_admin">School Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Locations / Wards (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Ward 48, MP Nagar Zone-1"
                  value={newLocations}
                  onChange={(e) => setNewLocations(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Evidence Basis / Telemetry Note</label>
                <input
                  type="text"
                  placeholder="e.g. Traceable to REC-001 with PM2.5 > 140 µg/m³"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Create Action Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
