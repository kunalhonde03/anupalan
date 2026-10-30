'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  Send,
  Eye,
  PlusCircle,
  Search,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { clock } from '@anupalan/engine';

export interface ClockSegmentItem {
  party: 'AICTE' | 'INSTITUTION';
  startAt: string;
  endAt?: string;
}

export interface StageInstanceItem {
  id: string;
  stageCode: string;
  stageName: string;
  passNo: number;
  startedAt: string;
  dueOn: string;
  dueVersion: number;
  clockSegments: ClockSegmentItem[];
}

export interface AppItem {
  id: string;
  caseNumber: string;
  institutionId: string;
  institutionName: string;
  regionId: string;
  regionName: string;
  typeCode: string;
  typeName: string;
  pathwayCode: string;
  packVersion: string;
  currentStage: string;
  status: string;
  submittedAt: string;
  lastActionAt: string;
  decisionOutcome?: string;
  stageInstances: StageInstanceItem[];
}

interface ApplicationsViewProps {
  currentRole: string;
  onOpenReadinessGate: (app: AppItem) => void;
  applications: AppItem[];
  onRefresh: () => void;
  onMutateApp: (fn: (current: AppItem[]) => AppItem[]) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  currentRole,
  onOpenReadinessGate,
  applications,
  onRefresh,
  onMutateApp,
}) => {
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [statutoryClause, setStatutoryClause] = useState('APH-2024-27-Ch6-Sec3');
  const [returnError, setReturnError] = useState('');
  const [blockedModalOpen, setBlockedModalOpen] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submittingType, setSubmittingType] = useState('NEW_COURSE');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');

  // Demo Step 2: Submit Application
  const handleCreateApplication = () => {
    const isNewCourse = submittingType === 'NEW_COURSE';
    const currentNow = clock.now();
    const caseNumber = isNewCourse
      ? `F.No. Western/1-100200300/2026/NEW-CRS-${Math.floor(100 + Math.random() * 900)}`
      : `F.No. Western/1-100200300/2026/EOA-${Math.floor(100 + Math.random() * 900)}`;

    const newApp: AppItem = {
      id: `APP-${currentNow.getTime()}`,
      caseNumber,
      institutionId: 'INST-DEMO',
      institutionName: 'Saraswati Institute of Technology & Engineering',
      regionId: 'REG-WEST',
      regionName: 'Western Regional Office (Mumbai)',
      typeCode: submittingType,
      typeName: isNewCourse
        ? 'New Course Approval: Artificial Intelligence & Data Science (B.Tech, 60 Seats)'
        : 'Extension of Approval (EoA) Academic Year 2026-27',
      pathwayCode: isNewCourse ? 'scrutiny_evc' : 'only_scrutiny',
      packVersion: '0.1.0',
      currentStage: 'SCRUTINY',
      status: 'UNDER_REVIEW',
      submittedAt: currentNow.toISOString(),
      lastActionAt: currentNow.toISOString(),
      stageInstances: [
        {
          id: `STG-${currentNow.getTime()}`,
          stageCode: 'SCRUTINY',
          stageName: 'Scrutiny Committee Review (Western Region)',
          passNo: 1,
          startedAt: currentNow.toISOString(),
          dueOn: clock.addDays(currentNow, 15).toISOString(),
          dueVersion: 1,
          clockSegments: [{ party: 'AICTE' as const, startAt: currentNow.toISOString() }],
        },
      ],
    };

    onMutateApp((prev) => [newApp, ...prev]);
    setSubmitModalOpen(false);
    setActionSuccessMsg(`Formal application registered: ${caseNumber}. Routed dynamically to ${newApp.pathwayCode} statutory pathway.`);
    setTimeout(() => setActionSuccessMsg(''), 6000);
  };

  // Demo Step 2: Attempt Illegal Jump
  const handleIllegalJump = (appItem: AppItem) => {
    if (appItem.pathwayCode === 'scrutiny_evc' && appItem.currentStage === 'SCRUTINY') {
      setBlockedMessage(
        `STATUTORY INVARIANT REFUSAL: Attempted unlawful stage transition from SCRUTINY directly to DECISION on case ${appItem.caseNumber}. The configured AICTE APH 2024-27 rule pack strictly mandates Expert Visit Committee (EVC) on-site inspection before submission to the Competent Authority. Transaction rejected and logged to the tamper-evident cryptographic audit ledger.`
      );
      setBlockedModalOpen(true);
      return;
    }
    handleCompleteStage(appItem);
  };

  // Demo Step 3: Return with Reason
  const handleConfirmReturn = () => {
    if (!returnReason || returnReason.trim().length === 0) {
      setReturnError('ANUPALAN Invariant 7 Violation: A statutory Return / Deficiency Memo strictly requires an official non-empty reason citing governing regulations. Empty submission rejected.');
      return;
    }

    if (!selectedApp) return;

    const currentNow = clock.now();
    onMutateApp((prev) =>
      prev.map((a) => {
        if (a.id === selectedApp.id) {
          const currentStage = a.stageInstances[a.stageInstances.length - 1];
          currentStage.clockSegments = [
            ...currentStage.clockSegments.map((s: ClockSegmentItem, idx: number) =>
              idx === currentStage.clockSegments.length - 1 ? { ...s, endAt: currentNow.toISOString() } : s
            ),
            { party: 'INSTITUTION' as const, startAt: currentNow.toISOString() },
          ];
          currentStage.dueVersion += 1;
          return {
            ...a,
            status: 'RETURNED',
            lastActionAt: currentNow.toISOString(),
          };
        }
        return a;
      })
    );

    setReturnModalOpen(false);
    setReturnReason('');
    setReturnError('');
    setActionSuccessMsg(`Official Deficiency Notice dispatched for case ${selectedApp.caseNumber}. AICTE review clock PAUSED; Institution response clock ACTIVATED. Officer: Dr. Ramesh Sharma.`);
    setTimeout(() => setActionSuccessMsg(''), 6000);
  };

  // Demo Step 4: Resubmit
  const handleResubmit = (appItem: AppItem) => {
    const currentNow = clock.now();
    onMutateApp((prev) =>
      prev.map((a) => {
        if (a.id === appItem.id) {
          const currentStage = a.stageInstances[a.stageInstances.length - 1];
          currentStage.clockSegments = [
            ...currentStage.clockSegments.map((s: ClockSegmentItem, idx: number) =>
              idx === currentStage.clockSegments.length - 1 ? { ...s, endAt: currentNow.toISOString() } : s
            ),
            { party: 'AICTE' as const, startAt: currentNow.toISOString() },
          ];
          currentStage.dueVersion += 1;
          return {
            ...a,
            status: 'UNDER_REVIEW',
            lastActionAt: currentNow.toISOString(),
          };
        }
        return a;
      })
    );

    setActionSuccessMsg(`Institution uploaded compliance clarification for ${appItem.caseNumber}. AICTE statutory review clock RESUMED with remaining allocated SLA days.`);
    setTimeout(() => setActionSuccessMsg(''), 6000);
  };

  // Complete Stage & Advance
  const handleCompleteStage = (appItem: AppItem) => {
    const currentNow = clock.now();
    const isScrutiny = appItem.currentStage === 'SCRUTINY';
    const nextStage = isScrutiny && appItem.pathwayCode === 'scrutiny_evc' ? 'EVC' : 'DECISION';

    onMutateApp((prev) =>
      prev.map((a) => {
        if (a.id === appItem.id) {
          return {
            ...a,
            currentStage: nextStage,
            lastActionAt: currentNow.toISOString(),
            stageInstances: [
              ...a.stageInstances,
              {
                id: `STG-${currentNow.getTime()}`,
                stageCode: nextStage,
                stageName: nextStage === 'EVC' ? 'Expert Visit Committee (EVC) Physical Inspection' : 'Competent Authority Final Order & Decision',
                passNo: 1,
                startedAt: currentNow.toISOString(),
                dueOn: clock.addDays(currentNow, 25).toISOString(),
                dueVersion: 1,
                clockSegments: [{ party: 'AICTE' as const, startAt: currentNow.toISOString() }],
              },
            ],
          };
        }
        return a;
      })
    );

    setActionSuccessMsg(`Stage completed with authorized human signatory. Case ${appItem.caseNumber} advanced to ${nextStage} queue.`);
    setTimeout(() => setActionSuccessMsg(''), 6000);
  };

  const filteredApplications = applications.filter((app) => {
    if (stageFilter !== 'ALL' && app.currentStage !== stageFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.caseNumber.toLowerCase().includes(q) ||
        app.institutionName.toLowerCase().includes(q) ||
        app.typeName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Action Notification Banner */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3.5 rounded-r-lg shadow-xs text-emerald-950 text-xs sm:text-sm font-medium flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-800 hover:text-emerald-950 text-xs font-bold px-2 py-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Statutory Applications Review Queue</span>
            <span className="text-xs font-normal text-slate-400">| सांविधिक आवेदन समीक्षा कार्यप्रणाली</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Dynamic pathway routing adhering to APH 2024-27 with Dual-Clock SLA attribution (AICTE time vs. Applicant institution time).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentRole === 'INSTITUTION' && (
            <button
              onClick={() => setSubmitModalOpen(true)}
              className="flex items-center space-x-1.5 bg-[#003366] hover:bg-[#002244] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>Submit Application (Step 2)</span>
            </button>
          )}

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Case No. or College..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#003366] w-52"
              />
            </div>

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-[#003366]"
            >
              <option value="ALL">All Stages</option>
              <option value="SCRUTINY">Scrutiny Stage</option>
              <option value="EVC">EVC Inspection Stage</option>
              <option value="DECISION">Competent Authority Decision</option>
            </select>

            <button
              onClick={onRefresh}
              className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              title="Refresh Registry"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Applications Cards/Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Statutory File No. & Scheme</th>
                <th className="px-4 py-3">Institution & Jurisdiction</th>
                <th className="px-4 py-3">Application Programme</th>
                <th className="px-4 py-3">Workflow Pathway</th>
                <th className="px-4 py-3">Regulatory Status</th>
                <th className="px-4 py-3">Dual-Clock SLA Attribution</th>
                <th className="px-4 py-3 text-right">Official Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredApplications.map((app) => {
                const currentStageInstance = app.stageInstances[app.stageInstances.length - 1];
                const activeSegment = currentStageInstance?.clockSegments[currentStageInstance.clockSegments.length - 1];
                const isAicteClock = activeSegment?.party === 'AICTE';
                const isReturned = app.status === 'RETURNED';

                return (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Case Number */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-mono font-bold text-slate-900 tracking-tight">
                        {app.caseNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Permanent ID: {app.institutionId}
                      </div>
                    </td>

                    {/* Institution */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-xs">{app.institutionName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{app.regionName}</div>
                    </td>

                    {/* Programme & Course */}
                    <td className="px-4 py-3.5 align-top max-w-xs">
                      <div className="font-medium text-slate-800 line-clamp-2">{app.typeName}</div>
                    </td>

                    {/* Pathway */}
                    <td className="px-4 py-3.5 align-top">
                      <span className="inline-block px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {app.pathwayCode === 'scrutiny_evc' ? 'Scrutiny ➔ EVC ➔ Decision' : 'Scrutiny ➔ Decision'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">Stage: {app.currentStage}</div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 align-top">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          app.status === 'APPROVED' || app.status === 'CONDITIONAL'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : isReturned
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-blue-50 text-blue-900 border-blue-200'
                        }`}
                      >
                        {app.status === 'UNDER_REVIEW' ? 'UNDER SCRUTINY' : app.status}
                      </span>
                    </td>

                    {/* Dual Clock Attribution */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="bg-slate-50 border border-slate-200 rounded p-1.5 space-y-1 font-mono text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center space-x-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${isAicteClock ? 'bg-indigo-600 animate-pulse' : 'bg-slate-400'}`} />
                            <span className="text-slate-600">AICTE SLA:</span>
                          </span>
                          <span className="font-bold text-slate-900">4 / 15 Working Days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center space-x-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${!isAicteClock ? 'bg-amber-600 animate-pulse' : 'bg-slate-300'}`} />
                            <span className="text-slate-500">Applicant:</span>
                          </span>
                          <span className={`font-semibold ${isReturned ? 'text-amber-700' : 'text-slate-400'}`}>
                            {isReturned ? 'Active Response Clock' : 'Paused (0d)'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Official Actions */}
                    <td className="px-4 py-3.5 align-top text-right space-x-1.5">
                      {/* Officer actions for Scrutiny */}
                      {app.currentStage === 'SCRUTINY' && (currentRole === 'SCRUTINY_OFFICER' || currentRole === 'SYSTEM_ADMIN') && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setReturnModalOpen(true);
                            }}
                            className="inline-flex items-center px-2 py-1 text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 rounded hover:bg-amber-100 transition-colors"
                            title="Issue Deficiency Memo to applicant (pauses AICTE clock)"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Return (Step 3)
                          </button>

                          <button
                            onClick={() => handleIllegalJump(app)}
                            className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold bg-[#003366] hover:bg-[#002244] text-white rounded transition-colors shadow-xs"
                            title="Attempt to advance stage (blocked if skipping EVC)"
                          >
                            <span>Forward (Step 2)</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </button>
                        </>
                      )}

                      {/* Institution action for Resubmit */}
                      {app.status === 'RETURNED' && (currentRole === 'INSTITUTION' || currentRole === 'SYSTEM_ADMIN') && (
                        <button
                          onClick={() => handleResubmit(app)}
                          className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800 transition-colors shadow-xs"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Resubmit Clarification (Step 4)
                        </button>
                      )}

                      {/* Regional Director action for EVC */}
                      {app.currentStage === 'EVC' && (currentRole === 'REGIONAL_DIRECTOR' || currentRole === 'SYSTEM_ADMIN') && (
                        <button
                          onClick={() => handleCompleteStage(app)}
                          className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold bg-[#003366] text-white rounded hover:bg-[#002244] transition-colors shadow-xs"
                        >
                          <span>Confirm EVC Inspection (Step 6)</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      )}

                      {/* HQ Competent Authority Decision Action */}
                      {(app.currentStage === 'DECISION' || currentRole === 'COMPETENT_AUTHORITY' || currentRole === 'SYSTEM_ADMIN') && (
                        <button
                          onClick={() => onOpenReadinessGate(app)}
                          className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold bg-rose-700 text-white rounded hover:bg-rose-800 transition-colors shadow-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          <span>Assess Readiness Gate (Step 6)</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Submit Application (Demo Step 2) */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center font-bold text-sm">
                अ
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Statutory Application Filing</h3>
                <p className="text-[11px] text-slate-500">AICTE Approval Process Handbook (APH 2024-27)</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label
                onClick={() => setSubmittingType('NEW_COURSE')}
                className={`p-3.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                  submittingType === 'NEW_COURSE' ? 'border-[#003366] bg-slate-50 shadow-xs' : 'border-slate-200 hover:bg-slate-50/50'
                }`}
              >
                <input type="radio" checked={submittingType === 'NEW_COURSE'} onChange={() => {}} className="mt-1 text-[#003366]" />
                <div>
                  <div className="text-xs font-bold text-slate-900">New Technical Course / Intake Expansion</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Requires on-site inspection. Statutory Pathway: <code>Scrutiny ➔ EVC ➔ Decision</code> (`scrutiny_evc`).
                  </div>
                </div>
              </label>

              <label
                onClick={() => setSubmittingType('EOA_EXISTING')}
                className={`p-3.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                  submittingType === 'EOA_EXISTING' ? 'border-[#003366] bg-slate-50 shadow-xs' : 'border-slate-200 hover:bg-slate-50/50'
                }`}
              >
                <input type="radio" checked={submittingType === 'EOA_EXISTING'} onChange={() => {}} className="mt-1 text-[#003366]" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Extension of Approval (EoA - Existing Institute)</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Fast-track compliance renewal. Statutory Pathway: <code>Scrutiny ➔ Decision</code> (`only_scrutiny`).
                  </div>
                </div>
              </label>
            </div>

            <div className="mt-6 flex justify-end space-x-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApplication}
                className="px-4 py-1.5 text-xs bg-[#003366] hover:bg-[#002244] text-white font-semibold rounded-lg shadow-xs"
              >
                Register Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Return with Deficiency Memo (Demo Step 3) */}
      {returnModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Form APH-DEF-01: Deficiency / Revert Memo</h3>
                <p className="text-[11px] text-slate-500">Case No: {selectedApp.caseNumber}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Statutory Non-Compliance Clause (APH 2024-27)
                </label>
                <select
                  value={statutoryClause}
                  onChange={(e) => setStatutoryClause(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                >
                  <option value="APH-2024-27-Ch6-Sec3">Clause 6.3 - Faculty Cadre Ratio Deficiency in Computer Science</option>
                  <option value="APH-2024-27-Ch1-Sec4">Clause 1.4 - Registered Land Lease Safety Margin Insufficient</option>
                  <option value="APH-2024-27-Ch2-Sec4">Clause 2.4 - Expired Fire Safety Certificate or Municipal NOC</option>
                  <option value="APH-2024-27-Ch3-Sec2">Clause 3.2 - Laboratory Equipment Shortfall as per Curriculum</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Specific Scrutiny Observations / Deficiency Directive <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={returnReason}
                  onChange={(e) => {
                    setReturnReason(e.target.value);
                    setReturnError('');
                  }}
                  placeholder="Enter specific deficiency observed. (Mandatory under Invariant 7 - empty submissions strictly rejected)..."
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-[#003366]"
                />
                {returnError && (
                  <p className="text-[11px] font-bold text-rose-700 mt-1 bg-rose-50 p-2 rounded border border-rose-200">
                    {returnError}
                  </p>
                )}
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <strong>Statutory Clock Effect:</strong> The AICTE review clock will immediately PAUSE. The applicant institution will be allocated 15 calendar days to submit compliance evidence.
              </div>
            </div>

            <div className="mt-5 flex justify-end space-x-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => {
                  setReturnModalOpen(false);
                  setReturnError('');
                }}
                className="px-3 py-1.5 text-xs text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                className="px-4 py-1.5 text-xs bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg shadow-xs"
              >
                Sign & Issue Deficiency Memo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Blocked Transition (Demo Step 2) */}
      {blockedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-rose-600 animate-in zoom-in-95">
            <div className="flex items-center space-x-2.5 text-rose-700 pb-3 border-b border-rose-100">
              <AlertOctagon className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">STATUTORY INVARIANT REFUSAL: ILLEGAL STAGE SKIP</h3>
                <p className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider">Security Rule Pack Enforcement</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 mt-4 leading-relaxed font-medium">
              {blockedMessage}
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600">
              Transaction Code: REFUSED_ILLEGAL_STAGE_SKIP<br />
              Action Signed: BLOCKED_TRANSITION<br />
              Hash Chaining: Committed to Cryptographic Audit Ledger
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setBlockedModalOpen(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
