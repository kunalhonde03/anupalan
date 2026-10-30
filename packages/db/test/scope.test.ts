import { describe, it, expect, vi } from 'vitest';
import { ScopeService, type UserScope } from '../src/scope.js';

describe('Scope Layer Security (Invariant 4)', () => {
  it('strictly isolates queries by region for Regional Officer roles', async () => {
    const mockFindMany = vi.fn().mockResolvedValue([]);
    const mockPrisma = {
      application: {
        findMany: mockFindMany,
      },
    } as unknown as import('@prisma/client').PrismaClient;

    const scopeService = new ScopeService(mockPrisma);

    const westernOfficerScope: UserScope = {
      userId: 'USER-RO-1',
      role: 'SCRUTINY_OFFICER',
      regionId: 'REGION-WESTERN-ID',
    };

    await scopeService.getApplications(westernOfficerScope);

    // Verify findMany was called with regionId filter
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          institution: { regionId: 'REGION-WESTERN-ID' },
        }),
      })
    );
  });

  it('strictly isolates queries by institution for Institution roles', async () => {
    const mockFindMany = vi.fn().mockResolvedValue([]);
    const mockPrisma = {
      application: {
        findMany: mockFindMany,
      },
    } as unknown as import('@prisma/client').PrismaClient;

    const scopeService = new ScopeService(mockPrisma);

    const instScope: UserScope = {
      userId: 'USER-INST-1',
      role: 'INSTITUTION',
      institutionId: 'INST-DEMO-ID',
    };

    await scopeService.getApplications(instScope);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          institutionId: 'INST-DEMO-ID',
        }),
      })
    );
  });

  it('rejects access if regional officer attempts to query without regionId', async () => {
    const mockPrisma = { application: { findMany: vi.fn() } } as unknown as import('@prisma/client').PrismaClient;
    const scopeService = new ScopeService(mockPrisma);

    const invalidScope: UserScope = {
      userId: 'USER-UNASSIGNED',
      role: 'REGIONAL_DIRECTOR',
      regionId: null,
    };

    await expect(scopeService.getApplications(invalidScope)).rejects.toThrow(/Access Denied/i);
  });

  it('blocks cross-region application access with 403 Forbidden', async () => {
    const mockFindUnique = vi.fn().mockResolvedValue({
      id: 'APP-NORTH-01',
      institution: { regionId: 'REGION-NORTHERN-ID' },
    });
    const mockPrisma = { application: { findUnique: mockFindUnique } } as unknown as import('@prisma/client').PrismaClient;
    const scopeService = new ScopeService(mockPrisma);

    const westernOfficerScope: UserScope = {
      userId: 'USER-WEST',
      role: 'SCRUTINY_OFFICER',
      regionId: 'REGION-WESTERN-ID',
    };

    await expect(
      scopeService.assertApplicationAccess(westernOfficerScope, 'APP-NORTH-01')
    ).rejects.toThrow(/403 Forbidden: Regional officer cannot access case outside assigned administrative region/i);
  });
});
