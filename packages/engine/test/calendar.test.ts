import { describe, it, expect } from 'vitest';
import {
  isWeekend,
  isHoliday,
  isWorkingDay,
  addWorkingDays,
  workingDaysBetween,
  formatDateIST,
} from '../src/calendar.js';

describe('Calendar Engine (Asia/Kolkata)', () => {
  const holidays = new Set([
    '2026-01-26', // Republic Day
    '2026-03-04', // Holi
    '2026-08-15', // Independence Day
    '2026-10-02', // Gandhi Jayanti
  ]);

  it('correctly identifies weekends', () => {
    // 2026-01-24 is Saturday, 2026-01-25 is Sunday
    const sat = new Date('2026-01-24T10:00:00+05:30');
    const sun = new Date('2026-01-25T10:00:00+05:30');
    const mon = new Date('2026-01-26T10:00:00+05:30');

    expect(isWeekend(sat)).toBe(true);
    expect(isWeekend(sun)).toBe(true);
    expect(isWeekend(mon)).toBe(false);
  });

  it('correctly identifies gazetted holidays', () => {
    const republicDay = new Date('2026-01-26T10:00:00+05:30');
    const regularDay = new Date('2026-01-27T10:00:00+05:30');

    expect(isHoliday(republicDay, holidays)).toBe(true);
    expect(isHoliday(regularDay, holidays)).toBe(false);
  });

  it('determines working days by skipping both weekends and holidays', () => {
    const friday = new Date('2026-01-23T10:00:00+05:30');
    const saturday = new Date('2026-01-24T10:00:00+05:30');
    const mondayHoliday = new Date('2026-01-26T10:00:00+05:30');
    const tuesdayWorking = new Date('2026-01-27T10:00:00+05:30');

    expect(isWorkingDay(friday, holidays)).toBe(true);
    expect(isWorkingDay(saturday, holidays)).toBe(false);
    expect(isWorkingDay(mondayHoliday, holidays)).toBe(false);
    expect(isWorkingDay(tuesdayWorking, holidays)).toBe(true);
  });

  it('adds working days correctly skipping a weekend and Republic Day holiday', () => {
    // Starting on Friday Jan 23, 2026.
    // Adding 5 working days must skip Sat 24, Sun 25, Mon 26 (Holiday).
    // Days counted: Tue Jan 27 (1), Wed Jan 28 (2), Thu Jan 29 (3), Fri Jan 30 (4),
    // skips Sat Jan 31, Sun Feb 1, and reaches Mon Feb 2 (5).
    const start = new Date('2026-01-23T10:00:00+05:30');
    const result = addWorkingDays(start, 5, holidays);

    expect(formatDateIST(result)).toBe('2026-02-02');
  });

  it('calculates working days between dates accurately', () => {
    // From Friday Jan 23 to Monday Feb 2:
    // Working days: 23rd, 27th, 28th, 29th, 30th, 2nd (6 working days if inclusive)
    const start = new Date('2026-01-23T10:00:00+05:30');
    const end = new Date('2026-02-02T10:00:00+05:30');

    const count = workingDaysBetween(start, end, holidays);
    expect(count).toBe(6);
  });
});
