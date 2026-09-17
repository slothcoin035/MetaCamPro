import React from 'react';

interface TimerViewProps {
  selectedIndex: number;
  secondsLeft: number;
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onAddSeconds: (sec: number) => void;
}

export const TimerView: React.FC<TimerViewProps> = ({
  selectedIndex,
  secondsLeft,
  isRunning,
  onToggleTimer,
  onResetTimer,
  onAddSeconds,
}) => {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;

  const progressPercent = Math.min(100, Math.max(0, (secondsLeft / 300) * 100));

  return (
    <div className="w-full h-full flex flex-col justify-between px-5 py-3 overflow-hidden">
      {/* Primary Timer Readout */}
      <div className="text-center pt-2">
        <div className="text-[11px] font-mono text-emerald-400 tracking-widest uppercase mb-0.5">
          {isRunning ? 'HUD TIMER ACTIVE' : 'TIMER PAUSED'}
        </div>
        <div className="text-5xl font-mono font-bold tracking-tight text-white glow-emerald">
          {formattedTime}
        </div>

        {/* Minimalist circular / bar progress */}
        <div className="w-full bg-zinc-900 h-2 rounded-full mt-3 overflow-hidden border border-zinc-800">
          <div
            className={`h-full transition-all duration-300 ${
              isRunning ? 'bg-emerald-400 shadow-[0_0_10px_#00ff88]' : 'bg-zinc-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Timer Controls list (Reachable via D-Pad) */}
      <div className="space-y-1.5 mt-auto">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">
          D-Pad [↑ / ↓], Execute [ENTER]:
        </div>

        {/* Action 0: Start / Pause */}
        <button
          type="button"
          onClick={onToggleTimer}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 0
              ? 'border-emerald-400 bg-emerald-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500 font-mono">[1]</span>
            <span className="font-semibold">
              {isRunning ? 'Pause Timer' : 'Start Timer'}
            </span>
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
              isRunning
                ? 'bg-amber-400 text-black shadow-[0_0_8px_#ffb800]'
                : 'bg-emerald-400 text-black shadow-[0_0_8px_#00ff88]'
            }`}
          >
            {isRunning ? 'PAUSE' : 'START'}
          </span>
        </button>

        {/* Action 1: Reset */}
        <button
          type="button"
          onClick={onResetTimer}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 1
              ? 'border-emerald-400 bg-emerald-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500 font-mono">[2]</span>
            <span>Reset to 05:00</span>
          </span>
          <span className="text-[10px] text-zinc-400">RESET</span>
        </button>

        {/* Action 2: +1 Minute */}
        <button
          type="button"
          onClick={() => onAddSeconds(60)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 2
              ? 'border-emerald-400 bg-emerald-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500 font-mono">[3]</span>
            <span>Add +1 Minute</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-bold">+60s</span>
        </button>

        {/* Action 3: +5 Minutes */}
        <button
          type="button"
          onClick={() => onAddSeconds(300)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 3
              ? 'border-emerald-400 bg-emerald-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500 font-mono">[4]</span>
            <span>Add +5 Minutes</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-bold">+300s</span>
        </button>
      </div>
    </div>
  );
};
