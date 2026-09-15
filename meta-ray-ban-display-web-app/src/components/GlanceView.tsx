import React from 'react';
import { LocationData } from '../types';

interface GlanceViewProps {
  selectedIndex: number;
  timeString: string;
  dateString: string;
  audioFeedbackEnabled: boolean;
  onToggleAudio: () => void;
  locationData: LocationData;
  onRequestLocation: () => void;
  onNextTab: () => void;
  pendingTasksCount: number;
  timerActive: boolean;
  compassHeading: number | null;
}

export const GlanceView: React.FC<GlanceViewProps> = ({
  selectedIndex,
  timeString,
  dateString,
  audioFeedbackEnabled,
  onToggleAudio,
  locationData,
  onRequestLocation,
  onNextTab,
  pendingTasksCount,
  timerActive,
  compassHeading,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-4">
      {/* Primary HUD Clock & Date Display */}
      <div className="text-center pt-2">
        <div className="text-[15px] font-mono text-cyan-300 tracking-wider mb-1">
          {dateString}
        </div>
        <div className="text-5xl font-mono font-bold tracking-tight text-white glow-cyan">
          {timeString}
        </div>
        <div className="mt-2 flex items-center justify-center space-x-4 text-xs font-mono text-zinc-400">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>HUD READY</span>
          </span>
          <span>•</span>
          <span className="text-emerald-300">
            {pendingTasksCount} TASKS PENDING
          </span>
          <span>•</span>
          <span className={timerActive ? 'text-amber-300 font-bold' : 'text-zinc-500'}>
            TIMER: {timerActive ? 'RUNNING' : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Glance Telemetry Bar */}
      <div className="grid grid-cols-2 gap-3 my-2">
        <div className="border border-zinc-800 rounded-md p-2.5 bg-black/60">
          <div className="text-[11px] font-mono text-zinc-400 tracking-wider">COMPASS BEARING</div>
          <div className="text-lg font-mono font-semibold text-cyan-300 mt-0.5">
            {compassHeading !== null ? `${Math.round(compassHeading)}°` : '342° NW (CAL)'}
          </div>
        </div>
        <div className="border border-zinc-800 rounded-md p-2.5 bg-black/60">
          <div className="text-[11px] font-mono text-zinc-400 tracking-wider">WAVEGUIDE STATUS</div>
          <div className="text-lg font-mono font-semibold text-emerald-300 mt-0.5">
            600×600 ADDITIVE
          </div>
        </div>
      </div>

      {/* Focusable Interactive Actions List */}
      <div className="space-y-2 mt-auto">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
          Select with [↑ / ↓], activate with [ENTER]:
        </div>

        {/* Action 0: Audio feedback toggle */}
        <button
          type="button"
          onClick={onToggleAudio}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md border text-sm font-mono transition-all text-left ${
            selectedIndex === 0
              ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-black'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-xs text-zinc-500 font-mono">[1]</span>
            <span className="font-medium">Audio Feedback</span>
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded font-bold ${
              audioFeedbackEnabled
                ? 'bg-emerald-500 text-black shadow-[0_0_8px_#00ff88]'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {audioFeedbackEnabled ? 'ENABLED' : 'MUTED'}
          </span>
        </button>

        {/* Action 1: Geolocation request */}
        <button
          type="button"
          onClick={onRequestLocation}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md border text-sm font-mono transition-all text-left ${
            selectedIndex === 1
              ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-black'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-xs text-zinc-500 font-mono">[2]</span>
            <span className="font-medium">Companion GPS Location</span>
          </span>
          <span className="text-xs text-cyan-300">
            {locationData.status === 'available'
              ? `${locationData.latitude?.toFixed(2)}°, ${locationData.longitude?.toFixed(2)}°`
              : locationData.status === 'requesting'
              ? 'FETCHING...'
              : 'PRESS ENTER'}
          </span>
        </button>

        {/* Action 2: Next Tab */}
        <button
          type="button"
          onClick={onNextTab}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md border text-sm font-mono transition-all text-left ${
            selectedIndex === 2
              ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-black'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-xs text-zinc-500 font-mono">[3]</span>
            <span className="font-medium">Switch to Timer HUD</span>
          </span>
          <span className="text-xs text-emerald-400 font-bold">NEXT [→]</span>
        </button>
      </div>
    </div>
  );
};
