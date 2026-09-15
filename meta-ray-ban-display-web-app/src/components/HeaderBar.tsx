import React from 'react';
import { HudTab } from '../types';

interface HeaderBarProps {
  currentTab: HudTab;
  tabIndex: number;
  totalTabs: number;
  timeString: string;
  batteryLevel: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentTab,
  tabIndex,
  totalTabs,
  timeString,
  batteryLevel,
}) => {
  const tabNames: Record<HudTab, string> = {
    glance: 'GLANCE',
    timer: 'TIMER',
    tasks: 'TASKS',
    sensors: 'COMPASS',
    notes: 'NOTES',
  };

  return (
    <header className="w-full px-5 pt-4 pb-2 flex items-center justify-between border-b border-cyan-500/20 text-xs tracking-wider">
      {/* Left: Device & Tab */}
      <div className="flex items-center space-x-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#00ff88]" />
        <span className="font-mono font-bold text-cyan-400">MRBD</span>
        <span className="text-zinc-500">|</span>
        <span className="font-bold tracking-widest text-emerald-300">
          {tabNames[currentTab]}
        </span>
        <span className="text-zinc-500 font-mono text-[11px]">
          ({tabIndex + 1}/{totalTabs})
        </span>
      </div>

      {/* Right: Clock & Battery */}
      <div className="flex items-center space-x-3 font-mono text-zinc-300">
        <span className="text-white font-semibold">{timeString}</span>
        <div className="flex items-center space-x-1 pl-1 border-l border-zinc-700">
          <div className="w-4 h-2.5 border border-zinc-400 rounded-xs p-0.5 flex items-center">
            <div
              className="h-full bg-emerald-400"
              style={{ width: `${Math.max(10, Math.min(100, batteryLevel))}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-400">{batteryLevel}%</span>
        </div>
      </div>
    </header>
  );
};
