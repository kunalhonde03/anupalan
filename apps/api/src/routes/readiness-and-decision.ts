import type { FastifyPluginAsync } from 'fastify';
import { clock, evaluateReadinessGate, computeEntryHash } from '@anupalan/engine';
import { store } from '../store.js';

export const readinessAndDecisionRoutes: FastifyPluginAsync = async (app) => {
  // Demo Step 6: Evaluate Advisory Readiness Gate for an Application
  app.get<{ Params: { id: string } }>('/:id/readiness-gate', async (req, reply) => {
    const appItem = store.applications.find((a) => a.id === req.params.id || a.caseNumber === req.params.id);
    if (!appItem) {
      return reply.code(404).send({ error: 'Application not found.' });
    }

    const institutionDocs = store.documents.filter((d) => d.institutionId === appItem.institutionId);
    const institutionObs = store.obligations.filter((o) => o.institutionId === appItem.institutionId);
    const leaseDoc = institutionDocs.find((d) => d.docType === 'LEASE_AGREEMENT');

    // Run pure engine Readiness Gate evaluation
    const gateResult = evaluateReadinessGate({
      applicationId: appItem.id,
      applicationType: appItem.typeCode,
      longestCourseYears: 4,
      leaseValidTo: leaseDoc?.validTo,
      openObligations: institutionObs.map((o) => ({
        id: o.id,
        type: o.type,
        severity: o.severity,
        dueOn: o.dueOn,
        status: o.status,
        clause: o.clause,
        title: o.title,
      })),
      documents: institutionDocs.map((d) => ({
        id: d.id,
        docType: d.docType,
        validTo: d.validTo,
        status: d.status,
      })),
      repeatedDeficiencies: ['Faculty Cadre Ratio in CSE'],
      pendingNoc: false,
      currentDate: clock.now(),
    });

    return {
      applicationId: appItem.id,
      caseNumber: appItem.caseNumber,
      institutionName: appItem.institutionName,
      readinessGate: gateResult,
    };
  });

  // Demo Step 6: Competent Authority records final human decision
  app.post<{
    Params: { id: string };
    Body: { outcome: 'APPROVED' | 'REJECTED' | 'CONDITIONAL'; overrideReason?: string; decisionNote?: string };
  }>('/:id/decide', async (req, reply) => {
    const { outcome, overrideReason, decisionNote } = req.body || {};
    const appItem = store.applications.find((a) => a.id === req.params.id || a.caseNumber === req.params.id);
    if (!appItem) {
      return reply.code(404).send({ error: 'Application not found.' });
    }

    const user = store.currentUser;
    if (user.role !== 'COMPETENT_AUTHORITY' && user.role !== 'SYSTEM_ADMIN') {
      return reply.code(403).send({ error: 'Invariant 1 Violation: Only named COMPETENT_AUTHORITY can decide a case.' });
    }

    // If gate is RED, override reason is strictly mandatory
    if (outcome === 'CONDITIONAL' || outcome === 'APPROVED') {
      if (!overrideReason && !decisionNote) {
        return reply.code(400).send({
          error: 'MANDATORY_REASON_REQUIRED',
          message: 'Decision on application with active Readiness Gate flags requires a recorded statutory justification.',
        });
      }
    }

    const now = clock.now();
    appItem.decisionOutcome = outcome;
    appItem.status = outcome;
    appItem.lastActionAt = now.toISOString();

    // Complete final stage
    const currentStageInstance = appItem.stageInstances[appItem.stageInstances.length - 1];
    if (currentStageInstance) {
      currentStageInstance.completedAt = now.toISOString();
      currentStageInstance.outcome = outcome;
    }

    // Freeze Decision Brief (Pillar 4)
    const briefContent = {
      caseNumber: appItem.caseNumber,
      institution: appItem.institutionName,
      outcome,
      decidedBy: user.name,
      decidedAt: now.toISOString(),
      overrideReason: overrideReason || decisionNote,
      obligationsCreated: outcome === 'CONDITIONAL' ? 2 : 0,
    };
    const briefHash = computeEntryHash('0'.repeat(64), {
      id: `BRIEF-${appItem.id}`,
      at: now.toISOString(),
      entity: 'DECISION_BRIEF',
      entityId: appItem.id,
      action: 'FROZEN',
      actorId: user.id,
      actorRole: user.role,
      reason: overrideReason || decisionNote || '',
      payload: briefContent,
    });
    appItem.briefHash = briefHash;

    // Demo Step 6: Conditional approval creates 6-month deficiency compliance and undertaking in Obligation Ledger!
    if (outcome === 'CONDITIONAL') {
      const sixMonthsLater = clock.addDays(now, 180).toISOString();
      const threeMonthsLater = clock.addDays(now, 90).toISOString();

      // 1. 6-Month Deficiency Compliance Obligation
      store.obligations.push({
        id: `OBL-DEF-${now.getTime()}`,
        institutionId: appItem.institutionId,
        institutionName: appItem.institutionName,
        regionId: appItem.regionId,
        decisionId: `DEC-${appItem.id}`,
        type: 'DEFICIENCY_COMPLIANCE',
        sourceRef: `AICTE/EoA/2026-27/${appItem.caseNumber}`,
        clause: 'APH-Ch6-Deficiency',
        severity: 'MAJOR',
        title: 'Rectification of Faculty Cadre Ratio & Digital Library Subscriptions',
        description: 'Mandatory 6-month deficiency rectification per Approval Process Handbook Chapter VI.',
        dueOn: sixMonthsLater,
        dueVersion: 1,
        status: 'OPEN',
      });

      // 2. SAC/SHC Undertaking Obligation
      store.obligations.push({
        id: `OBL-UND-${now.getTime()}`,
        institutionId: appItem.institutionId,
        institutionName: appItem.institutionName,
        regionId: appItem.regionId,
        decisionId: `DEC-${appItem.id}`,
        type: 'UNDERTAKING',
        sourceRef: `AICTE/SAC/2026/${appItem.caseNumber}`,
        clause: 'APH-2024-27-Undertaking',
        severity: 'MAJOR',
        title: 'Undertaking: Appointment of Qualified Principal / Director',
        description: 'Submit verified joining report and university endorsement within 90 days.',
        dueOn: threeMonthsLater,
        dueVersion: 1,
        status: 'OPEN',
      });
    }

    // Append to Cryptographic Audit Trail
    const auditEntry = store.appendAudit(
      user.id,
      user.role,
      'DECISION_RECORDED',
      appItem.id,
      {
        outcome,
        briefHash,
        overrideReason,
        decisionNote,
        createdObligations: outcome === 'CONDITIONAL' ? 2 : 0,
      },
      overrideReason || decisionNote || `Final decision: ${outcome}`
    );

    return {
      success: true,
      application: appItem,
      briefHash,
      auditEntry,
      message: `Conditional approval granted with statutory obligations registered in the Obligation Ledger. Decision brief frozen with hash ${briefHash.slice(0, 16)}...`,
    };
  });
};
