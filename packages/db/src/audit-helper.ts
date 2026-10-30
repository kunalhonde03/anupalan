import { Prisma, PrismaClient, UserRole } from '@prisma/client';
import { clock, computeEntryHash } from '@anupalan/engine';

export interface AuditParams {
  entity: string;
  entityId: string;
  action: string;
  actorId: string;
  actorRole: UserRole;
  reason?: string;
  payload?: Record<string, unknown>;
}

export type PrismaTx = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Enforces Invariant 3: Every state change appends to hash-chained audit_log in the same DB transaction.
 */
export async function executeWithAudit<T>(
  prisma: PrismaClient,
  audit: AuditParams,
  mutationFn: (tx: PrismaTx) => Promise<T>
): Promise<{ result: T; auditId: string; auditHash: string }> {
  return prisma.$transaction(async (tx) => {
    // 1. Acquire advisory lock / find the latest entry to maintain sequential chain
    const lastEntry = await tx.auditLog.findFirst({
      orderBy: { sequence: 'desc' },
      select: { hash: true },
    });

    const prevHash = lastEntry ? lastEntry.hash : '0'.repeat(64);
    const now = clock.now();
    const tempId = `AUDIT-${now.getTime()}-${Math.floor(Math.random() * 10000)}`;

    // 2. Execute mutation
    const result = await mutationFn(tx as PrismaTx);

    // 3. Compute deterministic cryptographic hash
    const hash = computeEntryHash(prevHash, {
      id: tempId,
      at: now.toISOString(),
      entity: audit.entity,
      entityId: audit.entityId,
      action: audit.action,
      actorId: audit.actorId,
      actorRole: audit.actorRole as import('@anupalan/shared').Role,
      reason: audit.reason ?? '',
      payload: audit.payload ?? {},
    });

    // 4. Append to audit log in the same transaction
    const createdAudit = await tx.auditLog.create({
      data: {
        id: tempId,
        at: now,
        entity: audit.entity,
        entityId: audit.entityId,
        action: audit.action,
        actorId: audit.actorId,
        actorRole: audit.actorRole,
        reason: audit.reason,
        payload: (audit.payload ?? {}) as Prisma.InputJsonValue,
        prevHash,
        hash,
      },
    });

    return {
      result,
      auditId: createdAudit.id,
      auditHash: createdAudit.hash,
    };
  });
}
