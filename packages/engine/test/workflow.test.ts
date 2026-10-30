import { describe, it, expect } from 'vitest';
import {
  evaluateTransition,
  type PathwayDefinition,
  type TransitionRequest,
} from '../src/workflow.js';

describe('Workflow State Machine Engine', () => {
  // Pathway definition matching rules/aph-2024-27.yaml
  const scrutinyEvcPathway: PathwayDefinition = {
    code: 'scrutiny_evc',
    stages: [
      { code: 'SCRUTINY', ownerRole: 'SCRUTINY_OFFICER', slaDays: 15, allowedReverts: [] },
      { code: 'EVC', ownerRole: 'EVC_CONVENER', slaDays: 30, allowedReverts: ['SCRUTINY'] },
      { code: 'DECISION', ownerRole: 'COMPETENT_AUTHORITY', slaDays: 10, allowedReverts: ['EVC', 'SCRUTINY'] },
    ],
  };

  it('allows valid sequential stage advance by authorized human owner', () => {
    const request: TransitionRequest = {
      action: 'COMPLETE_STAGE',
      currentStage: 'SCRUTINY',
      targetStage: 'EVC',
      actorRole: 'SCRUTINY_OFFICER',
      actorName: 'Dr. Ramesh Sharma',
      pathway: scrutinyEvcPathway,
    };

    const result = evaluateTransition(request);
    expect(result.allowed).toBe(true);
    expect(result.isBlocked).toBe(false);
  });

  it('strictly blocks system / scheduler actor from completing a stage (Invariant 1)', () => {
    const request: TransitionRequest = {
      action: 'COMPLETE_STAGE',
      currentStage: 'SCRUTINY',
      targetStage: 'EVC',
      actorRole: 'SYSTEM', // Scheduler / Automated actor
      pathway: scrutinyEvcPathway,
    };

    const result = evaluateTransition(request);
    expect(result.allowed).toBe(false);
    expect(result.isBlocked).toBe(true);
    expect(result.errorCode).toBe('BLOCKED_TRANSITION');
    expect(result.reason).toMatch(/system actor cannot complete/i);
  });

  it('blocks illegal stage skip (Scrutiny directly to Decision on scrutiny_evc)', () => {
    const request: TransitionRequest = {
      action: 'COMPLETE_STAGE',
      currentStage: 'SCRUTINY',
      targetStage: 'DECISION', // Illegal jump bypassing EVC!
      actorRole: 'SCRUTINY_OFFICER',
      actorName: 'Dr. Ramesh Sharma',
      pathway: scrutinyEvcPathway,
    };

    const result = evaluateTransition(request);
    expect(result.allowed).toBe(false);
    expect(result.isBlocked).toBe(true);
    expect(result.errorCode).toBe('BLOCKED_TRANSITION');
    expect(result.reason).toMatch(/illegal stage skip/i);
  });

  it('enforces mandatory non-empty reason on stage return (Invariant 7)', () => {
    // Attempt with empty reason
    const emptyReturn: TransitionRequest = {
      action: 'RETURN_TO_INSTITUTION',
      currentStage: 'SCRUTINY',
      actorRole: 'SCRUTINY_OFFICER',
      actorName: 'Dr. Ramesh Sharma',
      pathway: scrutinyEvcPathway,
      reason: '   ', // whitespace only
    };

    const resultEmpty = evaluateTransition(emptyReturn);
    expect(resultEmpty.allowed).toBe(false);
    expect(resultEmpty.isBlocked).toBe(true);
    expect(resultEmpty.errorCode).toBe('MANDATORY_REASON_REQUIRED');

    // Attempt with valid reason
    const validReturn: TransitionRequest = {
      action: 'RETURN_TO_INSTITUTION',
      currentStage: 'SCRUTINY',
      actorRole: 'SCRUTINY_OFFICER',
      actorName: 'Dr. Ramesh Sharma',
      pathway: scrutinyEvcPathway,
      reason: 'Deficient faculty cadre ratio in Computer Science Dept',
    };

    const resultValid = evaluateTransition(validReturn);
    expect(resultValid.allowed).toBe(true);
  });

  it('enforces allowed_reverts edges in pathway (Invariant 7)', () => {
    // EVC can revert to SCRUTINY
    const validRevert: TransitionRequest = {
      action: 'REVERT_STAGE',
      currentStage: 'EVC',
      targetStage: 'SCRUTINY',
      actorRole: 'REGIONAL_DIRECTOR',
      actorName: 'Dr. Sunita Deshmukh',
      pathway: scrutinyEvcPathway,
      reason: 'Re-scrutiny required for land title documents',
    };

    const resultValid = evaluateTransition(validRevert);
    expect(resultValid.allowed).toBe(true);

    // Scrutiny cannot revert to EVC
    const illegalRevert: TransitionRequest = {
      action: 'REVERT_STAGE',
      currentStage: 'SCRUTINY',
      targetStage: 'EVC',
      actorRole: 'SCRUTINY_OFFICER',
      actorName: 'Dr. Ramesh Sharma',
      pathway: scrutinyEvcPathway,
      reason: 'Invalid revert backwards',
    };

    const resultIllegal = evaluateTransition(illegalRevert);
    expect(resultIllegal.allowed).toBe(false);
    expect(resultIllegal.isBlocked).toBe(true);
    expect(resultIllegal.errorCode).toBe('BLOCKED_TRANSITION');
  });
});
