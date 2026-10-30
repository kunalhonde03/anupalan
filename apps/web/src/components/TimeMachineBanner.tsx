'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { clock, TIMEZONE } from '@anupalan/engine';

interface TimeMachineBannerProps {
  offsetDays: number;
  onReset: () => void;
}

export const TimeMachineBanner: React.FC<TimeMachineBannerProps> = ({ offsetDays, onReset }) => {
  if (offsetDays === 0) return null;

  const virtualDate = clock.now().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIMEZONE,
  });

  return (
    <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2.5 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm font-medium">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
          <span>
            <strong>Time Machine Simulation Active (+{offsetDays} days):</strong> System operating in virtual timeline at{' '}
            <span className="font-mono underline">{virtualDate} ({TIMEZONE})</span>.
          </span>
        </div>

        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
          <span className="bg-amber-700/60 border border-amber-400/40 px-2 py-0.5 rounded text-[11px]">
            Alert Rungs Fired: T-3 ➔ T-0 ➔ T+3 Escalation
          </span>
          <button
            onClick={onReset}
            className="flex items-center space-x-1 bg-white text-amber-900 font-bold px-2.5 py-1 rounded hover:bg-amber-50 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo Clock</span>
          </button>
        </div>
      </div>
    </div>
  );
};
