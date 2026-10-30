export interface OverdueCountItem {
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  count: number;
}

export interface ComplianceInput {
  overdueObligations: OverdueCountItem[];
  expiredDocumentsCount: number;
  documentsExpiringWithin90DaysCount: number;
  repeatDeficienciesCount: number;
  rejectedEvidenceCount: number;
  onTimeClosuresLast12MonthsCount: number;
}

export interface ComplianceBreakdownItem {
  factor:
    | 'OVERDUE_OBLIGATIONS'
    | 'EXPIRED_DOCUMENTS'
    | 'DOCUMENTS_EXPIRING_90D'
    | 'REPEAT_DEFICIENCY'
    | 'REJECTED_EVIDENCE'
    | 'ON_TIME_CLOSURES';
  points: number;
  description: string;
}

export type ComplianceBand = 'GREEN' | 'AMBER' | 'RED';

export interface ComplianceIndexResult {
  score: number;
  band: ComplianceBand;
  breakdown: ComplianceBreakdownItem[];
  whyPanel: string[];
}

/**
 * Calculates Section 8.5 Transparent Compliance Index (0 - 100).
 */
export function calculateComplianceIndex(input: ComplianceInput): ComplianceIndexResult {
  const breakdown: ComplianceBreakdownItem[] = [];
  const whyPanel: string[] = [];

  // 1. Overdue Obligations (cap: -60)
  let rawOverdueDeduction = 0;
  const overdueDescParts: string[] = [];

  for (const item of input.overdueObligations) {
    if (item.count <= 0) continue;
    let weight = 0;
    if (item.severity === 'CRITICAL') weight = -15;
    else if (item.severity === 'MAJOR') weight = -8;
    else if (item.severity === 'MINOR') weight = -3;

    const subTotal = item.count * weight;
    rawOverdueDeduction += subTotal;
    overdueDescParts.push(`${item.count} ${item.severity.charAt(0) + item.severity.slice(1).toLowerCase()} overdue obligations (${subTotal} pts)`);
  }

  const cappedOverdueDeduction = Math.max(-60, rawOverdueDeduction);
  if (cappedOverdueDeduction < 0) {
    const isCapped = rawOverdueDeduction < -60;
    const desc = isCapped
      ? `${overdueDescParts.join(', ')} [capped at -60 pts]`
      : overdueDescParts.join(', ');

    breakdown.push({
      factor: 'OVERDUE_OBLIGATIONS',
      points: cappedOverdueDeduction,
      description: desc,
    });
    whyPanel.push(`Obligation status penalty: ${desc}`);
  }

  // 2. Expired Documents (cap: -40)
  if (input.expiredDocumentsCount > 0) {
    const rawExpDeduction = input.expiredDocumentsCount * -20;
    const cappedExpDeduction = Math.max(-40, rawExpDeduction);
    const isCapped = rawExpDeduction < -40;
    const desc = isCapped
      ? `${input.expiredDocumentsCount} expired documents (-20 each, capped at -40 pts)`
      : `${input.expiredDocumentsCount} expired documents (${cappedExpDeduction} pts)`;

    breakdown.push({
      factor: 'EXPIRED_DOCUMENTS',
      points: cappedExpDeduction,
      description: desc,
    });
    whyPanel.push(`Document expiration penalty: ${desc}`);
  }

  // 3. Documents expiring within 90 days (-5 each)
  if (input.documentsExpiringWithin90DaysCount > 0) {
    const deduction = input.documentsExpiringWithin90DaysCount * -5;
    const desc = `${input.documentsExpiringWithin90DaysCount} documents expiring within 90 days (${deduction} pts)`;
    breakdown.push({
      factor: 'DOCUMENTS_EXPIRING_90D',
      points: deduction,
      description: desc,
    });
    whyPanel.push(`Advance document expiry risk: ${desc}`);
  }

  // 4. Repeated Deficiency Category (-5 each)
  if (input.repeatDeficienciesCount > 0) {
    const deduction = input.repeatDeficienciesCount * -5;
    const desc = `${input.repeatDeficienciesCount} repeat deficiency category (${deduction} pts)`;
    breakdown.push({
      factor: 'REPEAT_DEFICIENCY',
      points: deduction,
      description: desc,
    });
    whyPanel.push(`Recurring deficiency history: ${desc}`);
  }

  // 5. Evidence Rejected Twice (-3 each)
  if (input.rejectedEvidenceCount > 0) {
    const deduction = input.rejectedEvidenceCount * -3;
    const desc = `${input.rejectedEvidenceCount} evidence submissions rejected twice (${deduction} pts)`;
    breakdown.push({
      factor: 'REJECTED_EVIDENCE',
      points: deduction,
      description: desc,
    });
    whyPanel.push(`Verification rejection penalty: ${desc}`);
  }

  // 6. On-Time Closures in Last 12 Months (+1 each, cap: +10)
  if (input.onTimeClosuresLast12MonthsCount > 0) {
    const bonus = Math.min(10, input.onTimeClosuresLast12MonthsCount * 1);
    const desc = `${input.onTimeClosuresLast12MonthsCount} obligations closed on time in last 12m (+${bonus} pts)`;
    breakdown.push({
      factor: 'ON_TIME_CLOSURES',
      points: bonus,
      description: desc,
    });
    whyPanel.push(`Positive compliance record: ${desc}`);
  }

  // Calculate final score
  const totalAdjustments = breakdown.reduce((acc, b) => acc + b.points, 0);
  const score = Math.max(0, Math.min(100, 100 + totalAdjustments));

  let band: ComplianceBand = 'RED';
  if (score >= 85) {
    band = 'GREEN';
  } else if (score >= 60) {
    band = 'AMBER';
  }

  return {
    score,
    band,
    breakdown,
    whyPanel,
  };
}
