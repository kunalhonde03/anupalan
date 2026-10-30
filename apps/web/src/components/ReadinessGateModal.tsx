'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileWarning,
  Info,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
} from 'lucide-react';

interface ReadinessItem {
  id: string;
  dimension: string;
  label: string;
  status: 'CLEAR' | 'WARN' | 'BLOCK';
  detail: string;
  clause?: string;
  dueOn?: string;
  severity?: string;
}

interface ReadinessGateModalProps {
  applicationId: string;
  caseNumber: string;
  institutionName: string;
  isOpen: boolean;
  onClose: () => void;
  onDecision: (decision: 'APPROVE' | 'CONDITIONAL' | 'REJECT', conditions: string) => void;
}

const MOCK_READINESS: ReadinessItem[] = [
  {
    id: 'RG-001',
    dimension: 'Obligations',
    label: 'Faculty Recruitment Undertaking',
    status: 'WARN',
    detail: 'Standing undertaking for Professor & Assoc. Professor appointment in Computer Engg due within 15 days.',
    clause: 'APH-2024-27-Ch6-Sec3',
    severity: 'MAJOR',
  },
  {
    id: 'RG-002',
    dimension: 'Obligations',
    label: 'Deficiency Compliance (Lab Equipment)',
    status: 'CLEAR',
    detail: 'All physical inspection lab deficiencies verified and cleared by WRO.',
  },
  {
    id: 'RG-003',
    dimension: 'Lease Validity',
    label: 'Campus Registered Lease Deed',
    status: 'WARN',
    detail: 'Registered lease expires in 30 days. Fall below 90-day minimum safety margin.',
    clause: 'APH-2024-27-Ch1-Sec4',
  },
  {
    id: 'RG-004',
    dimension: 'Documents',
    label: 'Fire Safety NOC',
    status: 'CLEAR',
    detail: 'Annual Fire Safety Certificate renewed through 2027.',
  },
  {
    id: 'RG-005',
    dimension: 'Compliance Index',
    label: 'Institutional Compliance Score',
    status: 'WARN',
    detail: 'Score: 62/100 (Amber band). Below the 70-point healthy threshold.',
  },
];

const STATUS_CONFIG = {
  CLEAR: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800',
    label: 'CLEAR',
  },
  WARN: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800',
    label: 'WARNING',
  },
  BLOCK: {
    icon: XCircle,
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    iconColor: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-800',
    label: 'BLOCKED',
  },
};

