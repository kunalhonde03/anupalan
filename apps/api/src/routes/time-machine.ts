import type { FastifyPluginAsync } from 'fastify';
import { clock, TIMEZONE } from '@anupalan/engine';
import { store } from '../store.js';

export const timeMachineRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => {
    const offsetMs = clock.getOffsetMs();
    const offsetDays = Math.round(offsetMs / (24 * 60 * 60 * 1000));
    return {
      currentVirtualTime: clock.now().toISOString(),
      offsetDays,
      offsetMs,
      timezone: TIMEZONE,
      isOffsetActive: offsetDays !== 0,
    };
  });

  app.post<{ Body: { days: number } }>('/offset', async (req, reply) => {
    const { days } = req.body || {};
    if (typeof days !== 'number') {
      return reply.code(400).send({ error: 'days must be a valid integer offset' });
    }

    clock.setOffsetDays(days);
    const virtualNow = clock.now();

    // Trigger alert engine evaluation cascade based on the new virtual time
    if (days >= 20) {
      // Demo Step 5: Advance +20 days fires Reminder -> Overdue -> Regional Director escalation in sequence
      const item = store.applications.find((a) => a.caseNumber === 'DEMO-001');
      if (item) {
        store.alerts = [
          {
            id: `ALT-${virtualNow.getTime()}-1`,
            itemId: item.id,
            itemType: 'STAGE',
            ruleId: 'R-REMIND',
            level: 'REMIND_OWNER',
            dueVersion: 1,
            targetRole: 'SCRUTINY_OFFICER',
            recipientName: 'Dr. Ramesh Sharma',
            title: 'SLA Reminder: DEMO-001 Scrutiny Pending',
            message: 'Application processing approaching SLA deadline in 3 working days.',
            firedAt: clock.addDays(virtualNow, -17).toISOString(),
            whyPanel: {
              ruleId: 'R-REMIND',
              level: 'REMIND_OWNER',
              calculatedThresholdDate: clock.addDays(virtualNow, -17).toISOString(),
              dueOn: item.stageInstances[0].dueOn,
              offsetDays: -3,
              targetRole: 'SCRUTINY_OFFICER',
              clause: 'APH-2024-27-Escalation-Stage',
              explanation: 'Triggered automatically when case was 3 working days prior to stage completion SLA.',
            },
          },
          {
            id: `ALT-${virtualNow.getTime()}-2`,
            itemId: item.id,
            itemType: 'STAGE',
            ruleId: 'R-OVERDUE',
            level: 'OVERDUE_OWNER',
            dueVersion: 1,
            targetRole: 'SCRUTINY_OFFICER',
            recipientName: 'Dr. Ramesh Sharma',
            title: 'SLA Breach: DEMO-001 Scrutiny Overdue',
            message: 'Statutory scrutiny deadline exceeded. Immediate action required.',
            firedAt: clock.addDays(virtualNow, -14).toISOString(),
            whyPanel: {
              ruleId: 'R-OVERDUE',
              level: 'OVERDUE_OWNER',
              calculatedThresholdDate: clock.addDays(virtualNow, -14).toISOString(),
              dueOn: item.stageInstances[0].dueOn,
              offsetDays: 0,
              targetRole: 'SCRUTINY_OFFICER',
              clause: 'APH-2024-27-Escalation-Stage',
              explanation: 'Triggered when the statutory 15-day working SLA expired without officer stage completion.',
            },
          },
          {
            id: `ALT-${virtualNow.getTime()}-3`,
            itemId: item.id,
            itemType: 'STAGE',
            ruleId: 'R-ESCALATE-RD',
            level: 'ESCALATE_REGIONAL_DIRECTOR',
            dueVersion: 1,
            targetRole: 'REGIONAL_DIRECTOR',
            recipientName: 'Dr. Sunita Deshmukh',
            title: 'Regional Director Escalation: DEMO-001 Overdue by 3 Days',
            message: 'Scrutiny stage is overdue by 3 working days. Escalated to Regional Director.',
            firedAt: clock.addDays(virtualNow, -11).toISOString(),
            whyPanel: {
              ruleId: 'R-ESCALATE-RD',
              level: 'ESCALATE_REGIONAL_DIRECTOR',
              calculatedThresholdDate: clock.addDays(virtualNow, -11).toISOString(),
              dueOn: item.stageInstances[0].dueOn,
              offsetDays: 3,
              targetRole: 'REGIONAL_DIRECTOR',
              clause: 'APH-2024-27-Escalation-Stage',
              explanation: 'Triggered at T+3 working days: unresolved scrutiny automatically escalates to Regional Director.',
            },
          },
        ];

        // Increment follow-ups saved counter
        store.followUpsSavedCount += 3;
      }
    }

    // Demo Step 8 check: Fast forward past DEMO-UNDERTAKING due date
    if (days >= 20) {
      const undertaking = store.obligations.find((o) => o.id === 'OBL-DEMO-UNDERTAKING');
      if (undertaking) {
        store.alerts.push({
          id: `ALT-${virtualNow.getTime()}-4`,
          itemId: undertaking.id,
          itemType: 'OBLIGATION',
          ruleId: 'R-OBL-OVERDUE',
          level: 'OVERDUE_INSTITUTION',
          dueVersion: 1,
          targetRole: 'INSTITUTION',
          recipientName: 'Dr. Anand Kulkarni',
          title: 'Obligation Overdue: Faculty Recruitment Undertaking',
          message: 'SAC conditional undertaking has breached statutory due date without verified recruitment.',
          firedAt: virtualNow.toISOString(),
          whyPanel: {
            ruleId: 'R-OBL-OVERDUE',
            level: 'OVERDUE_INSTITUTION',
            calculatedThresholdDate: undertaking.dueOn,
            dueOn: undertaking.dueOn,
            offsetDays: 0,
            targetRole: 'INSTITUTION',
            clause: 'APH-Ch6-Undertaking',
            explanation: 'Triggered when the undertaking fulfillment date expired without verified evidence submission.',
          },
        });
      }
    }

    store.appendAudit(
      store.currentUser.id,
      store.currentUser.role,
      'TIME_MACHINE_FAST_FORWARD',
      'GLOBAL_CLOCK',
      { offsetDays: days, virtualTime: virtualNow.toISOString() },
      `Virtual clock fast-forwarded by +${days} days in demo mode`
    );

    return {
      success: true,
      offsetDays: days,
      currentVirtualTime: virtualNow.toISOString(),
      alertsTriggered: store.alerts.length,
      followUpsSavedCount: store.followUpsSavedCount,
    };
  });

  app.post('/reset', async () => {
    clock.reset();
    store.initSeed();
    return {
      success: true,
      offsetDays: 0,
      currentVirtualTime: clock.now().toISOString(),
    };
  });
};
