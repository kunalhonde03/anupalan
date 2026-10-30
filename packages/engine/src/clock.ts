/**
 * ANUPALAN Virtual Clock Module
 *
 * Enforces Invariant 2: All time comes from clock.now() in packages/engine.
 * Never call Date.now() or new Date() anywhere else.
 * Timezone is Asia/Kolkata.
 */

export const TIMEZONE = 'Asia/Kolkata';

class SystemClock {
  private offsetMs = 0;

  /**
   * Returns current time accounting for any virtual Time Machine offset.
   */
  public now(): Date {
    return new Date(Date.now() + this.offsetMs);
  }

  /**
   * Fast-forward or rewind time by milliseconds.
   */
  public setOffsetMs(offset: number): void {
    this.offsetMs = offset;
  }

  /**
   * Fast-forward or rewind time by calendar days.
   */
  public setOffsetDays(days: number): void {
    this.offsetMs = days * 24 * 60 * 60 * 1000;
  }

  /**
   * Returns current virtual offset in milliseconds.
   */
  public getOffsetMs(): number {
    return this.offsetMs;
  }

  /**
   * Resets offset to 0 (real system time).
   */
  public reset(): void {
    this.offsetMs = 0;
  }

  /**
   * Parses an ISO string, timestamp, or Date into a Date object.
   * Centralizes all Date instantiations to satisfy Invariant 2.
   */
  public parse(val: string | number | Date): Date {
    return new Date(val);
  }

  /**
   * Adds milliseconds to a Date.
   */
  public addMs(date: Date, ms: number): Date {
    return new Date(date.getTime() + ms);
  }

  /**
   * Adds calendar days to a Date.
   */
  public addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }
}

export const clock = new SystemClock();
