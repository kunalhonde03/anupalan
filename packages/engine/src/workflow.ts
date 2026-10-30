import type { Role, StageCode } from '@anupalan/shared';

export interface PathwayStageConfig {
  code: StageCode;
  ownerRole: Role;
  slaDays: number;
  allowedReverts: StageCode[];
}

export interface PathwayDefinition {
  code: string;
  stages: PathwayStageConfig[];
}

export type TransitionAction =
  | 'COMPLETE_STAGE'
  | 'RETURN_TO_INSTITUTION'
  | 'REVERT_STAGE'
  | 'RESUBMIT'
  | 'DECIDE';

export interface TransitionRequest {
  action: TransitionAction;
  currentStage: StageCode;
  targetStage?: StageCode;
  actorRole: Role;
  actorName?: string;
  pathway: PathwayDefinition;
  reason?: string;
  hasRedGateOverride?: boolean;
}

export interface TransitionEvaluationResult {
  allowed: boolean;
  isBlocked: boolean;
  errorCode?: 'BLOCKED_TRANSITION' | 'MANDATORY_REASON_REQUIRED' | 'UNAUTHORIZED_ROLE';
  reason?: string;
  nextStage?: StageCode;
}

/**
 * Pure function evaluating stage transition legitimacy according to rules and hard invariants.
 */
export function evaluateTransition(request: TransitionRequest): TransitionEvaluationResult {
  const { action, currentStage, targetStage, actorRole, pathway, reason } = request;

  // Invariant 1: SYSTEM actor is never allowed to approve, reject, return, or complete a stage
  if (actorRole === 'SYSTEM') {
    return {
      allowed: false,
      isBlocked: true,
      errorCode: 'BLOCKED_TRANSITION',
      reason: 'ANUPALAN Invariant 1 Violation: System actor cannot complete, return, or decide on a stage. Only a named human can.',
    };
  }

  const stageIndex = pathway.stages.findIndex((s) => s.code === currentStage);
  if (stageIndex === -1 && currentStage !== 'SUBMITTED') {
    return {
      allowed: false,
      isBlocked: true,
      errorCode: 'BLOCKED_TRANSITION',
      reason: `Current stage ${currentStage} is not recognized in pathway ${pathway.code}.`,
    };
  }

  // Evaluate by action
  switch (action) {
    case 'COMPLETE_STAGE': {
      if (currentStage === 'SUBMITTED') {
        const firstStage = pathway.stages[0]?.code;
        return { allowed: true, isBlocked: false, nextStage: firstStage };
      }

      const currentStageConfig = pathway.stages[stageIndex];
      // Check ownership
      if (actorRole !== currentStageConfig.ownerRole && actorRole !== 'REGIONAL_DIRECTOR' && actorRole !== 'COMPETENT_AUTHORITY') {
        return {
          allowed: false,
          isBlocked: true,
          errorCode: 'UNAUTHORIZED_ROLE',
          reason: `Actor role ${actorRole} is not authorized to complete stage owned by ${currentStageConfig.ownerRole}.`,
        };
      }

      // Next sequential stage in pathway
      const expectedNextStage = pathway.stages[stageIndex + 1]?.code;

      if (targetStage && targetStage !== expectedNextStage) {
        return {
          allowed: false,
          isBlocked: true,
          errorCode: 'BLOCKED_TRANSITION',
          reason: `Illegal stage skip: Attempted transition from ${currentStage} directly to ${targetStage}. Expected next stage is ${expectedNextStage}.`,
        };
      }

      return {
        allowed: true,
        isBlocked: false,
        nextStage: expectedNextStage,
      };
    }

    case 'RETURN_TO_INSTITUTION': {
      // Invariant 7: Return strictly requires non-empty reason
      if (!reason || reason.trim().length === 0) {
        return {
          allowed: false,
          isBlocked: true,
          errorCode: 'MANDATORY_REASON_REQUIRED',
          reason: 'ANUPALAN Invariant 7 Violation: A Return to Institution strictly requires a non-empty reason.',
        };
      }

      return {
        allowed: true,
        isBlocked: false,
      };
    }

    case 'REVERT_STAGE': {
      // Invariant 7: Revert strictly requires non-empty reason
      if (!reason || reason.trim().length === 0) {
        return {
          allowed: false,
          isBlocked: true,
          errorCode: 'MANDATORY_REASON_REQUIRED',
          reason: 'ANUPALAN Invariant 7 Violation: A Revert to earlier stage strictly requires a non-empty reason.',
        };
      }

      if (!targetStage) {
        return {
          allowed: false,
          isBlocked: true,
          errorCode: 'BLOCKED_TRANSITION',
          reason: 'Target stage must be specified for a stage revert.',
        };
      }

      const currentStageConfig = pathway.stages[stageIndex];
      const allowedReverts = currentStageConfig?.allowedReverts || [];

      if (!allowedReverts.includes(targetStage)) {
        return {
          allowed: false,
          isBlocked: true,
          errorCode: 'BLOCKED_TRANSITION',
          reason: `Revert from ${currentStage} to ${targetStage} is not permitted by pathway ${pathway.code}. Allowed reverts: [${allowedReverts.join(', ')}].`,
        };
      }

      return {
        allowed: true,
        isBlocked: false,
        nextStage: targetStage,
      };
    }

    case 'RESUBMIT': {
      return {
        allowed: true,
        isBlocked: false,
        nextStage: currentStage,
      };
    }

    case 'DECIDE': {
      if (actorRole !== 'COMPETENT_AUTHORITY') {
        return {
          allowed: false,
          isBlocked: true,
          errorCode: 'UNAUTHORIZED_ROLE',
          reason: 'Only COMPETENT_AUTHORITY can record a final approval/decision.',
        };
      }

      return {
        allowed: true,
        isBlocked: false,
      };
    }

    default:
      return {
        allowed: false,
        isBlocked: true,
        errorCode: 'BLOCKED_TRANSITION',
        reason: `Unsupported transition action: ${action}.`,
      };
  }
}
