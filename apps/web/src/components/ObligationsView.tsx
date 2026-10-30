'use client';

import React, { useState } from 'react';
import {
  FileCheck,
  Upload,
  CheckCircle2,
  Clock,
  Filter,
  FileText,
  RotateCcw
} from 'lucide-react';
import { clock } from '@anupalan/engine';

export interface ObligationItem {
  id: string;
  institutionId: string;
  institutionName: string;
  regionId: string;
  decisionId?: string;
  type: string;
  sourceRef: string;
  clause: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  title: string;
  description: string;
  dueOn: string;
  dueVersion: number;
  status: 'OPEN' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED_EVIDENCE' | 'WAIVED';
  evidenceDoc?: {
    id: string;
    fileName: string;
    fileUrl: string;
    submittedAt: string;
  };
  verificationNote?: string;
  verifiedBy?: string;
}

interface ObligationsViewProps {
  currentRole: string;
  obligations: ObligationItem[];
  onMutateObligations: (fn: (current: ObligationItem[]) => ObligationItem[]) => void;
  onRefresh: () => void;
}

export const ObligationsView: React.FC<ObligationsViewProps> = ({
  currentRole,
  obligations,
  onMutateObligations,
  onRefresh
}) => {
  const [selectedObligation, setSelectedObligation] = useState<ObligationItem | null>(null);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [evidenceFileName, setEvidenceFileName] = useState('');
  const [verificationNote, setVerificationNote] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleUploadEvidence = () => {
    if (!selectedObligation || !evidenceFileName.trim()) return;
    const now = clock.now();
    onMutateObligations(prev =>
      prev.map(item => {
        if (item.id === selectedObligation.id) {
          return {
            ...item,
            status: 'SUBMITTED',
            evidenceDoc: {
              id: `DOC-EV-${clock.now().getTime()}`,
              fileName: evidenceFileName,
              fileUrl: `/uploads/${evidenceFileName}`,
              submittedAt: now.toISOString()
            }
          };
        }
        return item;
      })
    );
    setEvidenceModalOpen(false);
    setEvidenceFileName('');
    showToast(`Compliance evidence "${evidenceFileName}" submitted for ${selectedObligation.id}.`);
  };

  const handleVerifyEvidence = (approved: boolean) => {
    if (!selectedObligation) return;
    const now = clock.now();
    onMutateObligations(prev =>
      prev.map(item => {
        if (item.id === selectedObligation.id) {
          return {
            ...item,
            status: approved ? 'VERIFIED' : 'REJECTED_EVIDENCE',
            verificationNote: verificationNote.trim() || (approved ? 'Compliance verified against APH norms.' : 'Deficiency observed in evidence.'),
            verifiedBy: currentRole,
            verifiedAt: now.toISOString()
          };
        }
        return item;
      })
    );
    setVerifyModalOpen(false);
    setVerificationNote('');
    showToast(`Obligation ${selectedObligation.id} marked as ${approved ? 'VERIFIED' : 'REJECTED'} by ${currentRole}.`);
  };

  const filteredObligations = obligations.filter(item => {
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg shadow-sm text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Obligation Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pillar 3 · Post-approval undertakings, 6-month deficiency rectifications, and periodic compliances.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-transparent border-0 text-slate-700 font-medium py-1 px-2 focus:ring-0 text-xs"
            >
              <option value="ALL">All Types</option>
              <option value="UNDERTAKING">Undertakings</option>
              <option value="DEFICIENCY">Deficiencies</option>
              <option value="NOC_RENEWAL">NOC Renewals</option>
              <option value="AFFIDAVIT">Affidavits</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-transparent border-0 text-slate-700 font-medium py-1 px-2 focus:ring-0 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED_EVIDENCE">Rejected</option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Obligations Grid/Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Obligation ID & Clause</th>
                <th className="px-4 py-3">Title & Requirements</th>
                <th className="px-4 py-3">Institution & Region</th>
                <th className="px-4 py-3">Due Date & SLA</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredObligations.map(item => {
                const isOverdue = clock.now() > clock.parse(item.dueOn);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 align-top font-mono">
                      <div className="font-bold text-slate-900">{item.id}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.clause}</div>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        item.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        item.severity === 'MAJOR' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-slate-800 text-xs">{item.title}</div>
                      <div className="text-slate-500 text-[11px] mt-1 max-w-sm line-clamp-2">{item.description}</div>
                      {item.evidenceDoc && (
                        <div className="mt-2 inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px]">
                          <FileText className="w-3 h-3" />
                          <span>{item.evidenceDoc.fileName}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-slate-800">{item.institutionName}</div>
                      <div className="text-[10px] text-slate-500">{item.regionId}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center space-x-1 text-slate-700 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{clock.parse(item.dueOn).toLocaleDateString('en-IN')}</span>
                      </div>
                      {isOverdue && item.status !== 'VERIFIED' && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded animate-pulse">
                          OVERDUE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        item.status === 'SUBMITTED' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                        item.status === 'REJECTED_EVIDENCE' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Institution upload evidence */}
                        {currentRole === 'INSTITUTION' && item.status !== 'VERIFIED' && (
                          <button
                            onClick={() => {
                              setSelectedObligation(item);
                              setEvidenceFileName(`Compliance_Proof_${item.id}.pdf`);
                              setEvidenceModalOpen(true);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Submit Proof</span>
                          </button>
                        )}

                        {/* Officer verification */}
                        {['SCRUTINY_OFFICER', 'REGIONAL_DIRECTOR', 'SYSTEM_ADMIN'].includes(currentRole) && item.status === 'SUBMITTED' && (
                          <button
                            onClick={() => {
                              setSelectedObligation(item);
                              setVerificationNote('');
                              setVerifyModalOpen(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verify Proof</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Submission Modal */}
      {evidenceModalOpen && selectedObligation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Upload Compliance Proof</h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide evidence document for obligation: <span className="font-mono font-semibold">{selectedObligation.id}</span>
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document File Name</label>
                <input
                  type="text"
                  value={evidenceFileName}
                  onChange={e => setEvidenceFileName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                All submitted proofs are timestamped with <span className="font-mono font-bold">clock.now()</span> and recorded into the sealed audit chain.
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setEvidenceModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadEvidence}
                className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {verifyModalOpen && selectedObligation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Officer Evidence Verification</h3>
            <p className="text-xs text-slate-500 mt-1">
              Verify submitted document: <span className="font-semibold text-indigo-700">{selectedObligation.evidenceDoc?.fileName}</span>
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Verification Note / Regulatory Remarks</label>
                <textarea
                  rows={3}
                  value={verificationNote}
                  onChange={e => setVerificationNote(e.target.value)}
                  placeholder="Record verification remarks (e.g. verified faculty appointment order with qualification check)..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => handleVerifyEvidence(false)}
                className="px-3 py-1.5 text-xs bg-rose-50 text-rose-700 border border-rose-200 font-semibold hover:bg-rose-100 rounded-lg"
              >
                Reject Proof
              </button>
              <button
                onClick={() => handleVerifyEvidence(true)}
                className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
              >
                Approve & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
