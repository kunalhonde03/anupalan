import type { FastifyPluginAsync } from 'fastify';
import { clock } from '@anupalan/engine';
import { store } from '../store.js';

export const evcRoutes: FastifyPluginAsync = async (app) => {
  // EVC Pending Queue for Regional Director
  app.get('/queue', async () => {
    const queue = store.applications.filter((a) => a.currentStage === 'EVC');
    return {
      queue,
      count: queue.length,
    };
  });

  // Demo Step 6: Schedule EVC
  app.post<{
    Body: { applicationId: string; scheduledDate: string; members?: string[] };
  }>('/schedule', async (req, reply) => {
    const { applicationId, scheduledDate } = req.body || {};
    const appItem = store.applications.find((a) => a.id === applicationId || a.caseNumber === applicationId);
    if (!appItem) {
      return reply.code(404).send({ error: 'Application not found.' });
    }

    const user = store.currentUser;
    if (user.role !== 'REGIONAL_DIRECTOR' && user.role !== 'SYSTEM_ADMIN') {
      return reply.code(403).send({ error: 'Only Regional Director can schedule EVC inspections.' });
    }

    appItem.evcScheduledOn = scheduledDate;
    appItem.lastActionAt = clock.now().toISOString();

    store.appendAudit(
      user.id,
      user.role,
      'EVC_SCHEDULED',
      appItem.id,
      {
        scheduledDate,
        assignedConvener: 'Prof. Arvind Kelkar',
      },
      `EVC inspection scheduled for ${scheduledDate} by ${user.name}`
    );

    return {
      success: true,
      application: appItem,
      message: `EVC inspection successfully scheduled for ${scheduledDate}.`,
    };
  });

  // Demo Step 6: Upload EVC Inspection Report & Advance to Decision
  app.post<{
    Body: { applicationId: string; reportFileName: string; remarks?: string };
  }>('/report', async (req, reply) => {
    const { applicationId, reportFileName, remarks } = req.body || {};
    const appItem = store.applications.find((a) => a.id === applicationId || a.caseNumber === applicationId);
    if (!appItem) {
      return reply.code(404).send({ error: 'Application not found.' });
    }

    const user = store.currentUser;
    const now = clock.now();

    appItem.evcReportDocId = `DOC-EVC-${now.getTime()}`;
    appItem.lastActionAt = now.toISOString();

    // Complete EVC stage instance
    const currentStageInstance = appItem.stageInstances[appItem.stageInstances.length - 1];
    if (currentStageInstance) {
      currentStageInstance.completedAt = now.toISOString();
      currentStageInstance.outcome = 'ADVANCED';
    }

    // Advance case to DECISION queue
    appItem.currentStage = 'DECISION';
    appItem.stageInstances.push({
      id: `STG-${now.getTime()}`,
      stageCode: 'DECISION',
      stageName: 'Competent Authority Final Decision',
      passNo: 1,
      startedAt: now.toISOString(),
      dueOn: clock.addDays(now, 10).toISOString(),
      dueVersion: 1,
      clockSegments: [
        {
          party: 'AICTE',
          startAt: now.toISOString(),
        },
      ],
    });

    store.appendAudit(
      user.id,
      user.role,
      'EVC_REPORT_UPLOADED',
      appItem.id,
      {
        reportFileName: reportFileName || 'EVC_Inspection_Report_Verified.pdf',
        remarks: remarks || 'Site inspection completed. Verified labs, infrastructure, and faculty rosters.',
      },
      'EVC inspection report submitted; application auto-advanced to Decision queue.'
    );

    return {
      success: true,
      application: appItem,
      message: 'EVC report successfully uploaded. Case moved to Competent Authority for Decision.',
    };
  });
};
