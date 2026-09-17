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
    <div className="w-full h-full flex flex-col justify-between px-5 py-3 overflow-hidden">
      {/* Primary HUD Clock & Date Display */}
      <div className="text-center pt-1">
        <div className="text-xs font-mono text-cyan-300 tracking-wider mb-0.5">
          {dateString}
        </div>
        <div className="text-4xl font-mono font-bold tracking-tight text-white glow-cyan">
          {timeString}
        </div>
        <div className="mt-1.5 flex items-center justify-center space-x-3 text-[11px] font-mono text-zinc-400">
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

      {/* Glance Telemetry Bar (Meta Wearables Data Grid) */}
      <div className="grid grid-cols-2 gap-2.5 my-1.5">
        <div className="border border-zinc-800 rounded-lg p-2 bg-[#14141f]">
          <div className="text-[10px] font-mono text-zinc-400 tracking-wider">COMPASS BEARING</div>
          <div className="text-base font-mono font-semibold text-cyan-300 mt-0.5">
            {compassHeading !== null ? `${Math.round(compassHeading)}°` : '342° NW (CAL)'}
          </div>
        </div>
        <div className="border border-zinc-800 rounded-lg p-2 bg-[#14141f]">
          <div className="text-[10px] font-mono text-zinc-400 tracking-wider">WAVEGUIDE STATUS</div>
          <div className="text-base font-mono font-semibold text-emerald-300 mt-0.5">
            600×600 ADDITIVE
          </div>
        </div>
      </div>

      {/* Focusable Interactive Actions List */}
      <div className="space-y-1.5 mt-auto">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">
          D-Pad [↑ / ↓], Activate [ENTER]:
        </div>

        {/* Action 0: Audio feedback toggle */}
        <button
          type="button"
          onClick={onToggleAudio}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 0
              ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500 font-mono">[1]</span>
            <span className="font-medium">Audio Feedback</span>
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
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
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 1
              ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500 font-mono">[2]</span>
            <span className="font-medium">Companion GPS Sensor</span>
          </span>
          <span className="text-[10px] text-cyan-300">
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
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 2
              ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500 font-mono">[3]</span>
            <span className="font-medium">Switch to Timer HUD</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">NEXT [→]</span>
        </button>
      </div>
    </div>
  );
};
