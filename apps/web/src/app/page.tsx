'use client';

import React, { useState } from 'react';
import {
  GitMerge,
  FileCheck,
  Lock,
  Activity,
  FileCode2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { TimeMachineBanner } from '@/components/TimeMachineBanner';
import { DashboardKPIs } from '@/components/DashboardKPIs';
import { ApplicationsView } from '@/components/ApplicationsView';
import { ObligationsView, type ObligationItem } from '@/components/ObligationsView';
import { RulesEditorView } from '@/components/RulesEditorView';
import { AuditView } from '@/components/AuditView';
import { ComplianceView } from '@/components/ComplianceView';
import { ReadinessGateModal } from '@/components/ReadinessGateModal';
import { AlertsPanel, type AlertItem } from '@/components/AlertsPanel';
import { clock } from '@anupalan/engine';

export interface ApplicationItem {
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
  stageInstances: Array<{
    id: string;
    stageCode: string;
    stageName: string;
    passNo: number;
    startedAt: string;
    dueOn: string;
    dueVersion: number;
    clockSegments: Array<{ party: 'AICTE' | 'INSTITUTION'; startAt: string; endAt?: string }>;
  }>;
}

export interface AuditItem {
  id: string;
  at: string;
  action: string;
  actorId: string;
  actorRole: string;
  entityId: string;
  reason: string;
  hash: string;
  prevHash: string;
  payload: Record<string, unknown>;
}

export default function HomePage() {
  const [currentRole, setCurrentRole] = useState<string>('SCRUTINY_OFFICER');
  const [activeTab, setActiveTab] = useState<'applications' | 'obligations' | 'rules' | 'audit' | 'compliance'>('applications');
  const [offsetDays, setOffsetDays] = useState<number>(0);
  const [followUpsSaved, setFollowUpsSaved] = useState<number>(142);
  const [alertsOpen, setAlertsOpen] = useState<boolean>(false);
  const [readinessModalOpen, setReadinessModalOpen] = useState<boolean>(false);
  const [selectedCaseForReadiness, setSelectedCaseForReadiness] = useState<ApplicationItem | null>(null);

  const now = clock.now();
  const fourDaysAgo = clock.addDays(now, -4).toISOString();
  const twoDaysAgo = clock.addDays(now, -2).toISOString();
  const elevenDaysLater = clock.addDays(now, 11).toISOString();
  const thirteenDaysLater = clock.addDays(now, 13).toISOString();
  const fifteenDaysLater = clock.addDays(now, 15).toISOString();
  const thirtyDaysLater = clock.addDays(now, 30).toISOString();
  const fortyFiveDaysLater = clock.addDays(now, 45).toISOString();
  const tenDaysAgo = clock.addDays(now, -10).toISOString();

  // Core Mock State synced across components
  const [applications, setApplications] = useState<ApplicationItem[]>([
    {
      id: 'APP-DEMO-001',
      caseNumber: 'DEMO-001',
      institutionId: 'INST-DEMO',
      institutionName: 'Saraswati Institute of Technology & Engineering',
      regionId: 'REG-WEST',
      regionName: 'Western Region',
      typeCode: 'NEW_COURSE',
      typeName: 'New Course: Artificial Intelligence & Data Science (B.Tech)',
      pathwayCode: 'scrutiny_evc',
      packVersion: '0.1.0',
      currentStage: 'SCRUTINY',
      status: 'UNDER_REVIEW',
      submittedAt: fourDaysAgo,
      lastActionAt: fourDaysAgo,
      stageInstances: [
        {
          id: 'STG-001',
          stageCode: 'SCRUTINY',
          stageName: 'Scrutiny Committee Review',
          passNo: 1,
          startedAt: fourDaysAgo,
          dueOn: elevenDaysLater,
          dueVersion: 1,
          clockSegments: [{ party: 'AICTE', startAt: fourDaysAgo }]
        }
      ]
    },
    {
      id: 'APP-DEMO-EOA',
      caseNumber: 'DEMO-EOA-2026',
      institutionId: 'INST-DEMO',
      institutionName: 'Saraswati Institute of Technology & Engineering',
      regionId: 'REG-WEST',
      regionName: 'Western Region',
      typeCode: 'EOA_EXISTING',
      typeName: 'Extension of Approval (EoA) 2026-27',
      pathwayCode: 'only_scrutiny',
      packVersion: '0.1.0',
      currentStage: 'SCRUTINY',
      status: 'UNDER_REVIEW',
      submittedAt: twoDaysAgo,
      lastActionAt: twoDaysAgo,
      stageInstances: [
        {
          id: 'STG-002',
          stageCode: 'SCRUTINY',
          stageName: 'Scrutiny Committee Review',
          passNo: 1,
          startedAt: twoDaysAgo,
          dueOn: thirteenDaysLater,
          dueVersion: 1,
          clockSegments: [{ party: 'AICTE', startAt: twoDaysAgo }]
        }
      ]
    }
  ]);

  const [obligations, setObligations] = useState<ObligationItem[]>([
    {
      id: 'OBL-DEMO-UNDERTAKING',
      institutionId: 'INST-DEMO',
      institutionName: 'Saraswati Institute of Technology & Engineering',
      regionId: 'REG-WEST',
      type: 'UNDERTAKING',
      sourceRef: 'AICTE/WRO/2026/SAC-UNDERTAKING-01',
      clause: 'APH-2024-27-Ch6-Sec3',
      severity: 'MAJOR',
      title: 'Recruitment of Professor & Associate Professor in Computer Engg',
      description: 'Mandatory faculty appointment compliance as recommended by the Standing Appellate Committee.',
      dueOn: fifteenDaysLater,
      dueVersion: 1,
      status: 'OPEN'
    },
    {
      id: 'OBL-FIRE-NOC',
      institutionId: 'INST-DEMO',
      institutionName: 'Saraswati Institute of Technology & Engineering',
      regionId: 'REG-WEST',
      type: 'NOC_RENEWAL',
      sourceRef: 'MUNICIPAL/FIRE/2025/998',
      clause: 'APH-2024-27-Ch2-Sec4',
      severity: 'CRITICAL',
      title: 'Annual Fire Safety Certificate Renewal',
      description: 'Submission of renewed No Objection Certificate issued by Competent Fire Authority.',
      dueOn: fortyFiveDaysLater,
      dueVersion: 1,
      status: 'VERIFIED',
      evidenceDoc: {
        id: 'DOC-FIRE-2026',
        fileName: 'Fire_Safety_Certificate_2026.pdf',
        fileUrl: '/docs/fire.pdf',
        submittedAt: clock.now().toISOString()
      }
    }
  ]);

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'ALT-LEASE-01',
      itemId: 'DOC-DEMO-LEASE',
      itemType: 'DOCUMENT',
      ruleId: 'lease_safety_margin_check',
      level: 'REMINDER',
      dueVersion: 1,
      targetRole: 'REGIONAL_DIRECTOR',
      recipientName: 'Dr. Sunita Deshmukh',
      title: 'Campus Lease Deed Expiring in 30 Days',
      message: 'Saraswati Institute registered lease deed expires within 30 days. Fall below 90-day minimum margin threshold.',
      firedAt: clock.now().toISOString(),
      whyPanel: {
        ruleId: 'lease_safety_margin_check',
        level: 'REMINDER',
        calculatedThresholdDate: thirtyDaysLater,
        dueOn: thirtyDaysLater,
        offsetDays: 30,
        targetRole: 'REGIONAL_DIRECTOR',
        clause: 'APH 2024-27 Ch. 1 § 4.3 (Registered Lease Safety Margins)',
        explanation: 'The system computed the interval between virtual clock and validTo (30 days remaining). Because remaining lease days <= safety_margin (90 days), an automated REMINDER alert was fired to the Regional Director.'
      }
    }
  ]);

  const [auditChain, setAuditChain] = useState<AuditItem[]>([
    {
      id: 'AUDIT-GENESIS',
      at: tenDaysAgo,
      action: 'RULEPACK_INIT',
      actorId: 'SYSTEM',
      actorRole: 'SYSTEM_ADMIN',
      entityId: 'aph-2024-27',
      reason: 'Seeded initial APH 2024-27 configuration pack',
      hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      payload: { version: '0.1.0' }
    },
    {
      id: 'AUDIT-SUBMIT-001',
      at: fourDaysAgo,
      action: 'SUBMIT_APPLICATION',
      actorId: 'USR-INST-01',
      actorRole: 'INSTITUTION',
      entityId: 'APP-DEMO-001',
      reason: 'Application submitted for B.Tech AI & Data Science',
      hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      prevHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      payload: { caseNumber: 'DEMO-001', typeCode: 'NEW_COURSE' }
    }
  ]);

  // Fast forward virtual clock
  const handleFastForward = (days: number) => {
    const newOffset = offsetDays + days;
    clock.setOffsetDays(newOffset);
    setOffsetDays(newOffset);
    setFollowUpsSaved(prev => prev + 12);

    // Simulate Step 7: Time Machine firing escalation alerts
    if (newOffset >= 20) {
      setAlerts(prev => [
        {
          id: `ALT-ESC-${clock.now().getTime()}`,
          itemId: 'OBL-DEMO-UNDERTAKING',
          itemType: 'OBLIGATION',
          ruleId: 'escalation_t_plus_3_supervisor',
          level: 'CRITICAL',
          dueVersion: 1,
          targetRole: 'REGIONAL_DIRECTOR',
          recipientName: 'Dr. Sunita Deshmukh',
          title: 'CRITICAL ESCALATION: Undertaking Overdue (T+3 Days)',
          message: 'Faculty appointment undertaking for Saraswati Institute is overdue by 5 days. Escalated to Regional Director.',
          firedAt: clock.now().toISOString(),
          whyPanel: {
            ruleId: 'escalation_t_plus_3_supervisor',
            level: 'CRITICAL',
            calculatedThresholdDate: clock.now().toISOString(),
            dueOn: fifteenDaysLater,
            offsetDays: 5,
            targetRole: 'REGIONAL_DIRECTOR',
            clause: 'APH 2024-27 Ch. 6 § 3 (Mandatory Supervisory Escalations)',
            explanation: 'With Time Machine advanced +20 days, the due date (T+15) has expired. The T+3 critical threshold was breached without submission, automatically escalating the case to Regional Director.'
          }
        },
        ...prev
      ]);
    }
  };

  const handleResetTime = () => {
    clock.reset();
    setOffsetDays(0);
  };

  const handleOpenReadinessGate = (appItem: ApplicationItem) => {
    setSelectedCaseForReadiness(appItem);
    setReadinessModalOpen(true);
  };

  const handleDecisionRecorded = (decision: 'APPROVE' | 'CONDITIONAL' | 'REJECT', conditions: string) => {
    if (!selectedCaseForReadiness) return;
    const currentNow = clock.now();
    setApplications(prev =>
      prev.map(app => {
        if (app.id === selectedCaseForReadiness.id) {
          return {
            ...app,
            status: decision === 'APPROVE' ? 'APPROVED' : decision === 'CONDITIONAL' ? 'CONDITIONAL' : 'REJECTED',
            decisionOutcome: decision,
            lastActionAt: currentNow.toISOString()
          };
        }
        return app;
      })
    );

    // Append to audit trail
    const prevHash = auditChain[auditChain.length - 1].hash;
    const newEntry: AuditItem = {
      id: `AUDIT-DECISION-${currentNow.getTime()}`,
      at: currentNow.toISOString(),
      action: 'DECISION',
      actorId: `ACTOR-${currentRole}`,
      actorRole: currentRole,
      entityId: selectedCaseForReadiness.id,
      reason: `Competent Authority recorded ${decision}. Conditions: ${conditions || 'None'}.`,
      hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      prevHash,
      payload: { decision, conditions }
    };
    setAuditChain(prev => [...prev, newEntry]);
  };

  // Tamper demonstration
  const handleTamperRow = () => {
    setAuditChain(prev => {
      const copy = [...prev];
      if (copy.length >= 2) {
        copy[1] = {
          ...copy[1],
          reason: 'MALICIOUS_INJECTION: Unconditional approval granted without obligations!'
        };
      }
      return copy;
    });
  };

  const handleVerifyChain = () => {
    // If reason was tampered in row 1, report broken chain
    const row1 = auditChain[1];
    if (row1 && row1.reason.includes('MALICIOUS_INJECTION')) {
      return {
        valid: false,
        brokenAtIndex: 1,
        expectedHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        foundHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      };
    }
    return { valid: true };
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        offsetDays={offsetDays}
        onFastForward={handleFastForward}
        onResetTime={handleResetTime}
        alertCount={alerts.length}
        onToggleAlerts={() => setAlertsOpen(true)}
        followUpsSaved={followUpsSaved}
      />

      {/* Time Machine Indicator Banner */}
      <TimeMachineBanner offsetDays={offsetDays} onReset={handleResetTime} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards */}
        <DashboardKPIs
          pendingApplications={applications.filter(a => a.status === 'UNDER_REVIEW' || a.status === 'RETURNED').length}
          overdueStages={offsetDays > 10 ? 1 : 0}
          openObligations={obligations.filter(o => o.status === 'OPEN').length}
          complianceScore={62}
          followUpsSaved={followUpsSaved}
          alertsFired={alerts.length}
        />

        {/* Navigation Tabs */}
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'applications'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Application Workflows (Steps 2-5)</span>
          </button>

          <button
            onClick={() => setActiveTab('obligations')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'obligations'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Obligation Ledger (Step 8)</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rules'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Rule Pack Editor (Step 1)</span>
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'compliance'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Compliance Index (Pillar 6)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Cryptographic Audit (Step 9)</span>
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'applications' && (
          <ApplicationsView
            currentRole={currentRole}
            applications={applications}
            onOpenReadinessGate={handleOpenReadinessGate}
            onMutateApp={setApplications}
            onRefresh={() => {}}
          />
        )}

        {activeTab === 'obligations' && (
          <ObligationsView
            currentRole={currentRole}
            obligations={obligations}
            onMutateObligations={setObligations}
            onRefresh={() => {}}
          />
        )}

        {activeTab === 'rules' && (
          <RulesEditorView
            onRuleSaved={changes => {
              // Append rule edit to audit
              const prevHash = auditChain[auditChain.length - 1].hash;
              const currentNow = clock.now();
              const newEntry: AuditItem = {
                id: `AUDIT-RULE-${currentNow.getTime()}`,
                at: currentNow.toISOString(),
                action: 'RULEPACK_EDIT',
                actorId: `ACTOR-${currentRole}`,
                actorRole: currentRole,
                entityId: 'aph-2024-27',
                reason: 'Modified SLA parameters in rule editor',
                hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                prevHash,
                payload: changes
              };
              setAuditChain(prev => [...prev, newEntry]);
            }}
          />
        )}

        {activeTab === 'compliance' && <ComplianceView score={62} />}

        {activeTab === 'audit' && (
          <AuditView
            auditChain={auditChain}
            onTamperRow={handleTamperRow}
            onVerifyChain={handleVerifyChain}
            onRefresh={() => handleResetTime()}
          />
        )}
      </main>

      {/* Advisory Readiness Gate Modal (Step 6) */}
      <ReadinessGateModal
        isOpen={readinessModalOpen}
        onClose={() => setReadinessModalOpen(false)}
        applicationId={selectedCaseForReadiness?.id || ''}
        caseNumber={selectedCaseForReadiness?.caseNumber || 'DEMO-001'}
        institutionName={selectedCaseForReadiness?.institutionName || 'Saraswati Institute'}
        onDecision={handleDecisionRecorded}
      />

      {/* Alerts Drawer Panel (Step 7) */}
      <AlertsPanel
        isOpen={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        alerts={alerts}
      />
    </div>
  );
}
