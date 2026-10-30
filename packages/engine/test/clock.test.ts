import { describe, it, expect, beforeEach } from 'vitest';
import { clock, TIMEZONE } from '../src/index.js';

describe('Virtual Clock Engine', () => {
  beforeEach(() => {
    clock.reset();
  });

  it('provides the current time with default zero offset', () => {
    const before = Date.now();
    const virtualNow = clock.now().getTime();
    const after = Date.now();

    expect(virtualNow).toBeGreaterThanOrEqual(before);
    expect(virtualNow).toBeLessThanOrEqual(after);
    expect(clock.getOffsetMs()).toBe(0);
    expect(TIMEZONE).toBe('Asia/Kolkata');
  });

  it('shifts virtual time correctly when time machine offset is applied', () => {
    const shiftDays = 20;
    clock.setOffsetDays(shiftDays);

    const expectedOffset = shiftDays * 24 * 60 * 60 * 1000;
    expect(clock.getOffsetMs()).toBe(expectedOffset);

    const nowWithOffset = clock.now().getTime();
    const realNow = Date.now();

    // Check that the time is approximately realNow + expectedOffset (within 100ms tolerance)
    expect(Math.abs(nowWithOffset - (realNow + expectedOffset))).toBeLessThan(100);
  });
});
