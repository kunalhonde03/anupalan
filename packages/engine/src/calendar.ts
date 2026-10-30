import { clock, TIMEZONE } from './clock';

/**
 * Format a Date object to YYYY-MM-DD in Asia/Kolkata timezone.
 */
export function formatDateIST(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday) in Asia/Kolkata timezone.
 */
export function getDayOfWeekIST(date: Date): number {
  const str = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
  }).format(date);

  switch (str) {
    case 'Sun': return 0;
    case 'Mon': return 1;
    case 'Tue': return 2;
    case 'Wed': return 3;
    case 'Thu': return 4;
    case 'Fri': return 5;
    case 'Sat': return 6;
    default: return date.getUTCDay();
  }
}

/**
 * Check if a date falls on a weekend (Saturday or Sunday).
 */
export function isWeekend(date: Date): boolean {
  const day = getDayOfWeekIST(date);
  return day === 0 || day === 6;
}

/**
 * Check if a date is in the specified holiday set (YYYY-MM-DD strings).
 */
export function isHoliday(date: Date, holidays: Set<string>): boolean {
  const formatted = formatDateIST(date);
  return holidays.has(formatted);
}

/**
 * Check if a date is a working day (neither weekend nor holiday).
 */
export function isWorkingDay(date: Date, holidays: Set<string>): boolean {
  return !isWeekend(date) && !isHoliday(date, holidays);
}

/**
 * Add N working days to a starting date, skipping weekends and holidays.
 */
export function addWorkingDays(startDate: Date, days: number, holidays: Set<string>): Date {
  let remaining = days;
  let current = clock.parse(startDate.getTime());

  while (remaining > 0) {
    // Advance by 1 calendar day (24 hours)
    current = clock.addDays(current, 1);
    if (isWorkingDay(current, holidays)) {
      remaining -= 1;
    }
  }

  return current;
}

/**
 * Add N calendar days to a starting date.
 */
export function addCalendarDays(startDate: Date, days: number): Date {
  return clock.addDays(startDate, days);
}

/**
 * Count the number of working days elapsed between two dates.
 * If start and end are on the same calendar day:
 * - If isCompleted is true, counts as 1 working day if it is a working day.
 * - If isCompleted is false (e.g. open segment at current moment), counts as 0 working days elapsed so far.
 */
export function workingDaysBetween(
  startDate: Date,
  endDate: Date,
  holidays: Set<string>,
  isCompleted = true
): number {
  if (startDate.getTime() >= endDate.getTime()) {
    return 0;
  }

  const startFormatted = formatDateIST(startDate);
  const endFormatted = formatDateIST(endDate);

  if (startFormatted === endFormatted) {
    return isCompleted && isWorkingDay(startDate, holidays) ? 1 : 0;
  }

  let count = 0;
  let current = clock.parse(startDate.getTime());

  for (let safety = 0; safety < 10000; safety++) {
    if (isWorkingDay(current, holidays)) {
      count++;
    }

    if (formatDateIST(current) === endFormatted) {
      break;
    }

    current = clock.addDays(current, 1);
  }

  return count;
}
