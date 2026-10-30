import { clock } from './clock';

export type ReadinessSeverity = 'RED' | 'AMBER' | 'INFO' | 'GREEN';

export interface ObligationSnapshot {
  id: string;
  type: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  dueOn: string;
  status: string;
  clause: string;
  title: string;
}

export interface DocumentSnapshot {
  id: string;
  docType: string;
  validTo: string;
  status: string;
}

export interface ReadinessCheckInput {
  applicationId: string;
  applicationType: string;
  longestCourseYears: number;
  leaseValidTo?: string;
  openObligations: ObligationSnapshot[];
  documents: DocumentSnapshot[];
  repeatedDeficiencies?: string[];
  pendingNoc?: boolean;
  currentDate: Date;
}

export interface ReadinessGateItem {
  checkCode:
    | 'OVERDUE_OBLIGATIONS'
    | 'UPCOMING_OBLIGATIONS'
    | 'LEASE_VALIDITY'
    | 'DOCUMENT_VALIDITY'
    | 'REPEATED_DEFICIENCIES'
    | 'PENDING_NOC';
  severity: ReadinessSeverity;
  title: string;
  message: string;
  clauseReference: string;
  metadata?: Record<string, unknown>;
}

export interface ReadinessGateResult {
  overallSeverity: ReadinessSeverity;
  requiresOverrideReason: boolean;
  items: ReadinessGateItem[];
  evaluatedAt: string;
}

/**
 * Evaluates Section 8.4 Readiness Gate checks for an application prior to final human decision.
 */
