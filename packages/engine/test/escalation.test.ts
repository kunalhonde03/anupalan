import { describe, it, expect } from 'vitest';
import {
  planAlerts,
  generateAlertKey,
  type TrackedDeadlineItem,
  type EscalationPolicy,
} from '../src/escalation.js';

describe('Escalation & Idempotent Alert Planner', () => {
  const policy: EscalationPolicy = {
    itemType: 'STAGE',
    rules: [
      { id: 'R-REMIND', offsetWorkingDays: -3, level: 'REMIND_OWNER', targetRole: 'SCRUTINY_OFFICER' },
      { id: 'R-OVERDUE', offsetWorkingDays: 0, level: 'OVERDUE_OWNER', targetRole: 'SCRUTINY_OFFICER' },
      { id: 'R-RD', offsetWorkingDays: 3, level: 'ESCALATE_REGIONAL_DIRECTOR', targetRole: 'REGIONAL_DIRECTOR' },
      { id: 'R-HQ', offsetWorkingDays: 7, level: 'ESCALATE_HQ', targetRole: 'COMPETENT_AUTHORITY' },
    ],
  };

  const holidays = new Set<string>();

  const testItem: TrackedDeadlineItem = {
    id: 'CASE-APP-101',
    itemType: 'STAGE',
    dueOn: '2026-02-20T00:00:00+05:30', // Friday
    dueVersion: 1,
    region: 'WESTERN',
    ownerRole: 'SCRUTINY_OFFICER',
    caseTitle: 'DEMO College New Course Scrutiny',
  };

  it('generates unique alert key formatted per Section 7.7', () => {
    const key = generateAlertKey('CASE-APP-101', 'R-REMIND', 'REMIND_OWNER', 1);
    expect(key).toBe('CASE-APP-101:R-REMIND:REMIND_OWNER:1');
  });

  it('fires alerts at exact threshold dates and remains idempotent on replay', () => {
    const existingAlertKeys = new Set<string>();

    // 1. T-5 (2026-02-15): No alert should fire
    const tMinus5 = new Date('2026-02-15T10:00:00+05:30');
    const alerts1 = planAlerts([testItem], policy, existingAlertKeys, tMinus5, holidays);
    expect(alerts1.length).toBe(0);

    // 2. T-3 (2026-02-17): REMIND_OWNER must fire
    const tMinus3 = new Date('2026-02-17T10:00:00+05:30');
    const alerts2 = planAlerts([testItem], policy, existingAlertKeys, tMinus3, holidays);
    expect(alerts2.length).toBe(1);
    expect(alerts2[0].level).toBe('REMIND_OWNER');
    expect(alerts2[0].targetRole).toBe('SCRUTINY_OFFICER');
    expect(alerts2[0].whyPanel.explanation).toContain('Reminder due to pending deadline in 3 working days');

    // Add alert to store
    existingAlertKeys.add(alerts2[0].key);

    // 3. Replay at T-3: MUST produce ZERO new/duplicate alerts (Idempotency requirement)
    const replayAlerts = planAlerts([testItem], policy, existingAlertKeys, tMinus3, holidays);
    expect(replayAlerts.length).toBe(0);

    // 4. Fast forward to T+3 working days (Wednesday Feb 25, 2026):
    // Both OVERDUE (offset 0) and ESCALATE_REGIONAL_DIRECTOR (offset 3 working days) should fire
    const tPlus3WorkingDays = new Date('2026-02-25T10:00:00+05:30');
    const alerts3 = planAlerts([testItem], policy, existingAlertKeys, tPlus3WorkingDays, holidays);
    expect(alerts3.length).toBe(2);
    expect(alerts3.map((a) => a.level)).toEqual(['OVERDUE_OWNER', 'ESCALATE_REGIONAL_DIRECTOR']);
  });
});
