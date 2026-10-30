'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ComplianceViewProps {
  score?: number;
  institutionName?: string;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({
  score = 62,
  institutionName = 'Saraswati Institute of Technology & Engineering'
}) => {
  const isHealthy = score >= 70;
  const isModerate = score >= 40 && score < 70;

  const breakdown = [
    { category: 'Land & Lease Safety Margin', score: 18, max: 25, status: 'MODERATE', note: 'Campus lease deed expires in 30 days.' },
    { category: 'Post-Approval Undertakings', score: 14, max: 25, status: 'WARNING', note: 'Pending faculty recruitment appointment order.' },
    { category: 'Statutory NOCs (Fire, Affiliation)', score: 25, max: 25, status: 'EXCELLENT', note: 'All fire NOCs and university affiliations valid.' },
    { category: 'SLA Adherence on Deficiencies', score: 5, max: 25, status: 'CRITICAL', note: 'Scrutiny deficiencies resolved after T+3 overdue.' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-md ${
              isHealthy ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300' :
              isModerate ? 'bg-amber-100 text-amber-800 border-2 border-amber-300' :
              'bg-rose-100 text-rose-800 border-2 border-rose-300'
            }`}>
              {score}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isHealthy ? 'bg-emerald-100 text-emerald-800' :
                  isModerate ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {isHealthy ? 'Green Band · Low Risk' : isModerate ? 'Amber Band · Medium Risk' : 'Red Band · High Risk Inspection'}
                </span>
                <span className="text-xs text-slate-400 font-mono">1-100 Scale</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{institutionName}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pillar 6 · Real-time itemized compliance health score driving risk-prioritized inspection queues.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="text-slate-400 font-medium block">Verification Queue Impact</span>
              <span className="font-bold text-amber-700">Flagged for Priority EVC Visit</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="text-slate-400 font-medium block">Deficiency Margin</span>
              <span className="font-bold text-slate-800">-38 pts from Perfect</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Score Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Itemized Health Dimension Breakdown</span>
        </h3>

        <div className="space-y-4">
          {breakdown.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-slate-900">{item.category}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                    item.status === 'EXCELLENT' ? 'bg-emerald-100 text-emerald-800' :
                    item.status === 'MODERATE' ? 'bg-amber-100 text-amber-800' :
                    item.status === 'WARNING' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{item.note}</p>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-48">
                <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.score > 20 ? 'bg-emerald-500' : item.score > 10 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(item.score / item.max) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-slate-800 whitespace-nowrap">
                  {item.score} / {item.max}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
