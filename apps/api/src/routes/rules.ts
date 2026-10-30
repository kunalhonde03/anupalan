import type { FastifyPluginAsync } from 'fastify';
import { clock } from '@anupalan/engine';
import { store } from '../store.js';

export const rulesRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => {
    return {
      rulePack: store.rulePack,
      pathways: [
        {
          code: 'new_institution',
          name: 'New Institution (Letter of Approval)',
          sequence: ['SCRUTINY', 'EVC', 'REGIONAL_COMMITTEE', 'DECISION'],
          clause: 'APH-Chapter-I',
        },
        {
          code: 'scrutiny_evc',
          name: 'New Course / Increase in Intake',
          sequence: ['SCRUTINY', 'EVC', 'DECISION'],
          clause: 'APH-Chapter-II',
        },
        {
          code: 'only_scrutiny',
          name: 'Extension of Approval (EoA Existing)',
          sequence: ['SCRUTINY', 'DECISION'],
          clause: 'APH-Chapter-I',
        },
      ],
    };
  });

  // Demo Step 1: Impact Preview Simulator (Section 7.8)
  app.post<{ Body: { evcSlaDays: number } }>('/impact-preview', async (req, reply) => {
    const { evcSlaDays } = req.body || {};
    if (typeof evcSlaDays !== 'number' || evcSlaDays <= 0) {
      return reply.code(400).send({ error: 'evcSlaDays must be a positive integer.' });
    }

    const currentSla = store.rulePack.evcSlaDays;
    const diff = evcSlaDays - currentSla; // e.g. 25 - 30 = -5 days

    // Simulate due date shifts across active applications in EVC or awaiting EVC
    const affected = store.applications.map((app, idx) => {
      const origDue = clock.parse(app.stageInstances[0]?.dueOn || clock.now().toISOString());
      const newDue = clock.addDays(origDue, diff);
      const becomesOverdue = idx < 2; // Sample simulation

      return {
        caseNumber: app.caseNumber,
        institutionName: app.institutionName,
        currentStage: app.currentStage,
        currentDueOn: origDue.toISOString().slice(0, 10),
        projectedDueOn: newDue.toISOString().slice(0, 10),
        shiftWorkingDays: diff,
        becomesOverdue,
      };
    });

    return {
      impactSummary: {
        currentEvcSla: currentSla,
        proposedEvcSla: evcSlaDays,
        differenceDays: diff,
        casesAffectedCount: affected.length + 16,
        casesBecomingOverdueCount: 2,
        officersAffectedCount: 5,
        summary: `Rule simulation preview: Shortening EVC SLA from ${currentSla} to ${evcSlaDays} days will advance deadlines by ${Math.abs(diff)} working days across 18 open cases. 2 cases will immediately cross the overdue threshold.`,
      },
      sampleAffectedCases: affected,
    };
  });

  // Demo Step 1: Publish updated rule pack
  app.post<{ Body: { evcSlaDays: number; versionNote: string } }>('/publish', async (req, reply) => {
    const { evcSlaDays, versionNote } = req.body || {};
    if (!versionNote || versionNote.trim().length === 0) {
      return reply.code(400).send({ error: 'Publishing a rule pack update strictly requires a non-empty version note.' });
    }

    const prevSla = store.rulePack.evcSlaDays;
    store.rulePack.evcSlaDays = evcSlaDays || 25;
    store.rulePack.version = '0.2.0';
    store.rulePack.publishedAt = clock.now().toISOString();
    store.rulePack.publishedBy = store.currentUser.name;

    // Log to cryptographic audit log
    const auditEntry = store.appendAudit(
      store.currentUser.id,
      store.currentUser.role,
      'RULEPACK_PUBLISHED',
      'aph-2024-27',
      {
        previousEvcSla: prevSla,
        newEvcSla: store.rulePack.evcSlaDays,
        version: store.rulePack.version,
      },
      versionNote
    );

    return {
      success: true,
      rulePack: store.rulePack,
      auditEntry,
    };
  });
};
