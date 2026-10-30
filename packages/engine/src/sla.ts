import { addWorkingDays, workingDaysBetween } from './calendar';
import { clock } from './clock';

export type SegmentParty = 'AICTE' | 'INSTITUTION' | 'COMMITTEE';

export interface ClockSegment {
  id?: string;
  stageInstanceId?: string;
  party: SegmentParty;
  startAt: string; // ISO string
  endAt?: string;   // ISO string if segment closed
}

export interface DualClockResult {
  activeParty: SegmentParty;
  isAicteClockRunning: boolean;
  elapsedAICTEWorkingDays: number;
  elapsedInstitutionWorkingDays: number;
  elapsedInstitutionCalendarDays: number;
  remainingAICTEWorkingDays: number;
  dueOn: Date;
}

/**
 * Calculates dual-clock attribution and remaining SLA working days.
 */
export function calculateDualClock(
  segments: ClockSegment[],
  stageSlaWorkingDays: number,
  now: Date,
  holidays: Set<string>
): DualClockResult {
  let elapsedAICTEWorkingDays = 0;
  let elapsedInstitutionWorkingDays = 0;
  let elapsedInstitutionCalendarDays = 0;

  const activeSegment = segments.find((s) => !s.endAt) || segments[segments.length - 1];
  const activeParty = activeSegment ? activeSegment.party : 'AICTE';
  const isAicteClockRunning = activeParty === 'AICTE' || activeParty === 'COMMITTEE';

  for (const seg of segments) {
    const startDate = clock.parse(seg.startAt);
    const endDate = seg.endAt ? clock.parse(seg.endAt) : now;
    const isCompleted = Boolean(seg.endAt);

    const workingDays = workingDaysBetween(startDate, endDate, holidays, isCompleted);
    const calendarDays = Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));

    if (seg.party === 'AICTE' || seg.party === 'COMMITTEE') {
      elapsedAICTEWorkingDays += workingDays;
    } else if (seg.party === 'INSTITUTION') {
      elapsedInstitutionWorkingDays += workingDays;
      elapsedInstitutionCalendarDays += calendarDays;
    }
  }

  const remainingAICTEWorkingDays = Math.max(0, stageSlaWorkingDays - elapsedAICTEWorkingDays);
  const dueOn = addWorkingDays(now, remainingAICTEWorkingDays, holidays);

  return {
    activeParty,
    isAicteClockRunning,
    elapsedAICTEWorkingDays,
    elapsedInstitutionWorkingDays,
    elapsedInstitutionCalendarDays,
    remainingAICTEWorkingDays,
    dueOn,
  };
}

/**
 * Transition: Return to institution.
 * Pauses AICTE clock, starts Institution clock, increments due_version.
 */
export function handleStageReturn(
  segments: ClockSegment[],
  returnTime: Date,
  currentDueVersion: number
): { segments: ClockSegment[]; dueVersion: number } {
  const updatedSegments = segments.map((seg, idx) => {
    if (idx === segments.length - 1 && !seg.endAt) {
      return { ...seg, endAt: returnTime.toISOString() };
    }
    return seg;
  });

  updatedSegments.push({
    party: 'INSTITUTION',
    startAt: returnTime.toISOString(),
  });

  return {
    segments: updatedSegments,
    dueVersion: currentDueVersion + 1,
  };
}

/**
 * Transition: Institution resubmits.
 * Stops Institution clock, resumes AICTE clock, increments due_version.
 */
export function handleStageResubmit(
  segments: ClockSegment[],
  resubmitTime: Date,
  currentDueVersion: number
): { segments: ClockSegment[]; dueVersion: number } {
  const updatedSegments = segments.map((seg, idx) => {
    if (idx === segments.length - 1 && !seg.endAt) {
      return { ...seg, endAt: resubmitTime.toISOString() };
    }
    return seg;
  });

  updatedSegments.push({
    party: 'AICTE',
    startAt: resubmitTime.toISOString(),
  });

  return {
    segments: updatedSegments,
    dueVersion: currentDueVersion + 1,
  };
}
