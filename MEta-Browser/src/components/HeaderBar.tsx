import React from 'react';
import { HudTab } from '../types';

interface HeaderBarProps {
  currentTab: HudTab;
  tabIndex: number;
  totalTabs: number;
  timeString: string;
  batteryLevel: number;
  onSwitchTab?: (tab: HudTab) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentTab,
  tabIndex,
  totalTabs,
  timeString,
  batteryLevel,
  onSwitchTab,
}) => {
  const tabNames: Record<HudTab, string> = {
    browser: 'WEB BROWSER',
    search: 'WEB SEARCH',
    glance: 'GLANCE',
    gestures: 'WRIST GESTURES',
    timer: 'TIMER',
    tasks: 'TASKS',
    sensors: 'SENSORS',
    notes: 'NOTES',
    snake: 'SNAKE',
    pair: 'PAIR GLASSES',
  };

  return (
    <header className="w-full h-12 px-3 flex items-center justify-between border-b border-cyan-500/20 text-xs tracking-wider bg-[#0a0a0f] shrink-0">
      {/* Left: Device & Tab Indicator + Quick Nav */}
      <div className="flex items-center space-x-1.5">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#00ff88]" />
        <span className="font-mono font-bold text-cyan-400 text-[11px]">MRBD</span>
        <span className="text-zinc-600">|</span>

        {/* Quick Direct Buttons for Browser & Search */}
        {onSwitchTab ? (
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => onSwitchTab('browser')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                currentTab === 'browser'
                  ? 'bg-blue-600 text-white shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title="Open Websites in Web Browser"
            >
              🌐 BROWSER
            </button>
            <button
              type="button"
              onClick={() => onSwitchTab('search')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                currentTab === 'search'
                  ? 'bg-cyan-600 text-white shadow-[0_0_8px_rgba(0,212,255,0.5)]'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title="Search Web & Gemini"
            >
              🔍 SEARCH
            </button>
          </div>
        ) : (
          <span className="font-bold tracking-widest text-emerald-300">
            {tabNames[currentTab]}
          </span>
        )}

        <span className="text-zinc-500 font-mono text-[10px] hidden sm:inline">
          ({tabIndex + 1}/{totalTabs})
        </span>
      </div>

      {/* Right: Real-time Clock & Battery Telemetry */}
      <div className="flex items-center space-x-3 font-mono text-zinc-300">
        <span className="text-white font-semibold">{timeString}</span>
        <div className="flex items-center space-x-1 pl-2 border-l border-zinc-700">
          <div className="w-4 h-2.5 border border-zinc-400 rounded-xs p-0.5 flex items-center">
            <div
              className="h-full bg-emerald-400 rounded-xs"
              style={{ width: `${Math.max(10, Math.min(100, batteryLevel))}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-400">{batteryLevel}%</span>
        </div>
      </div>
    </header>
  );
};
