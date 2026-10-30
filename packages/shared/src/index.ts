import { z } from 'zod';

/**
 * Standard Roles in ANUPALAN
 */
export const RoleSchema = z.enum([
  'INSTITUTION',
  'SCRUTINY_OFFICER',
  'REGIONAL_DIRECTOR',
  'EVC_CONVENER',
  'COMMITTEE_MEMBER',
  'COMPETENT_AUTHORITY',
  'SYSTEM_ADMIN',
  'SYSTEM'
]);

export type Role = z.infer<typeof RoleSchema>;

/**
 * Regions in ANUPALAN
 */
export const RegionCodeSchema = z.enum([
  'CENTRAL',
  'EASTERN',
  'NORTHERN',
  'NORTHWEST',
  'SOUTHERN',
  'SOUTHWEST',
  'WESTERN'
]);

export type RegionCode = z.infer<typeof RegionCodeSchema>;

/**
 * Stage Codes
 */
export const StageCodeSchema = z.enum([
  'SUBMITTED',
  'SCRUTINY',
  'RE_SCRUTINY',
  'EVC',
  'REGIONAL_COMMITTEE',
  'SHC',
  'SAC',
  'DECISION'
]);

export type StageCode = z.infer<typeof StageCodeSchema>;

/**
 * Obligation Types
 */
export const ObligationTypeSchema = z.enum([
  'DEFICIENCY_COMPLIANCE',
  'UNDERTAKING',
  'PENDING_NOC',
  'CARRY_FORWARD',
  'LEASE_VALIDITY',
  'DOCUMENT_VALIDITY'
]);

export type ObligationType = z.infer<typeof ObligationTypeSchema>;
