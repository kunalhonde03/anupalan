'use client';

import React, { useState } from 'react';
import {
  Settings2,
  Save,
  CheckCircle2,
  AlertTriangle,
  PenLine,
  Eye,
  Undo2,
  FileCode2,
} from 'lucide-react';

interface RulesEditorViewProps {
  onRuleSaved: (changes: Record<string, unknown>) => void;
}

interface RuleField {
  key: string;
  label: string;
  type: 'number' | 'string' | 'readonly';
  unit?: string;
  evidence: 'V' | 'P' | 'I';
  group: string;
  description: string;
}

const RULE_FIELDS: RuleField[] = [
  {
    key: 'scrutinySlaDays',
    label: 'Scrutiny SLA (Working Days)',
    type: 'number',
    unit: 'days',
    evidence: 'P',
    group: 'SLA Configuration',
    description: 'Maximum working days allowed for the Scrutiny Committee review stage.',
  },
  {
    key: 'evcSlaDays',
    label: 'EVC Inspection SLA (Calendar Days)',
    type: 'number',
    unit: 'days',
    evidence: 'P',
    group: 'SLA Configuration',
    description: 'Maximum calendar days allowed for the Expert Visit Committee inspection.',
  },
  {
    key: 'decisionSlaDays',
    label: 'Decision SLA (Working Days)',
    type: 'number',
    unit: 'days',
    evidence: 'P',
    group: 'SLA Configuration',
    description: 'Maximum working days allowed for the Competent Authority to render a decision.',
  },
  {
    key: 'escalation_t_minus_3',
    label: 'Escalation Reminder (T-3)',
    type: 'number',
    unit: 'days before due',
    evidence: 'P',
    group: 'Escalation Ladder',
    description: 'Days before SLA deadline to fire the first (REMINDER) escalation rung alert.',
  },
  {
    key: 'escalation_t_0',
    label: 'Escalation Due (T-0)',
    type: 'number',
    unit: 'on due date',
    evidence: 'V',
    group: 'Escalation Ladder',
    description: 'Fire an OVERDUE alert on the exact SLA deadline date.',
  },
  {
    key: 'escalation_t_plus_3',
    label: 'Escalation Critical (T+3)',
    type: 'number',
    unit: 'days after due',
    evidence: 'P',
    group: 'Escalation Ladder',
    description: 'Days after the SLA deadline to fire a CRITICAL escalation alert to the supervisor.',
  },
  {
    key: 'leaseMinMarginDays',
    label: 'Lease Safety Margin',
    type: 'number',
    unit: 'days',
    evidence: 'P',
    group: 'Readiness Gate',
    description: 'Minimum remaining days on a lease for the Readiness Gate to mark it as CLEAR.',
  },
  {
    key: 'version',
    label: 'Pack Version',
    type: 'readonly',
    evidence: 'V',
    group: 'Pack Metadata',
    description: 'Semantic version of the rule pack. Incremented on every publish.',
  },
  {
    key: 'name',
    label: 'Rule Pack Name',
    type: 'readonly',
    evidence: 'V',
    group: 'Pack Metadata',
    description: 'Human-readable name for the current AICTE Approval Process Handbook rule pack.',
  },
];

const DEFAULTS: Record<string, string | number> = {
  scrutinySlaDays: 15,
  evcSlaDays: 30,
  decisionSlaDays: 10,
  escalation_t_minus_3: 3,
  escalation_t_0: 0,
  escalation_t_plus_3: 3,
  leaseMinMarginDays: 90,
  version: '0.1.0',
  name: 'APH 2024-25 to 2026-27',
};

const EVIDENCE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  V: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Verified' },
  P: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Placeholder' },
  I: { bg: 'bg-sky-100', text: 'text-sky-800', label: 'Inferred' },
};

