import { createHash } from 'crypto';
import type { Role } from '@anupalan/shared';

export interface AuditLogEntry {
  id: string;
  at: string;
  entity: string;
  entityId: string;
  action: string;
  actorId: string;
  actorRole: Role;
  reason?: string;
  payload: Record<string, unknown>;
  prevHash: string;
  hash: string;
}

export interface ChainVerificationResult {
  valid: boolean;
  verifiedCount: number;
  brokenAtIndex?: number;
  brokenEntryId?: string;
  details?: string;
}

/**
 * Serializes any JavaScript value into canonical JSON:
 * - Deterministic, recursively sorted keys
 * - No insignificant whitespace
 * - Standard UTF-8 encoding
 */
export function canonicalJSON(val: unknown): string {
  if (val === null || typeof val !== 'object') {
    return JSON.stringify(val);
  }

  if (Array.isArray(val)) {
    return `[${val.map((item) => canonicalJSON(item)).join(',')}]`;
  }

  const obj = val as Record<string, unknown>;
  const sortedKeys = Object.keys(obj).sort();
  const entries = sortedKeys.map((k) => `${JSON.stringify(k)}:${canonicalJSON(obj[k])}`);
  return `{${entries.join(',')}}`;
}

/**
 * Computes SHA-256 hash of previous hash concatenated with canonical JSON of entry contents:
 * hash = SHA-256( prev_hash || canonicalJSON(entry) )
 */
export function computeEntryHash(
  prevHash: string,
  entry: Omit<AuditLogEntry, 'hash' | 'prevHash'>
): string {
  const contentToHash = {
    id: entry.id,
    at: entry.at,
    entity: entry.entity,
    entityId: entry.entityId,
    action: entry.action,
    actorId: entry.actorId,
    actorRole: entry.actorRole,
    reason: entry.reason ?? '',
    payload: entry.payload ?? {},
  };

  const canonicalString = canonicalJSON(contentToHash);
  const data = prevHash + canonicalString;

  return createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Verifies the integrity of an audit log hash chain from start to finish.
 * Returns valid = true or identifies the exact index and ID of any tampered record.
 */
export function verifyChain(chain: AuditLogEntry[]): ChainVerificationResult {
  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];

    // Check link to previous entry
    if (i > 0) {
      const prevEntry = chain[i - 1];
      if (entry.prevHash !== prevEntry.hash) {
        return {
          valid: false,
          verifiedCount: i,
          brokenAtIndex: i,
          brokenEntryId: entry.id,
          details: `Chain link broken: Entry ${entry.id} prevHash does not match previous entry ${prevEntry.id} hash.`,
        };
      }
    }

    // Recompute hash from content
    const calculatedHash = computeEntryHash(entry.prevHash, {
      id: entry.id,
      at: entry.at,
      entity: entry.entity,
      entityId: entry.entityId,
      action: entry.action,
      actorId: entry.actorId,
      actorRole: entry.actorRole,
      reason: entry.reason,
      payload: entry.payload,
    });

    if (calculatedHash !== entry.hash) {
      return {
        valid: false,
        verifiedCount: i,
        brokenAtIndex: i,
        brokenEntryId: entry.id,
        details: `Calculated hash does not match stored hash for entry ${entry.id}. Data has been modified.`,
      };
    }
  }

  return {
    valid: true,
    verifiedCount: chain.length,
  };
}
