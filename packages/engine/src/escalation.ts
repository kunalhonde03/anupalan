import type { Role } from '@anupalan/shared';
import { addWorkingDays } from './calendar';
import { clock } from './clock';

export interface EscalationRule {
  id: string;
  offsetWorkingDays: number;
  level: string;
  targetRole: Role;
  clause?: string;
}

export interface EscalationPolicy {
  itemType: 'STAGE' | 'OBLIGATION' | 'DOCUMENT';
  rules: EscalationRule[];
}

export interface TrackedDeadlineItem {
  id: string;
  itemType: 'STAGE' | 'OBLIGATION' | 'DOCUMENT';
  dueOn: string; // ISO date
  dueVersion: number;
  region: string;
  ownerRole: Role;
  caseTitle?: string;
}

export interface WhyPanelDetails {
  ruleId: string;
  level: string;
  calculatedThresholdDate: string;
  dueOn: string;
  offsetDays: number;
  targetRole: Role;
  clause: string;
  explanation: string;
}

export interface PlannedAlert {
  key: string;
  itemId: string;
  ruleId: string;
  level: string;
  dueVersion: number;
  targetRole: Role;
  firedAt: string;
  whyPanel: WhyPanelDetails;
}

/**
 * Generates the idempotent alert uniqueness key specified in Section 7.7:
 * key = (item.id, rule.id, rule.level, item.due_version)
 */
export function generateAlertKey(
  itemId: string,
  ruleId: string,
  level: string,
  dueVersion: number
): string {
  return `${itemId}:${ruleId}:${level}:${dueVersion}`;
}

/**
 * Pure function planning idempotent alerts without direct database I/O.
 */
export function planAlerts(
  items: TrackedDeadlineItem[],
  policy: EscalationPolicy,
  existingAlertKeys: Set<string>,
  now: Date,
  holidays: Set<string>
): PlannedAlert[] {
  const newAlerts: PlannedAlert[] = [];

  for (const item of items) {
    if (item.itemType !== policy.itemType) continue;

    const dueDate = clock.parse(item.dueOn);

    for (const rule of policy.rules) {
      const key = generateAlertKey(item.id, rule.id, rule.level, item.dueVersion);

      // Idempotency: skip if alert already fired for this due_version
      if (existingAlertKeys.has(key)) {
        continue;
      }

      // Compute trigger threshold date
      let thresholdDate: Date;
      if (rule.offsetWorkingDays < 0) {
        // e.g. T-3: 3 working days before due date
        let count = Math.abs(rule.offsetWorkingDays);
        thresholdDate = clock.parse(dueDate.getTime());
        while (count > 0) {
          thresholdDate = clock.addDays(thresholdDate, -1);
          const day = thresholdDate.getUTCDay();
          if (day !== 0 && day !== 6 && !holidays.has(thresholdDate.toISOString().slice(0, 10))) {
            count--;
          }
        }
      } else if (rule.offsetWorkingDays === 0) {
        thresholdDate = dueDate;
      } else {
        // e.g. T+3: 3 working days after due date
        thresholdDate = addWorkingDays(dueDate, rule.offsetWorkingDays, holidays);
      }

      // Fire if current time has reached or passed threshold
      if (now.getTime() >= thresholdDate.getTime()) {
        const explanation =
          rule.offsetWorkingDays < 0
            ? `Reminder due to pending deadline in ${Math.abs(rule.offsetWorkingDays)} working days.`
            : rule.offsetWorkingDays === 0
            ? `Overdue notice: Statutory processing SLA expired on ${dueDate.toISOString().slice(0, 10)}.`
            : `Escalation level ${rule.level}: SLA exceeded by ${rule.offsetWorkingDays} working days without stage completion.`;

        newAlerts.push({
          key,
          itemId: item.id,
          ruleId: rule.id,
          level: rule.level,
          dueVersion: item.dueVersion,
          targetRole: rule.targetRole,
          firedAt: now.toISOString(),
          whyPanel: {
            ruleId: rule.id,
            level: rule.level,
            calculatedThresholdDate: thresholdDate.toISOString(),
            dueOn: dueDate.toISOString(),
            offsetDays: rule.offsetWorkingDays,
            targetRole: rule.targetRole,
            clause: rule.clause || 'APH-2024-27-Escalation',
            explanation,
          },
        });
      }
    }
  }

  return newAlerts;
}