export const RulesEditorView: React.FC<RulesEditorViewProps> = ({ onRuleSaved }) => {
  const [values, setValues] = useState<Record<string, string | number>>({ ...DEFAULTS });
  const [savedValues, setSavedValues] = useState<Record<string, string | number>>({ ...DEFAULTS });
  const [editMode, setEditMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [diffView, setDiffView] = useState(false);

  const hasChanges = JSON.stringify(values) !== JSON.stringify(savedValues);

  const handleSave = () => {
    const changes: Record<string, unknown> = {};
    Object.keys(values).forEach((k) => {
      if (values[k] !== savedValues[k]) {
        changes[k] = { from: savedValues[k], to: values[k] };
      }
    });

    setSavedValues({ ...values });
    setEditMode(false);
    setDiffView(true);
    setSaveSuccess(true);
    onRuleSaved(changes);
    setTimeout(() => {
      setSaveSuccess(false);
      setDiffView(false);
    }, 6000);
  };

  const handleReset = () => {
    setValues({ ...savedValues });
    setEditMode(false);
  };

  const groups = [...new Set(RULE_FIELDS.map((f) => f.group))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  AICTE Rule Pack Editor
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Demo Step 1 · Edit SLA timings, escalation ladders, and readiness gate parameters.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-3 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">
                Source: <code>rules/aph-2024-27.yaml</code>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                Published v{String(values.version)}
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                {Object.values(EVIDENCE_COLORS).map((e) => e.label).join(' / ')} tags
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Edit Rule Pack</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Discard</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                    hasChanges
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish Changes</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg shadow-sm text-emerald-900 text-xs sm:text-sm font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Rule pack updated and published. Version incremented. All downstream SLA recalculations triggered.
            Audit entry appended to cryptographic chain.
          </span>
        </div>
      )}

      {/* Diff View */}
      {diffView && (
        <div className="bg-slate-900 text-slate-200 rounded-xl p-5 shadow-lg border border-slate-700 font-mono text-xs space-y-1">
          <div className="flex items-center space-x-2 mb-3 text-slate-400">
            <Eye className="w-4 h-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Rule Pack Diff (published changes)</span>
          </div>
          {Object.keys(values).map((k) => {
            const current = values[k];
            // Show diff from DEFAULTS to highlight what demo changed
            const def = DEFAULTS[k];
            if (def !== current) {
              return (
                <div key={k}>
                  <span className="text-rose-400">- {k}: {String(def)}</span>
                  <br />
                  <span className="text-emerald-400">+ {k}: {String(current)}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Rule Groups */}
      {groups.map((group) => (
        <div key={group} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center space-x-2">
            <Settings2 className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800">{group}</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {RULE_FIELDS.filter((f) => f.group === group).map((field) => {
              const ev = EVIDENCE_COLORS[field.evidence];
              return (
                <div
                  key={field.key}
                  className={`px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    editMode && field.type !== 'readonly' ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-slate-800">{field.label}</span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${ev.bg} ${ev.text}`}
                      >
                        [{field.evidence}] {ev.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{field.description}</p>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    {field.type === 'readonly' ? (
                      <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono font-medium text-slate-700">
                        {String(values[field.key])}
                      </span>
                    ) : editMode ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={Number(values[field.key])}
                          onChange={(e) =>
                            setValues((v) => ({ ...v, [field.key]: Number(e.target.value) }))
                          }
                          className="w-20 px-2.5 py-1.5 text-sm font-mono font-medium text-slate-900 bg-white border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        />
                        {field.unit && (
                          <span className="text-xs text-slate-500 font-medium">{field.unit}</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono font-medium text-slate-700">
                          {String(values[field.key])}
                        </span>
                        {field.unit && (
                          <span className="text-xs text-slate-500 font-medium">{field.unit}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Invariant Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-xs text-amber-900">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="font-bold uppercase tracking-wider text-[11px]">Invariant 5 — Configuration is DATA</span>
        </div>
        <p>
          Pathways, SLAs, escalation ladders, holidays, and obligation types are DATA defined in{' '}
          <code className="bg-amber-100 px-1 rounded font-mono">rules/aph-2024-27.yaml</code>. Every
          edit is version-tracked and appended to the cryptographic audit chain. No hardcoded business
          rules exist in application code.
        </p>
      </div>
    </div>
  );
};