export const ReadinessGateModal: React.FC<ReadinessGateModalProps> = ({
  applicationId,
  caseNumber,
  institutionName,
  isOpen,
  onClose,
  onDecision,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [decision, setDecision] = useState<'APPROVE' | 'CONDITIONAL' | 'REJECT' | null>(null);
  const [conditions, setConditions] = useState('');
  const [decided, setDecided] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const clearCount = MOCK_READINESS.filter((r) => r.status === 'CLEAR').length;
  const warnCount = MOCK_READINESS.filter((r) => r.status === 'WARN').length;
  const blockCount = MOCK_READINESS.filter((r) => r.status === 'BLOCK').length;

  const dimensions = [...new Set(MOCK_READINESS.map((r) => r.dimension))];

  const handleDecide = () => {
    if (decision) {
      onDecision(decision, conditions);
      setDecided(true);
      // Automatically close modal after 1.8 seconds so it NEVER blocks subsequent views
      setTimeout(() => {
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[88vh] flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Advisory Readiness Gate
                </h2>
                <p className="text-[11px] text-slate-500">
                  Demo Step 6 · Case {caseNumber} ({applicationId}) — {institutionName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              data-testid="close-readiness-x"
              aria-label="Close Readiness Gate"
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Summary Badges */}
          <div className="flex items-center space-x-2 mt-3">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>{clearCount} Clear</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3" />
              <span>{warnCount} Warnings</span>
            </span>
            {blockCount > 0 && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                <XCircle className="w-3 h-3" />
                <span>{blockCount} Blockers</span>
              </span>
            )}
          </div>
        </div>

        {/* Invariant Banner */}
        <div className="shrink-0 bg-indigo-50 border-b border-indigo-100 px-6 py-2 text-[11px] text-indigo-900 flex items-center space-x-2">
          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>
            <strong>Invariant 1:</strong> This gate is advisory only. The system never auto-approves. Only a named human actor may decide.
          </span>
        </div>

        {/* Scrollable Dimensions List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {dimensions.map((dim) => (
            <div key={dim}>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {dim}
              </h3>
              <div className="space-y-1.5">
                {MOCK_READINESS.filter((r) => r.dimension === dim).map((item) => {
                  const cfg = STATUS_CONFIG[item.status];
                  const StatusIcon = cfg.icon;
                  const expanded = expandedId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`${cfg.bg} border ${cfg.border} rounded-lg overflow-hidden transition-all text-xs`}
                    >
                      <button
                        onClick={() => setExpandedId(expanded ? null : item.id)}
                        className="w-full px-3 py-2 flex items-center justify-between text-left"
                      >
                        <div className="flex items-center space-x-2.5">
                          <StatusIcon className={`w-4 h-4 ${cfg.iconColor} shrink-0`} />
                          <div>
                            <span className={`font-semibold ${cfg.text}`}>{item.label}</span>
                            {item.severity && (
                              <span className="ml-2 text-[9px] font-bold bg-white/80 px-1.5 py-0.2 rounded border border-current">
                                {item.severity}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`${cfg.badge} px-1.5 py-0.2 rounded text-[9px] font-bold`}>
                            {cfg.label}
                          </span>
                          {expanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {expanded && (
                        <div className="px-3 pb-2 border-t border-current/10 pt-1.5 text-[11px] text-slate-700 space-y-0.5">
                          <p>{item.detail}</p>
                          {item.clause && (
                            <p className="font-mono text-[10px] text-slate-500">
                              Clause: {item.clause}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Fixed Non-Clipped Decision Footer */}
        <div className="shrink-0 bg-white border-t border-slate-200 px-6 py-3.5 rounded-b-2xl shadow-lg">
          {!decided ? (
            <>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Statutory Human Decision Required</span>
                </h3>
                <span className="text-[10px] font-semibold text-slate-500">Actor: Prof. T. G. Sitharam (Chairman)</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                <button
                  type="button"
                  onClick={() => setDecision('APPROVE')}
                  className={`py-2 px-3 rounded-lg border-2 text-center text-xs font-bold transition-all ${
                    decision === 'APPROVE'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'border-slate-200 hover:border-emerald-300 text-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-0.5" />
                  Approve
                </button>
                <button
                  type="button"
                  data-testid="btn-conditional-approval"
                  onClick={() => setDecision('CONDITIONAL')}
                  className={`py-2 px-3 rounded-lg border-2 text-center text-xs font-bold transition-all ${
                    decision === 'CONDITIONAL'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs ring-2 ring-amber-300'
                      : 'border-slate-200 hover:border-amber-300 text-slate-600'
                  }`}
                >
                  <FileWarning className="w-4 h-4 mx-auto mb-0.5" />
                  Conditional Approval
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REJECT')}
                  className={`py-2 px-3 rounded-lg border-2 text-center text-xs font-bold transition-all ${
                    decision === 'REJECT'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-xs'
                      : 'border-slate-200 hover:border-rose-300 text-slate-600'
                  }`}
                >
                  <XCircle className="w-4 h-4 mx-auto mb-0.5" />
                  Reject
                </button>
              </div>

              {decision === 'CONDITIONAL' && (
                <textarea
                  value={conditions}
                  data-testid="textarea-conditions"
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="Specify statutory conditions and obligations to be attached to approval..."
                  className="w-full border-2 border-amber-400 rounded-lg p-2 text-xs text-slate-900 bg-amber-50/70 focus:border-amber-600 outline-none mb-2.5 resize-none h-14"
                />
              )}

              <button
                type="button"
                data-testid="btn-record-decision"
                onClick={handleDecide}
                disabled={!decision}
                className={`w-full py-2.5 rounded-lg text-xs font-bold shadow-md transition-all ${
                  decision
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-700 text-white hover:from-indigo-700 hover:to-violet-800 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Sign & Record Statutory Decision
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center space-x-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-950">
                    Decision Recorded: {decision}
                    {decision === 'CONDITIONAL' && conditions && ` — "${conditions}"`}
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Audit entry appended. Obligations ledger updated. Auto-closing in 2 seconds...
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                Close & Return to Workflows
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
