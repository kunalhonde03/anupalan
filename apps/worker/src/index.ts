import { clock } from '@anupalan/engine';

export async function runSchedulerTick(): Promise<void> {
  const now = clock.now();
  console.log(`[ANUPALAN WORKER] Tick executed at virtual time: ${now.toISOString()}`);
}

console.log('[ANUPALAN WORKER] Worker daemon initialized in idle scaffold state.');

if (process.env.NODE_ENV !== 'test') {
  runSchedulerTick();
}
