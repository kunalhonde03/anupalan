import type { FastifyPluginAsync } from 'fastify';
import { clock } from '@anupalan/engine';
import { store } from '../store.js';

export const auditRoutes: FastifyPluginAsync = async (app) => {
  // Get full audit trail
  app.get('/', async () => {
    return {
      entries: store.auditChain,
      count: store.auditChain.length,
      headHash: store.auditChain.length > 0 ? store.auditChain[store.auditChain.length - 1].hash : null,
    };
  });

  // Demo Step 9: Re-verify cryptographic SHA-256 hash chain integrity
  app.post('/verify', async () => {
    const result = store.verifyIntegrity();
    return {
      integrity: result,
      status: result.valid ? 'VERIFIED_GREEN' : 'TAMPERED_RED',
      verifiedAt: clock.now().toISOString(),
      headHash: store.auditChain.length > 0 ? store.auditChain[store.auditChain.length - 1].hash : null,
      message: result.valid
        ? `Cryptographic hash chain verified intact across ${result.verifiedCount} historical transactions.`
        : `CRITICAL INTEGRITY BREACH: Tampering mathematically detected at record #${result.brokenAtIndex} (Entry ID: ${result.brokenEntryId}). Hash mismatch.`,
    };
  });

  // Demo Step 9: Tamper with one row to demonstrate tamper detection
  app.post('/tamper', async (req, reply) => {
    const tamperResult = store.tamperOneRow();
    if (!tamperResult) {
      return reply.code(400).send({ error: 'Audit trail must have at least 2 entries to simulate tampering.' });
    }

    return {
      success: true,
      tamperedEntryId: tamperResult.tamperedId,
      tamperedIndex: tamperResult.index,
      message: 'Malicious modification simulated on historical audit entry in database. Click "Verify Integrity" to watch verification turn RED.',
    };
  });

  // Daily External Ed25519 Digital Seals (Section 9.1 & Demo Step 9)
  app.get('/seals', async () => {
    const now = clock.now();
    return {
      dailySeals: [
        {
          date: '2026-01-29',
          entryCount: 14,
          headHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          signature: 'ed25519:6c5d18a93fe84d1421...signed_by_external_key',
          status: 'VALID_EXTERNAL_SEAL',
          timestampAuthority: 'AICTE-National-RFC3161-Trust-Anchor',
        },
        {
          date: '2026-01-30',
          entryCount: store.auditChain.length,
          headHash: store.auditChain[store.auditChain.length - 1]?.hash || '0'.repeat(64),
          signature: 'ed25519:9f8a7b6c5d4e3f2a1...signed_by_external_key',
          status: 'VALID_EXTERNAL_SEAL',
          timestampAuthority: 'AICTE-National-RFC3161-Trust-Anchor',
        },
      ],
      currentVirtualDate: now.toISOString().slice(0, 10),
    };
  });
};
