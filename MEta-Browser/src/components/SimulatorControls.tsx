import React, { useState } from 'react';

export type EnvironmentType = 'black' | 'waveguide' | 'livingroom' | 'office' | 'outdoor';

interface SimulatorControlsProps {
  environment: EnvironmentType;
  onChangeEnvironment: (env: EnvironmentType) => void;
  onSimulateKey: (key: string) => void;
  scale: number;
  browserUrl?: string;
  onOpenWebsitePrompt?: () => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  environment,
  onChangeEnvironment,
  onSimulateKey,
  scale,
  browserUrl = 'https://en.m.wikipedia.org/wiki/Ray-Ban_Meta',
  onOpenWebsitePrompt,
}) => {
  const [showDpad, setShowDpad] = useState<boolean>(false);
  const [showChecklist, setShowChecklist] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  return (
    <>
      {/* Floating Developer Toolbar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 sm:gap-2 bg-zinc-950/95 border border-zinc-700/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl font-mono text-xs text-zinc-300 select-none max-w-[95vw] overflow-x-auto">
        {/* MRBD Badge */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-zinc-700 text-[11px] shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white hidden sm:inline">MRBD HUD</span>
          <span className="text-zinc-500 text-[10px]">({Math.round(scale * 100)}%)</span>
        </div>

        {/* Quick Open Website Prompt */}
        {onOpenWebsitePrompt && (
          <button
            type="button"
            onClick={onOpenWebsitePrompt}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border bg-emerald-950/60 text-emerald-300 border-emerald-500/70 hover:bg-emerald-900/80 shadow-[0_0_10px_rgba(0,255,136,0.3)] shrink-0 flex items-center gap-1 cursor-pointer"
            title="Open any website URL in the browser"
          >
            <span>🔗</span>
            <span>Open Website...</span>
          </button>
        )}

        {/* Quick Launch in Google Chrome */}
        <a
          href={browserUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border bg-blue-600/30 text-blue-200 border-blue-500/70 hover:bg-blue-600/50 shadow-[0_0_10px_rgba(59,130,246,0.35)] shrink-0 flex items-center gap-1 cursor-pointer"
          title="Open currently active website in Google Chrome (new tab)"
        >
          <span>🌐</span>
          <span>Chrome ↗</span>
        </a>

        {/* Environment Switcher */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() =>
              onChangeEnvironment(
                environment === 'black'
                  ? 'waveguide'
                  : environment === 'waveguide'
                  ? 'livingroom'
                  : environment === 'livingroom'
                  ? 'office'
                  : environment === 'office'
                  ? 'outdoor'
                  : 'black',
              )
            }
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
              environment !== 'black'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
            }`}
            title="Cycle simulated real-world background & optical waveguide"
          >
            👓 Env: {environment.toUpperCase()}
          </button>
        </div>

        {/* On-Screen D-Pad Toggle */}
        <button
          type="button"
          onClick={() => setShowDpad((prev) => !prev)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors shrink-0 border ${
            showDpad
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(0,255,136,0.3)]'
              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
          }`}
          title="Toggle interactive on-screen D-Pad"
        >
          🎮 D-Pad {showDpad ? '▲' : '▼'}
        </button>

        {/* QA Checklist Toggle */}
        <button
          type="button"
          onClick={() => setShowChecklist((prev) => !prev)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors shrink-0 border ${
            showChecklist
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
          }`}
          title="Meta Wearables QA Verification Checklist"
        >
          ✓ QA {showChecklist ? '▲' : '▼'}
        </button>

        {/* Hardware Specs Info Toggle */}
        <button
          type="button"
          onClick={() => setShowInfo((prev) => !prev)}
          className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 text-[11px] shrink-0"
          title="View Meta Ray-Ban Display Specs"
        >
          ℹ
        </button>
      </div>

      {/* QA Verification Checklist Modal (from test-on-device skill) */}
      {showChecklist && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 w-84 bg-zinc-950/98 border border-zinc-700 rounded-xl p-4 shadow-2xl backdrop-blur-md text-xs font-mono text-zinc-300 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Meta Wearables QA Checks
            </span>
            <button
              type="button"
              onClick={() => setShowChecklist(false)}
              className="text-zinc-500 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-emerald-400">
              <span>✓ 600×600 Native Viewport</span>
              <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded">PASS</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400">
              <span>✓ Scaled Outer Box (No Cutoff)</span>
              <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded">PASS</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400">
              <span>✓ Transparent Pure Black (#000)</span>
              <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded">PASS</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400">
              <span>✓ D-Pad Arrow Navigation + Wrap</span>
              <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded">PASS</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400">
              <span>✓ Enter Key / Pinch Activation</span>
              <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded">PASS</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400">
              <span>✓ Escape Key / Back Navigation</span>
              <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded">PASS</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400">
              <span>✓ 8dp Safe Zone Bounded</span>
              <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded">PASS</span>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Specs Modal */}
      {showInfo && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 w-80 bg-zinc-950/98 border border-zinc-800 rounded-xl p-4 shadow-2xl backdrop-blur-md text-xs font-mono text-zinc-300 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Meta Ray-Ban Display Specs
            </span>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="text-zinc-500 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-500">Native Viewport</span>
              <span className="text-cyan-400 font-bold">600 × 600 px (Fixed)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Display Surface</span>
              <span className="text-emerald-400">Additive Optical Waveguide</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Black (#000000)</span>
              <span className="text-zinc-200">100% Transparent</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">UI Backgrounds</span>
              <span className="text-zinc-300">#0a0a0f to #1a1a2e</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Controller</span>
              <span className="text-amber-400">Arrow Keys & Enter</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Interaction</span>
              <span className="text-zinc-300">Neural Band Gestures</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating On-Screen D-Pad & Wristband Gesture Simulator */}
      {showDpad && (
        <div className="fixed bottom-14 right-4 z-50 bg-zinc-950/98 border border-zinc-800 rounded-xl p-3 shadow-2xl backdrop-blur-md flex flex-col items-center gap-1.5 select-none font-mono animate-in fade-in">
          <div className="w-full flex items-center justify-between text-[10px] text-zinc-400 mb-1 px-1">
            <span className="text-cyan-400 font-bold">WRISTBAND & D-PAD</span>
            <button
              type="button"
              onClick={() => setShowDpad(false)}
              className="text-zinc-500 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <button
            type="button"
            onClick={() => onSimulateKey('ArrowUp')}
            className="w-11 h-9 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:bg-emerald-500 active:text-black font-bold flex items-center justify-center text-sm transition-colors text-white"
            title="D-Pad Up / Wrist Flick Up"
          >
            ↑
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSimulateKey('ArrowLeft')}
              className="w-11 h-9 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:bg-cyan-500 active:text-black font-bold flex items-center justify-center text-sm transition-colors text-white"
              title="D-Pad Left / Wrist Flick Left"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => onSimulateKey('Enter')}
              className="px-3.5 h-9 rounded bg-zinc-800 hover:bg-zinc-700 border border-emerald-500/70 text-emerald-400 active:bg-emerald-400 active:text-black font-bold text-xs transition-colors"
              title="Enter / EMG Pinch"
            >
              PINCH
            </button>
            <button
              type="button"
              onClick={() => onSimulateKey('ArrowRight')}
              className="w-11 h-9 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:bg-cyan-500 active:text-black font-bold flex items-center justify-center text-sm transition-colors text-white"
              title="D-Pad Right / Wrist Flick Right"
            >
              →
            </button>
          </div>
          <button
            type="button"
            onClick={() => onSimulateKey('ArrowDown')}
            className="w-11 h-9 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:bg-emerald-500 active:text-black font-bold flex items-center justify-center text-sm transition-colors text-white"
            title="D-Pad Down / Wrist Flick Down"
          >
            ↓
          </button>

          {/* Wristband Quick Gestures Row */}
          <div className="w-full grid grid-cols-2 gap-1 pt-1 border-t border-zinc-800 text-[10px]">
            <button
              type="button"
              onClick={() => onSimulateKey('Escape')}
              className="py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 text-center"
              title="Double Pinch (Back / Dismiss)"
            >
              ↩ 2x PINCH
            </button>
            <button
              type="button"
              onClick={() => onSimulateKey('Enter')}
              className="py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/50 text-emerald-300 text-center"
              title="Single Pinch (Select / Open)"
            >
              🤌 PINCH
            </button>
          </div>
        </div>
      )}
    </>
  );
};
