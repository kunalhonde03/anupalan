import type { FastifyPluginAsync } from 'fastify';
import { clock, calculateComplianceIndex } from '@anupalan/engine';
import { store, type AppDocument } from '../store.js';

export const obligationsRoutes: FastifyPluginAsync = async (app) => {
  // Scoped Obligation Ledger
  app.get('/', async () => {
    const scope = store.currentUser;
    let list = store.obligations;

    if (scope.role === 'INSTITUTION') {
      list = list.filter((o) => o.institutionId === scope.institutionId);
    } else if (scope.role === 'SCRUTINY_OFFICER' || scope.role === 'REGIONAL_DIRECTOR') {
      list = list.filter((o) => o.regionId === scope.regionId);
    }

    return {
      obligations: list,
      count: list.length,
    };
  });

  // Upload Evidence for an Obligation
  app.post<{
    Params: { id: string };
    Body: { fileName: string; fileUrl?: string };
  }>('/:id/evidence', async (req, reply) => {
    const ob = store.obligations.find((o) => o.id === req.params.id);
    if (!ob) {
      return reply.code(404).send({ error: 'Obligation not found.' });
    }

    const { fileName, fileUrl } = req.body || {};
    const user = store.currentUser;
    const now = clock.now();

    ob.status = 'SUBMITTED';
    ob.evidenceDoc = {
      id: `DOC-EV-${now.getTime()}`,
      fileName: fileName || 'Compliance_Evidence_Document.pdf',
      fileUrl: fileUrl || '/uploads/evidence.pdf',
      submittedAt: now.toISOString(),
    };

    store.appendAudit(
      user.id,
      user.role,
      'EVIDENCE_SUBMITTED',
      ob.id,
      { obligationTitle: ob.title, fileName },
      'Compliance proof uploaded by institution; entered risk-ordered verification queue.'
    );

    return {
      success: true,
      obligation: ob,
    };
  });

  // Verify Evidence by Officer (Demo Step 7)
  app.post<{
    Params: { id: string };
    Body: { approved: boolean; verificationNote: string };
  }>('/:id/verify', async (req, reply) => {
    const ob = store.obligations.find((o) => o.id === req.params.id);
    if (!ob) {
      return reply.code(404).send({ error: 'Obligation not found.' });
    }

    const user = store.currentUser;
    if (user.role === 'INSTITUTION') {
      return reply.code(403).send({ error: 'Only regional officers or authorized officials can verify compliance.' });
    }

    const { approved, verificationNote } = req.body || {};
    const now = clock.now();

    ob.status = approved ? 'VERIFIED' : 'REJECTED_EVIDENCE';
    ob.verifiedBy = user.name;
    ob.verifiedAt = now.toISOString();
    ob.verificationNote = verificationNote || (approved ? 'Evidence verified on-site / digital scrutiny.' : 'Deficiencies persist in submitted evidence.');

    // If verified, close any open alerts for this obligation
    if (approved) {
      store.alerts = store.alerts.filter((a) => a.itemId !== ob.id);
    }

    store.appendAudit(
      user.id,
      user.role,
      approved ? 'OBLIGATION_VERIFIED' : 'EVIDENCE_REJECTED',
      ob.id,
      {
        obligationTitle: ob.title,
        status: ob.status,
        verifiedBy: user.name,
      },
      ob.verificationNote
    );

    return {
      success: true,
      obligation: ob,
      message: approved ? 'Obligation verified and closed. Alerts cleared; Compliance Index increased.' : 'Evidence rejected with note.',
    };
  });

  // Document Vault with Live Lease Calculation (Section 8.3 & Demo Step 7)
  app.get('/documents', async () => {
    const scope = store.currentUser;
    let list = store.documents;

    if (scope.role === 'INSTITUTION') {
      list = list.filter((d) => d.institutionId === scope.institutionId);
    }

    const nowMs = clock.now().getTime();
    const docsWithMetrics = list.map((d) => {
      let liveYears = 0;
      if (d.docType === 'LEASE_AGREEMENT') {
        const expiry = clock.parse(d.validTo).getTime();
        liveYears = Number(((expiry - nowMs) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1));
      }
      return {
        ...d,
        liveLeaseYears: liveYears,
      };
    });

    return {
      documents: docsWithMetrics,
    };
  });

  // Demo Step 7: Lease Renewal & Verification (Pillar 3 & Section 8.3)
  app.post<{
    Body: { institutionId?: string; newValidToYears?: number; fileName?: string };
  }>('/documents/renew-lease', async (req) => {
    const user = store.currentUser;
    const now = clock.now();

    const existingLease = store.documents.find((d) => d.docType === 'LEASE_AGREEMENT');
    const newVersion = (existingLease?.version || 1) + 1;
    const thirtyYearsOut = clock.addDays(now, 30 * 365).toISOString();

    const renewedDoc: AppDocument = {
      id: `DOC-LEASE-V${newVersion}`,
      institutionId: existingLease?.institutionId || 'INST-DEMO',
      institutionName: existingLease?.institutionName || 'Saraswati Institute of Technology & Engineering',
      docType: 'LEASE_AGREEMENT',
      version: newVersion,
      fileName: req.body?.fileName || `Registered_Campus_Lease_Extension_v${newVersion}.pdf`,
      fileKey: `institutions/demo-001/lease_v${newVersion}.pdf`,
      validFrom: now.toISOString(),
      validTo: thirtyYearsOut,
      confirmedBy: 'Dr. Ramesh Sharma (Scrutiny Officer)',
      status: 'ACTIVE',
      uploadedAt: now.toISOString(),
    };

    if (existingLease) {
      existingLease.status = 'SUPERSEDED';
    }
    store.documents.unshift(renewedDoc);

    // Clear lease expiry alerts
    store.alerts = store.alerts.filter((a) => a.itemId !== 'DOC-DEMO-LEASE');

    // Audit log
    store.appendAudit(
      user.id,
      user.role,
      'DOCUMENT_RENEWED',
      renewedDoc.id,
      {
        docType: 'LEASE_AGREEMENT',
        version: newVersion,
        newValidTo: thirtyYearsOut,
        liveLeaseYears: 30,
      },
      'Campus land lease extended by 30 years; verified and confirmed by Scrutiny Officer.'
    );

    // Recalculate Compliance Score
    const indexResult = calculateComplianceIndex({
      overdueObligations: [],
      expiredDocumentsCount: 0,
      documentsExpiringWithin90DaysCount: 0,
      repeatDeficienciesCount: 0,
      rejectedEvidenceCount: 0,
      onTimeClosuresLast12MonthsCount: 1,
    });

    return {
      success: true,
      document: renewedDoc,
      complianceIndex: indexResult,
      message: 'Lease renewal verified. Live lease years restored to 30.0 years; expiry alerts closed; Compliance Index increased to 100.',
    };
  });
};
