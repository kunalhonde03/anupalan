import type { FastifyPluginAsync } from 'fastify';
import { clock, evaluateTransition, calculateDualClock, handleStageReturn, handleStageResubmit } from '@anupalan/engine';
import { store, type AppApplication } from '../store.js';

export const applicationsRoutes: FastifyPluginAsync = async (app) => {
  // Scoped Applications List (Invariant 4)
  app.get('/', async () => {
    const scope = store.currentUser;

    let filtered = store.applications;
    if (scope.role === 'INSTITUTION') {
      filtered = filtered.filter((a) => a.institutionId === scope.institutionId);
    } else if (scope.role === 'SCRUTINY_OFFICER' || scope.role === 'REGIONAL_DIRECTOR' || scope.role === 'EVC_CONVENER') {
      filtered = filtered.filter((a) => a.regionId === scope.regionId);
    }
    // HQ and Admin see all regions

    return {
      applications: filtered,
      scope: {
        role: scope.role,
        regionName: scope.regionName || 'All-India HQ',
        totalCount: filtered.length,
      },
    };
  });

  // Detailed Case View with Dual-Clock Metrics (Pillar 2)
  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const appItem = store.applications.find((a) => a.id === req.params.id || a.caseNumber === req.params.id);
    if (!appItem) {
      return reply.code(404).send({ error: 'Application not found.' });
    }

    // Invariant 4 Check: Prevent unauthorized cross-region access
    const scope = store.currentUser;
    if (scope.role === 'INSTITUTION' && appItem.institutionId !== scope.institutionId) {
      return reply.code(403).send({ error: '403 Forbidden: Institution cannot access another institution case.' });
    }
    if ((scope.role === 'SCRUTINY_OFFICER' || scope.role === 'REGIONAL_DIRECTOR') && appItem.regionId !== scope.regionId) {
      return reply.code(403).send({ error: '403 Forbidden: Regional officer cannot access case outside assigned region.' });
    }

    const currentStageInstance = appItem.stageInstances[appItem.stageInstances.length - 1];
    const slaWorkingDays = appItem.pathwayCode === 'only_scrutiny' ? store.rulePack.scrutinySlaDays : 15;

    // Dual-clock calculation
    const dualClock = currentStageInstance
      ? calculateDualClock(currentStageInstance.clockSegments, slaWorkingDays, clock.now(), new Set())
      : null;

    return {
      application: appItem,
      dualClock,
    };
  });

  // Submit Application (Demo Step 2)
  app.post<{ Body: { typeCode: string; typeName: string } }>('/', async (req, reply) => {
    const { typeCode, typeName } = req.body || {};
    const user = store.currentUser;

    if (user.role !== 'INSTITUTION') {
      return reply.code(403).send({ error: 'Only institution users can submit applications.' });
    }

    const now = clock.now();
    const caseNumber = `APP-2026-${now.getTime().toString().slice(-4)}`;
    const pathwayCode = typeCode === 'NEW_COURSE' ? 'scrutiny_evc' : 'only_scrutiny';
    const dueOn = clock.addDays(now, 15).toISOString();

    const newApp: AppApplication = {
      id: `APP-${now.getTime()}`,
      caseNumber,
      institutionId: user.institutionId || 'INST-DEMO',
      institutionName: user.institutionName || 'Saraswati Institute of Technology & Engineering',
      regionId: user.regionId || 'REG-WEST',
      regionName: user.regionName || 'Western Region',
      typeCode: typeCode || 'NEW_COURSE',
      typeName: typeName || (typeCode === 'NEW_COURSE' ? 'New Course (B.Tech AI & Data Science)' : 'Extension of Approval (EoA) 2026-27'),
      pathwayCode,
      packVersion: store.rulePack.version,
      currentStage: 'SCRUTINY',
      status: 'UNDER_REVIEW',
      submittedAt: now.toISOString(),
      lastActionAt: now.toISOString(),
      stageInstances: [
        {
          id: `STG-${now.getTime()}`,
          stageCode: 'SCRUTINY',
          stageName: 'Scrutiny Committee Review',
          passNo: 1,
          startedAt: now.toISOString(),
          dueOn,
          dueVersion: 1,
          clockSegments: [
            {
              party: 'AICTE',
              startAt: now.toISOString(),
            },
          ],
        },
      ],
    };

    store.applications.unshift(newApp);

    // Audit log
    store.appendAudit(
      user.id,
      user.role,
      'SUBMIT_APPLICATION',
      newApp.id,
      { caseNumber, typeCode, pathwayCode },
      'Application submitted successfully by institution'
    );

    return {
      success: true,
      application: newApp,
    };
  });

  // Stage Transitions (Demo Steps 2, 3, 4)
  app.post<{
    Params: { id: string };
    Body: { action: string; targetStage?: string; reason?: string };
  }>('/:id/transition', async (req, reply) => {
    const { action, targetStage, reason } = req.body || {};
    const appItem = store.applications.find((a) => a.id === req.params.id || a.caseNumber === req.params.id);
    if (!appItem) {
      return reply.code(404).send({ error: 'Application not found.' });
    }

    const currentStageInstance = appItem.stageInstances[appItem.stageInstances.length - 1];
    const user = store.currentUser;

    // Build pathway configuration
    const pathway = {
      code: appItem.pathwayCode,
      stages:
        appItem.pathwayCode === 'scrutiny_evc'
          ? [
              { code: 'SCRUTINY' as const, ownerRole: 'SCRUTINY_OFFICER' as const, slaDays: 15, allowedReverts: [] },
              { code: 'EVC' as const, ownerRole: 'EVC_CONVENER' as const, slaDays: store.rulePack.evcSlaDays, allowedReverts: ['SCRUTINY' as const] },
              { code: 'DECISION' as const, ownerRole: 'COMPETENT_AUTHORITY' as const, slaDays: 10, allowedReverts: ['EVC' as const, 'SCRUTINY' as const] },
            ]
          : [
              { code: 'SCRUTINY' as const, ownerRole: 'SCRUTINY_OFFICER' as const, slaDays: 15, allowedReverts: [] },
              { code: 'DECISION' as const, ownerRole: 'COMPETENT_AUTHORITY' as const, slaDays: 10, allowedReverts: ['SCRUTINY' as const] },
            ],
    };

    // Evaluate transition using pure engine
    const evaluation = evaluateTransition({
      action: action as import('@anupalan/engine').TransitionAction,
      currentStage: appItem.currentStage,
      targetStage: targetStage as import('@anupalan/shared').StageCode,
      actorRole: user.role,
      actorName: user.name,
      pathway,
      reason,
    });

    // Demo Step 2: Handle Illegal Jump
    if (evaluation.isBlocked) {
      // Append BLOCKED_TRANSITION entry to audit log
      store.appendAudit(
        user.id,
        user.role,
        'BLOCKED_TRANSITION',
        appItem.id,
        {
          attemptedAction: action,
          currentStage: appItem.currentStage,
          targetStage,
          errorCode: evaluation.errorCode,
        },
        evaluation.reason
      );

      return reply.code(400).send({
        error: evaluation.errorCode,
        message: evaluation.reason,
        isBlocked: true,
      });
    }

    const now = clock.now();

    // Demo Step 3: Handle Return to Institution (Pause AICTE Clock, Start Institution Clock)
    if (action === 'RETURN_TO_INSTITUTION') {
      const returnResult = handleStageReturn(
        currentStageInstance.clockSegments,
        now,
        currentStageInstance.dueVersion
      );

      currentStageInstance.clockSegments = returnResult.segments;
      currentStageInstance.dueVersion = returnResult.dueVersion;
      currentStageInstance.outcome = 'RETURNED';
      appItem.status = 'RETURNED';
      appItem.lastActionAt = now.toISOString();

      store.appendAudit(
        user.id,
        user.role,
        'STAGE_RETURNED',
        appItem.id,
        {
          stage: appItem.currentStage,
          reason,
          actorName: user.name,
          dueVersion: returnResult.dueVersion,
        },
        reason
      );

      return {
        success: true,
        action: 'RETURN_TO_INSTITUTION',
        application: appItem,
        message: `Case ${appItem.caseNumber} returned to institution. AICTE clock paused; Institution clock running.`,
      };
    }

    // Demo Step 4: Handle Resubmission by Institution
    if (action === 'RESUBMIT') {
      const resubmitResult = handleStageResubmit(
        currentStageInstance.clockSegments,
        now,
        currentStageInstance.dueVersion
      );

      currentStageInstance.clockSegments = resubmitResult.segments;
      currentStageInstance.dueVersion = resubmitResult.dueVersion;
      currentStageInstance.outcome = 'RESUBMITTED';
      appItem.status = 'UNDER_REVIEW';
      appItem.lastActionAt = now.toISOString();

      store.appendAudit(
        user.id,
        user.role,
        'STAGE_RESUBMITTED',
        appItem.id,
        {
          stage: appItem.currentStage,
          actorName: user.name,
          dueVersion: resubmitResult.dueVersion,
        },
        'Institution submitted requested clarifications and revised affidavits.'
      );

      return {
        success: true,
        action: 'RESUBMIT',
        application: appItem,
        message: `Case ${appItem.caseNumber} resubmitted. Institution clock stopped; AICTE clock resumed with remaining days.`,
      };
    }

    // Demo Step 4: Handle Stage Completion & Auto-Advance
    if (action === 'COMPLETE_STAGE') {
      currentStageInstance.completedAt = now.toISOString();
      currentStageInstance.outcome = 'ADVANCED';

      // Next stage
      const nextStage = evaluation.nextStage || 'DECISION';
      appItem.currentStage = nextStage;
      appItem.lastActionAt = now.toISOString();

      // Spawn next stage instance
      const nextDueDays = nextStage === 'EVC' ? store.rulePack.evcSlaDays : 10;
      appItem.stageInstances.push({
        id: `STG-${now.getTime()}`,
        stageCode: nextStage,
        stageName: nextStage === 'EVC' ? 'Expert Visit Committee Inspection' : 'Competent Authority Final Decision',
        passNo: 1,
        startedAt: now.toISOString(),
        dueOn: clock.addDays(now, nextDueDays).toISOString(),
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
        'STAGE_COMPLETED',
        appItem.id,
        {
          completedStage: currentStageInstance.stageCode,
          nextStage,
          actorName: user.name,
        },
        `Stage ${currentStageInstance.stageCode} approved by ${user.name}; auto-advanced to ${nextStage}.`
      );

      return {
        success: true,
        action: 'COMPLETE_STAGE',
        application: appItem,
        message: `Stage ${currentStageInstance.stageCode} completed by ${user.name}. Case auto-advanced to ${nextStage} queue.`,
      };
    }

    return { success: true };
  });
};