export function evaluateReadinessGate(input: ReadinessCheckInput): ReadinessGateResult {
  const items: ReadinessGateItem[] = [];
  const now = input.currentDate;
  const nowMs = now.getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  // 1. Check Overdue Obligations
  const overdueObs = input.openObligations.filter((o) => {
    return clock.parse(o.dueOn).getTime() < nowMs && o.status !== 'VERIFIED' && o.status !== 'WAIVED';
  });

  if (overdueObs.length > 0) {
    const hasCritical = overdueObs.some((o) => o.severity === 'CRITICAL');
    items.push({
      checkCode: 'OVERDUE_OBLIGATIONS',
      severity: hasCritical ? 'RED' : 'AMBER',
      title: hasCritical ? 'Critical Obligation Overdue' : 'Unmet Obligations Overdue',
      message: hasCritical
        ? `Critical obligation overdue: ${overdueObs.length} obligation(s) are past statutory deadline without verified compliance.`
        : `${overdueObs.length} obligation(s) are past statutory deadline without verified compliance.`,
      clauseReference: overdueObs[0]?.clause || 'APH-Ch6',
      metadata: { count: overdueObs.length, details: overdueObs.map((o) => o.title) },
    });
  } else {
    items.push({
      checkCode: 'OVERDUE_OBLIGATIONS',
      severity: 'GREEN',
      title: 'No Overdue Obligations',
      message: 'All prior obligations are in good standing.',
      clauseReference: 'APH-Ch6',
    });
  }

  // 2. Obligations Due within 30 Days (INFO)
  const upcomingObs = input.openObligations.filter((o) => {
    const dueTime = clock.parse(o.dueOn).getTime();
    return dueTime >= nowMs && dueTime <= nowMs + thirtyDaysMs;
  });

  if (upcomingObs.length > 0) {
    items.push({
      checkCode: 'UPCOMING_OBLIGATIONS',
      severity: 'INFO',
      title: 'Obligations Due Within 30 Days',
      message: `${upcomingObs.length} compliance condition(s) due for renewal within the next month.`,
      clauseReference: 'APH-Ch6',
    });
  }

  // 3. Lease Live-Years vs Longest Course Duration (Section 8.3 & Rule Pack)
  if (input.leaseValidTo) {
    const leaseExpiry = clock.parse(input.leaseValidTo).getTime();
    const liveYears = (leaseExpiry - nowMs) / (365.25 * 24 * 60 * 60 * 1000);
    const longest = input.longestCourseYears || 4;
    const amberMargin = 2; // ANUPALAN setting

    if (liveYears < longest) {
      items.push({
        checkCode: 'LEASE_VALIDITY',
        severity: 'RED',
        title: 'Land Lease Insufficient for Course Duration',
        message: `Registered lease expires in ${liveYears.toFixed(1)} years, which is less than the ${longest}-year course duration.`,
        clauseReference: 'APH-Land-Lease-Rule',
        metadata: { liveYears: Number(liveYears.toFixed(1)), requiredYears: longest },
      });
    } else if (liveYears < longest + amberMargin) {
      items.push({
        checkCode: 'LEASE_VALIDITY',
        severity: 'AMBER',
        title: 'Land Lease Approaching Minimum Threshold',
        message: `Registered lease has ${liveYears.toFixed(1)} live years remaining, within the ${amberMargin}-year warning margin.`,
        clauseReference: 'APH-Land-Lease-Rule',
        metadata: { liveYears: Number(liveYears.toFixed(1)), requiredYears: longest },
      });
    } else {
      items.push({
        checkCode: 'LEASE_VALIDITY',
        severity: 'GREEN',
        title: 'Land Lease Validity Verified',
        message: `Registered lease maintains ${liveYears.toFixed(1)} live years, satisfying course requirements.`,
        clauseReference: 'APH-Land-Lease-Rule',
      });
    }
  }

  // 4. Document Validity (Fire, Occupancy, Building Safety)
  const expiredDocs = input.documents.filter((d) => clock.parse(d.validTo).getTime() < nowMs);
  const expiringDocs = input.documents.filter((d) => {
    const vt = clock.parse(d.validTo).getTime();
    return vt >= nowMs && vt <= nowMs + thirtyDaysMs;
  });

  if (expiredDocs.length > 0) {
    items.push({
      checkCode: 'DOCUMENT_VALIDITY',
      severity: 'RED',
      title: 'Mandatory Statutory Certificate Expired',
      message: `${expiredDocs.length} required statutory document(s) have expired.`,
      clauseReference: 'APH-Essential-Requirements',
      metadata: { expiredTypes: expiredDocs.map((d) => d.docType) },
    });
  } else if (expiringDocs.length > 0) {
    items.push({
      checkCode: 'DOCUMENT_VALIDITY',
      severity: 'AMBER',
      title: 'Statutory Certificates Expiring Shortly',
      message: `${expiringDocs.length} certificate(s) expire within 30 calendar days.`,
      clauseReference: 'APH-Essential-Requirements',
      metadata: { expiringTypes: expiringDocs.map((d) => d.docType) },
    });
  } else {
    items.push({
      checkCode: 'DOCUMENT_VALIDITY',
      severity: 'GREEN',
      title: 'All Statutory Documents Valid',
      message: 'Mandatory certificates and approvals are active.',
      clauseReference: 'APH-Essential-Requirements',
    });
  }

  // 5. Repeated Deficiencies
  if (input.repeatedDeficiencies && input.repeatedDeficiencies.length > 0) {
    items.push({
      checkCode: 'REPEATED_DEFICIENCIES',
      severity: 'AMBER',
      title: 'Repeated Deficiency in Consecutive Approval Cycles',
      message: `Institution flagged with recurring deficiencies in: ${input.repeatedDeficiencies.join(', ')}.`,
      clauseReference: 'APH-Ch6-Deficiencies',
    });
  }

  // 6. Pending NOC
  if (input.pendingNoc) {
    const isClosure = input.applicationType === 'CLOSURE';
    items.push({
      checkCode: 'PENDING_NOC',
      severity: isClosure ? 'RED' : 'AMBER',
      title: 'Pending University / State Government NOC',
      message: isClosure
        ? 'Closure decision strictly requires all State & University NOCs.'
        : 'Application awaiting outstanding NOC document submission.',
      clauseReference: 'APH-NOC-Requirement',
    });
  }

  // Determine overall severity
  let overallSeverity: ReadinessSeverity = 'GREEN';
  if (items.some((i) => i.severity === 'RED')) {
    overallSeverity = 'RED';
  } else if (items.some((i) => i.severity === 'AMBER')) {
    overallSeverity = 'AMBER';
  } else if (items.some((i) => i.severity === 'INFO')) {
    overallSeverity = 'INFO';
  }

  return {
    overallSeverity,
    requiresOverrideReason: overallSeverity === 'RED',
    items,
    evaluatedAt: now.toISOString(),
  };
}
