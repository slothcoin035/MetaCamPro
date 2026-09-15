import React from 'react';

interface SimulatorControlsProps {
  waveguideSimEnabled: boolean;
  onToggleWaveguideSim: () => void;
  onSimulateKey: (key: string) => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  waveguideSimEnabled,
  onToggleWaveguideSim,
  onSimulateKey,
}) => {
  return (
    <div className="hidden lg:flex flex-col gap-4 text-xs font-mono text-zinc-400 max-w-xs p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-xl backdrop-blur-sm">
      <div className="border-b border-zinc-800 pb-2">
        <div className="text-white font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Meta Ray-Ban Display
        </div>
        <div className="text-[11px] text-zinc-500 mt-0.5">
          Wearables Web App Runtime
        </div>
      </div>

      {/* Hardware Specs */}
      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-zinc-500">Display Viewport</span>
          <span className="text-cyan-400 font-bold">600 × 600 px</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Optical Type</span>
          <span className="text-emerald-400">Additive Waveguide</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Black Pixels</span>
          <span className="text-zinc-300">100% Transparent</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Input Mode</span>
          <span className="text-amber-400">D-Pad / Neural Band</span>
        </div>
      </div>

      {/* Waveguide background preview toggle */}
      <div className="pt-2 border-t border-zinc-800">
        <button
          type="button"
          onClick={onToggleWaveguideSim}
          className={`w-full py-2 px-3 rounded-md border text-xs font-semibold transition-all ${
            waveguideSimEnabled
              ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          {waveguideSimEnabled ? '👓 Waveguide Simulation: ON' : '⬛ Pure Black Display: ON'}
        </button>
        <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
          {waveguideSimEnabled
            ? 'Simulating additive transparency over real-world ambient environment.'
            : 'Exact glasses frame buffer output (#000000 black).'}
        </p>
      </div>

      {/* On-Screen D-Pad for mouse testing */}
      <div className="pt-2 border-t border-zinc-800">
        <div className="text-[11px] font-semibold text-zinc-300 mb-2 text-center">
          Interactive D-Pad / Gesture Controller
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => onSimulateKey('ArrowUp')}
            className="w-10 h-9 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:bg-emerald-500 active:text-black font-bold flex items-center justify-center text-sm"
          >
            ↑
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSimulateKey('ArrowLeft')}
              className="w-10 h-9 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:bg-cyan-500 active:text-black font-bold flex items-center justify-center text-sm"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => onSimulateKey('Enter')}
              className="px-3 h-9 rounded bg-zinc-800 hover:bg-zinc-700 border border-emerald-500/70 text-emerald-400 active:bg-emerald-400 active:text-black font-bold text-xs"
            >
              ENTER
            </button>
            <button
              type="button"
              onClick={() => onSimulateKey('ArrowRight')}
              className="w-10 h-9 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:bg-cyan-500 active:text-black font-bold flex items-center justify-center text-sm"
            >
              →
            </button>
          </div>
          <button
            type="button"
            onClick={() => onSimulateKey('ArrowDown')}
            className="w-10 h-9 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:bg-emerald-500 active:text-black font-bold flex items-center justify-center text-sm"
          >
            ↓
          </button>
        </div>
        <p className="text-[10px] text-zinc-500 text-center mt-2">
          Physical keyboard Arrow keys & Enter also work directly!
        </p>
      </div>
    </div>
  );
};
