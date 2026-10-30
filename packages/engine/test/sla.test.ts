import { describe, it, expect } from 'vitest';
import {
  calculateDualClock,
  handleStageReturn,
  handleStageResubmit,
  type ClockSegment,
} from '../src/sla.js';
import { formatDateIST } from '../src/calendar.js';

describe('Dual-Clock SLA Engine', () => {
  const holidays = new Set([
    '2026-01-26', // Republic Day
  ]);

  it('pauses AICTE clock on return and resumes with remaining days upon resubmit', () => {
    const stageSlaDays = 15;
    const initialStart = new Date('2026-01-05T09:30:00+05:30'); // Monday

    // Initial state: AICTE running
    const segments: ClockSegment[] = [
      {
        party: 'AICTE',
        startAt: initialStart.toISOString(),
      },
    ];

    // Case 1: After 5 working days (at end of Friday Jan 9, 2026)
    const returnTime = new Date('2026-01-09T18:00:00+05:30');
    const returnedState = handleStageReturn(segments, returnTime, 1);

    expect(returnedState.dueVersion).toBe(2);
    expect(returnedState.segments.length).toBe(2);
    expect(returnedState.segments[0].party).toBe('AICTE');
    expect(returnedState.segments[0].endAt).toBe(returnTime.toISOString());
    expect(returnedState.segments[1].party).toBe('INSTITUTION');
    expect(returnedState.segments[1].startAt).toBe(returnTime.toISOString());

    // Evaluate dual-clock during return period (e.g. on Jan 14)
    const midReturnTime = new Date('2026-01-14T12:00:00+05:30');
    const midCalc = calculateDualClock(returnedState.segments, stageSlaDays, midReturnTime, holidays);

    expect(midCalc.elapsedAICTEWorkingDays).toBe(5);
    expect(midCalc.remainingAICTEWorkingDays).toBe(10);
    expect(midCalc.activeParty).toBe('INSTITUTION');
    expect(midCalc.isAicteClockRunning).toBe(false);

    // Case 2: Institution resubmits on Monday Jan 19, 2026
    const resubmitTime = new Date('2026-01-19T10:00:00+05:30');
    const resubmittedState = handleStageResubmit(returnedState.segments, resubmitTime, returnedState.dueVersion);

    expect(resubmittedState.dueVersion).toBe(3);
    expect(resubmittedState.segments.length).toBe(3);
    expect(resubmittedState.segments[1].party).toBe('INSTITUTION');
    expect(resubmittedState.segments[1].endAt).toBe(resubmitTime.toISOString());
    expect(resubmittedState.segments[2].party).toBe('AICTE');
    expect(resubmittedState.segments[2].startAt).toBe(resubmitTime.toISOString());

    // Evaluate dual-clock after resubmit
    const finalCalc = calculateDualClock(resubmittedState.segments, stageSlaDays, resubmitTime, holidays);

    expect(finalCalc.activeParty).toBe('AICTE');
    expect(finalCalc.isAicteClockRunning).toBe(true);
    expect(finalCalc.elapsedAICTEWorkingDays).toBe(5);
    // AICTE resumes with REMAINING 10 days, not a reset 15!
    expect(finalCalc.remainingAICTEWorkingDays).toBe(10);

    // Due date calculation: 10 working days from Mon Jan 19, skipping weekends and Jan 26 holiday
    // lands exactly on Tue Feb 3, 2026
    expect(formatDateIST(finalCalc.dueOn)).toBe('2026-02-03');
  });
});
