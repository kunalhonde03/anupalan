import { describe, it, expect } from 'vitest';
import {
  calculateComplianceIndex,
  type ComplianceInput,
} from '../src/compliance-index.js';

describe('Transparent Compliance Index Engine', () => {
  it('awards base score of 100 with green band when clean', () => {
    const input: ComplianceInput = {
      overdueObligations: [],
      expiredDocumentsCount: 0,
      documentsExpiringWithin90DaysCount: 0,
      repeatDeficienciesCount: 0,
      rejectedEvidenceCount: 0,
      onTimeClosuresLast12MonthsCount: 0,
    };

    const result = calculateComplianceIndex(input);
    expect(result.score).toBe(100);
    expect(result.band).toBe('GREEN');
    expect(result.breakdown.length).toBe(0);
  });

  it('accurately applies deduction weights and respects caps', () => {
    const input: ComplianceInput = {
      // 5 Critical overdue = 5 * -15 = -75, capped at -60
      overdueObligations: [
        { severity: 'CRITICAL', count: 5 },
      ],
      // 3 Expired documents = 3 * -20 = -60, capped at -40
      expiredDocumentsCount: 3,
      documentsExpiringWithin90DaysCount: 1, // -5
      repeatDeficienciesCount: 1, // -5
      rejectedEvidenceCount: 1, // -3
      onTimeClosuresLast12MonthsCount: 5, // +5
    };

    // Expected score:
    // Start: 100
    // Overdue: -60 (capped)
    // Expired docs: -40 (capped)
    // Expiring docs: -5
    // Repeat deficiency: -5
    // Rejected evidence: -3
    // On-time closures: +5
    // Total raw: 100 - 60 - 40 - 5 - 5 - 3 + 5 = -8 -> Clamped to min 0
    const result = calculateComplianceIndex(input);
    expect(result.score).toBe(0);
    expect(result.band).toBe('RED');
    expect(result.whyPanel.length).toBeGreaterThan(0);
  });

  it('properly places intermediate scores into AMBER band with transparent breakdown', () => {
    const input: ComplianceInput = {
      overdueObligations: [
        { severity: 'MAJOR', count: 2 }, // 2 * -8 = -16
      ],
      expiredDocumentsCount: 0,
      documentsExpiringWithin90DaysCount: 2, // 2 * -5 = -10
      repeatDeficienciesCount: 1, // -5
      rejectedEvidenceCount: 0,
      onTimeClosuresLast12MonthsCount: 2, // +2
    };

    // Expected: 100 - 16 - 10 - 5 + 2 = 71 -> AMBER
    const result = calculateComplianceIndex(input);
    expect(result.score).toBe(71);
    expect(result.band).toBe('AMBER');
    expect(result.breakdown).toEqual([
      { factor: 'OVERDUE_OBLIGATIONS', points: -16, description: '2 Major overdue obligations (-16 pts)' },
      { factor: 'DOCUMENTS_EXPIRING_90D', points: -10, description: '2 documents expiring within 90 days (-10 pts)' },
      { factor: 'REPEAT_DEFICIENCY', points: -5, description: '1 repeat deficiency category (-5 pts)' },
      { factor: 'ON_TIME_CLOSURES', points: 2, description: '2 obligations closed on time in last 12m (+2 pts)' },
    ]);
  });
});
