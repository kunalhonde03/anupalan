import { PrismaClient, UserRole } from '@prisma/client';

export interface UserScope {
  userId: string;
  role: UserRole;
  regionId?: string | null;
  institutionId?: string | null;
}

export class ScopeService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Enforces Invariant 4: All queries go through the Scope layer (role, region, institution).
   */
  public async getApplications(scope: UserScope, additionalWhere: Record<string, unknown> = {}) {
    let scopeWhere: Record<string, unknown> = {};

    if (scope.role === 'INSTITUTION') {
      if (!scope.institutionId) {
        throw new Error('Access Denied: Institution scope requires valid institution ID.');
      }
      scopeWhere = { institutionId: scope.institutionId };
    } else if (scope.role === 'SCRUTINY_OFFICER' || scope.role === 'REGIONAL_DIRECTOR' || scope.role === 'EVC_CONVENER') {
      if (!scope.regionId) {
        throw new Error('Access Denied: Regional officer scope requires assigned region ID.');
      }
      scopeWhere = { institution: { regionId: scope.regionId } };
    } else if (scope.role === 'COMPETENT_AUTHORITY' || scope.role === 'SYSTEM_ADMIN') {
      // National HQ / System Admin scope: All-India access
      scopeWhere = {};
    } else {
      // Any other role without explicit scope
      scopeWhere = { id: '__UNAUTHORIZED__' };
    }

    return this.prisma.application.findMany({
      where: {
        ...scopeWhere,
        ...additionalWhere,
      },
      include: {
        institution: {
          include: { region: true },
        },
        stageInstances: {
          orderBy: { startedAt: 'asc' },
          include: { clockSegments: true },
        },
        decisions: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  /**
   * Scoped obligation query for Obligation Ledger.
   */
  public async getObligations(scope: UserScope, additionalWhere: Record<string, unknown> = {}) {
    let scopeWhere: Record<string, unknown> = {};

    if (scope.role === 'INSTITUTION') {
      if (!scope.institutionId) {
        throw new Error('Access Denied: Institution scope requires valid institution ID.');
      }
      scopeWhere = { institutionId: scope.institutionId };
    } else if (scope.role === 'REGIONAL_DIRECTOR' || scope.role === 'SCRUTINY_OFFICER') {
      if (!scope.regionId) {
        throw new Error('Access Denied: Regional officer scope requires assigned region ID.');
      }
      scopeWhere = { institution: { regionId: scope.regionId } };
    } else if (scope.role === 'COMPETENT_AUTHORITY' || scope.role === 'SYSTEM_ADMIN') {
      scopeWhere = {};
    } else {
      scopeWhere = { id: '__UNAUTHORIZED__' };
    }

    return this.prisma.obligation.findMany({
      where: {
        ...scopeWhere,
        ...additionalWhere,
      },
      include: {
        institution: true,
        events: { orderBy: { createdAt: 'desc' } },
        evidenceLinks: {
          include: { document: true },
        },
      },
      orderBy: { dueOn: 'asc' },
    });
  }

  /**
   * Scoped document vault query.
   */
  public async getDocuments(scope: UserScope, additionalWhere: Record<string, unknown> = {}) {
    let scopeWhere: Record<string, unknown> = {};

    if (scope.role === 'INSTITUTION') {
      scopeWhere = { institutionId: scope.institutionId };
    } else if (scope.role === 'REGIONAL_DIRECTOR' || scope.role === 'SCRUTINY_OFFICER') {
      scopeWhere = { institution: { regionId: scope.regionId } };
    } else if (scope.role === 'COMPETENT_AUTHORITY' || scope.role === 'SYSTEM_ADMIN') {
      scopeWhere = {};
    }

    return this.prisma.document.findMany({
      where: {
        ...scopeWhere,
        ...additionalWhere,
      },
      include: {
        institution: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  /**
   * Validate whether an actor has authority to access or mutate a specific application.
   */
  public async assertApplicationAccess(scope: UserScope, applicationId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { institution: true },
    });

    if (!app) {
      throw new Error(`Application ${applicationId} not found.`);
    }

    if (scope.role === 'INSTITUTION' && app.institutionId !== scope.institutionId) {
      throw new Error(`403 Forbidden: Institution cannot access case belonging to another institution.`);
    }

    if (
      (scope.role === 'SCRUTINY_OFFICER' || scope.role === 'REGIONAL_DIRECTOR') &&
      app.institution.regionId !== scope.regionId
    ) {
      throw new Error(`403 Forbidden: Regional officer cannot access case outside assigned administrative region.`);
    }

    return app;
  }
}
