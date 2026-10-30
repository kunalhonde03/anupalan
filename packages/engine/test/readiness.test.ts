import { describe, it, expect } from 'vitest';
import {
  evaluateReadinessGate,
  type ReadinessCheckInput,
} from '../src/readiness.js';

describe('Advisory Readiness Gate Engine', () => {
  const baseInput: ReadinessCheckInput = {
    applicationId: 'APP-DEMO-001',
    applicationType: 'NEW_COURSE',
    longestCourseYears: 4, // 4-year B.Tech course
    leaseValidTo: '2036-05-30T00:00:00Z', // 10 years remaining > 4 + 2
    openObligations: [],
    documents: [],
    repeatedDeficiencies: [],
    pendingNoc: false,
    currentDate: new Date('2026-06-01T00:00:00Z'),
  };

  it('evaluates to GREEN when all checks are clear', () => {
    const result = evaluateReadinessGate(baseInput);

    expect(result.overallSeverity).toBe('GREEN');
    expect(result.requiresOverrideReason).toBe(false);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((i) => i.severity === 'GREEN' || i.severity === 'INFO')).toBe(true);
  });

  it('triggers RED when a Critical obligation is overdue', () => {
    const input: ReadinessCheckInput = {
      ...baseInput,
      openObligations: [
        {
          id: 'OBL-CRIT-1',
          type: 'UNDERTAKING',
          severity: 'CRITICAL',
          dueOn: '2026-05-15T00:00:00Z', // 15 days ago
          status: 'OPEN',
          clause: 'APH-Ch6-Undertaking',
          title: 'Mandatory faculty appointment undertaking',
        },
      ],
    };

    const result = evaluateReadinessGate(input);

    expect(result.overallSeverity).toBe('RED');
    expect(result.requiresOverrideReason).toBe(true);
    const overdueCheck = result.items.find((i) => i.checkCode === 'OVERDUE_OBLIGATIONS');
    expect(overdueCheck?.severity).toBe('RED');
    expect(overdueCheck?.message).toMatch(/critical obligation overdue/i);
  });

  it('triggers AMBER when lease validity is within margin, and RED when below longest course', () => {
    // 1. Lease live years = 5 years. Longest course = 4 years. Margin = 2 years.
    // 5 is < (4 + 2 = 6), so it triggers AMBER!
    const amberInput: ReadinessCheckInput = {
      ...baseInput,
      leaseValidTo: '2031-06-01T00:00:00Z', // exactly 5 years from 2026-06-01
    };

    const amberResult = evaluateReadinessGate(amberInput);
    const leaseAmberCheck = amberResult.items.find((i) => i.checkCode === 'LEASE_VALIDITY');
    expect(leaseAmberCheck?.severity).toBe('AMBER');
    expect(amberResult.overallSeverity).toBe('AMBER');
    expect(amberResult.requiresOverrideReason).toBe(false);

    // 2. Lease live years = 3 years (< 4 years course duration). Triggers RED!
    const redInput: ReadinessCheckInput = {
      ...baseInput,
      leaseValidTo: '2029-06-01T00:00:00Z', // 3 years remaining
    };

    const redResult = evaluateReadinessGate(redInput);
    const leaseRedCheck = redResult.items.find((i) => i.checkCode === 'LEASE_VALIDITY');
    expect(leaseRedCheck?.severity).toBe('RED');
    expect(redResult.overallSeverity).toBe('RED');
    expect(redResult.requiresOverrideReason).toBe(true);
  });

  it('triggers RED when a mandatory statutory certificate is expired', () => {
    const input: ReadinessCheckInput = {
      ...baseInput,
      documents: [
        {
          id: 'DOC-FIRE-01',
          docType: 'FIRE_SAFETY_CERTIFICATE',
          validTo: '2026-05-01T00:00:00Z', // Expired 1 month ago
          status: 'EXPIRED',
        },
      ],
    };

    const result = evaluateReadinessGate(input);
    expect(result.overallSeverity).toBe('RED');
    const docCheck = result.items.find((i) => i.checkCode === 'DOCUMENT_VALIDITY');
    expect(docCheck?.severity).toBe('RED');
  });
});
