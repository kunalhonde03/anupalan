import { describe, it, expect } from 'vitest';
import {
  canonicalJSON,
  computeEntryHash,
  verifyChain,
  type AuditLogEntry,
} from '../src/audit.js';

describe('Cryptographic Hash-Chained Audit Engine', () => {
  it('produces identical canonical JSON strings regardless of object key order', () => {
    const objA = { z: 'last', a: 'first', m: 42, nested: { b: 2, a: 1 } };
    const objB = { a: 'first', nested: { a: 1, b: 2 }, z: 'last', m: 42 };

    expect(canonicalJSON(objA)).toBe(canonicalJSON(objB));
  });

  it('computes deterministic SHA-256 hash chains across sequential entries', () => {
    const genesisPrevHash = '0'.repeat(64);

    const entry1: Omit<AuditLogEntry, 'hash' | 'prevHash'> = {
      id: 'AUDIT-1',
      at: '2026-01-10T10:00:00.000Z',
      entity: 'APPLICATION',
      entityId: 'APP-001',
      action: 'SUBMITTED',
      actorId: 'USER-1',
      actorRole: 'INSTITUTION',
      payload: { course: 'Computer Science' },
    };

    const hash1 = computeEntryHash(genesisPrevHash, entry1);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);

    const entry2: Omit<AuditLogEntry, 'hash' | 'prevHash'> = {
      id: 'AUDIT-2',
      at: '2026-01-11T12:00:00.000Z',
      entity: 'APPLICATION',
      entityId: 'APP-001',
      action: 'RETURNED',
      actorId: 'OFFICER-1',
      actorRole: 'SCRUTINY_OFFICER',
      reason: 'Deficient lab facilities',
      payload: {},
    };

    const hash2 = computeEntryHash(hash1, entry2);
    expect(hash2).toMatch(/^[a-f0-9]{64}$/);

    const chain: AuditLogEntry[] = [
      { ...entry1, prevHash: genesisPrevHash, hash: hash1 },
      { ...entry2, prevHash: hash1, hash: hash2 },
    ];

    const verification = verifyChain(chain);
    expect(verification.valid).toBe(true);
    expect(verification.verifiedCount).toBe(2);
  });

  it('detects tampering at the exact index and entry ID if an entry is altered mid-chain', () => {
    const genesisPrevHash = '0'.repeat(64);

    const rawEntries: Array<Omit<AuditLogEntry, 'hash' | 'prevHash'>> = [
      {
        id: 'AUDIT-1',
        at: '2026-01-01T10:00:00Z',
        entity: 'APPLICATION',
        entityId: 'APP-001',
        action: 'SUBMITTED',
        actorId: 'INST-1',
        actorRole: 'INSTITUTION',
        payload: { note: 'Initial application' },
      },
      {
        id: 'AUDIT-2',
        at: '2026-01-02T10:00:00Z',
        entity: 'APPLICATION',
        entityId: 'APP-001',
        action: 'SCRUTINY_COMPLETE',
        actorId: 'OFFICER-1',
        actorRole: 'SCRUTINY_OFFICER',
        payload: { verified: true },
      },
      {
        id: 'AUDIT-3',
        at: '2026-01-03T10:00:00Z',
        entity: 'APPLICATION',
        entityId: 'APP-001',
        action: 'DECIDED',
        actorId: 'HQ-1',
        actorRole: 'COMPETENT_AUTHORITY',
        reason: 'Approved conditionally with 6-month deficiency compliance',
        payload: { outcome: 'CONDITIONAL' },
      },
      {
        id: 'AUDIT-4',
        at: '2026-01-04T10:00:00Z',
        entity: 'OBLIGATION',
        entityId: 'OBL-001',
        action: 'OBLIGATION_CREATED',
        actorId: 'HQ-1',
        actorRole: 'COMPETENT_AUTHORITY',
        payload: { type: 'DEFICIENCY_COMPLIANCE' },
      },
    ];

    // Build intact chain
    let prev = genesisPrevHash;
    const chain: AuditLogEntry[] = [];
    for (const raw of rawEntries) {
      const h = computeEntryHash(prev, raw);
      chain.push({ ...raw, prevHash: prev, hash: h });
      prev = h;
    }

    // Verify intact chain passes
    expect(verifyChain(chain).valid).toBe(true);

    // Tamper with entry at index 2 (AUDIT-3)
    const tamperedChain = JSON.parse(JSON.stringify(chain)) as AuditLogEntry[];
    tamperedChain[2].reason = 'TAMPERED: Full unconditional approval granted without obligations';

    // Verification must turn red at index 2 and identify AUDIT-3
    const tamperedResult = verifyChain(tamperedChain);
    expect(tamperedResult.valid).toBe(false);
    expect(tamperedResult.brokenAtIndex).toBe(2);
    expect(tamperedResult.brokenEntryId).toBe('AUDIT-3');
    expect(tamperedResult.details).toContain('Calculated hash does not match stored hash');
  });
});
