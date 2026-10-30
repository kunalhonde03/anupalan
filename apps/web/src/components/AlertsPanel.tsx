'use client';

import React from 'react';
import {
  Bell,
  ShieldAlert,
  Info,
  X,
} from 'lucide-react';
import { clock } from '@anupalan/engine';

export interface AlertItem {
  id: string;
  itemId: string;
  itemType: 'STAGE' | 'OBLIGATION' | 'DOCUMENT';
  ruleId: string;
  level: 'REMINDER' | 'OVERDUE' | 'CRITICAL';
  dueVersion: number;
  targetRole: string;
  recipientName: string;
  title: string;
  message: string;
  firedAt: string;
  whyPanel: {
    ruleId: string;
    level: string;
    calculatedThresholdDate: string;
    dueOn: string;
    offsetDays: number;
    targetRole: string;
    clause: string;
    explanation: string;
  };
}

interface AlertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  isOpen,
  onClose,
  alerts,
}) => {
  const [selectedWhy, setSelectedWhy] = React.useState<AlertItem | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Regulatory Escalations & Alerts</h3>
              <p className="text-[11px] text-slate-500">Autonomous SLA notifications & multi-tier ladder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-600" />
              <p className="text-xs font-semibold text-slate-600">All regulatory timers are on schedule.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No overdue stages or lease warnings triggered.</p>
            </div>
          ) : (
            alerts.map(alert => {
              const isCritical = alert.level === 'CRITICAL';
              const isOverdue = alert.level === 'OVERDUE';
              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    isCritical
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : isOverdue
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        isCritical
                          ? 'bg-red-200 text-red-800'
                          : isOverdue
                          ? 'bg-amber-200 text-amber-800'
                          : 'bg-indigo-200 text-indigo-800'
                      }`}
                    >
                      {alert.level} Escalation
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {clock.parse(alert.firedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="font-bold mt-1 text-slate-900 text-xs">{alert.title}</h4>
                  <p className="mt-1 text-slate-700 text-[11px] leading-relaxed">{alert.message}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">To: {alert.targetRole}</span>
                    <button
                      onClick={() => setSelectedWhy(alert)}
                      className="inline-flex items-center space-x-1 text-indigo-700 hover:text-indigo-900 font-bold text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs"
                    >
                      <Info className="w-3 h-3 text-indigo-600" />
                      <span>Why did this fire?</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Why Modal */}
        {selectedWhy && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Regulatory Escalation Logic</h4>
                </div>
                <button
                  onClick={() => setSelectedWhy(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Rule ID & Policy</span>
                  <p className="font-mono text-indigo-700 font-bold">{selectedWhy.whyPanel.ruleId}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Statutory Clause</span>
                  <p className="font-mono text-slate-800">{selectedWhy.whyPanel.clause}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Due Date vs Threshold</span>
                  <p className="font-mono text-slate-700">
                    Deadline: {selectedWhy.whyPanel.dueOn} | Offset: {selectedWhy.whyPanel.offsetDays} days
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs leading-relaxed">
                  <span className="font-semibold block text-slate-900 mb-1">Mathematical Explanation:</span>
                  {selectedWhy.whyPanel.explanation}
                </div>
              </div>

              <div className="mt-5 text-right">
                <button
                  onClick={() => setSelectedWhy(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs"
                >
                  Close Explanation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
