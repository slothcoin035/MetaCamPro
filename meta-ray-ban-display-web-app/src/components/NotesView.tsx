import React from 'react';

interface NotesViewProps {
  selectedIndex: number;
  activeLineIndex: number;
  onSelectLine: (idx: number) => void;
  onAdvanceLine: () => void;
  onResetScript: () => void;
}

const SPEECH_POINTS = [
  'Welcome everyone to the Meta Wearables developer presentation.',
  'Display Web Apps render in an additive 600x600 pixel waveguide.',
  'Pure black is fully transparent, allowing real-world overlay.',
  'Neural Band gestures translate directly to Arrow keys and Enter.',
  'All interactive elements must be focusable without mouse or touch.',
];

export const NotesView: React.FC<NotesViewProps> = ({
  selectedIndex,
  activeLineIndex,
  onSelectLine,
  onAdvanceLine,
  onResetScript,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-4">
      {/* Title & Reading Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase">
            GLANCE TELEPROMPTER
          </span>
          <span className="text-xs font-mono text-emerald-400">
            CUE {activeLineIndex + 1}/{SPEECH_POINTS.length}
          </span>
        </div>

        {/* Script Cards (strictly bounded to avoid scrolling) */}
        <div className="space-y-2">
          {SPEECH_POINTS.slice(0, 3).map((line, idx) => {
            const isFocusSelected = selectedIndex === idx;
            const isCurrentCue = activeLineIndex === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectLine(idx)}
                className={`w-full text-left p-2.5 rounded-md border transition-all ${
                  isFocusSelected
                    ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
                    : 'border-zinc-800 bg-black text-zinc-300'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <span
                    className={`text-xs font-mono px-1.5 py-0.5 rounded shrink-0 ${
                      isCurrentCue
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <p
                    className={`text-sm leading-snug font-sans ${
                      isCurrentCue
                        ? 'text-white font-semibold glow-cyan'
                        : 'text-zinc-400'
                    }`}
                  >
                    {line}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompter Controls at bottom */}
      <div className="space-y-2 mt-auto">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
          Select with [↑ / ↓], advance with [ENTER]:
        </div>

        {/* Action: Next Line (Index 3) */}
        <button
          type="button"
          onClick={onAdvanceLine}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-md border text-xs font-mono transition-all text-left ${
            selectedIndex === 3
              ? 'border-emerald-400 bg-emerald-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-black'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-zinc-500">[▶]</span>
            <span>Advance Next Cue</span>
          </span>
          <span className="text-emerald-400 font-bold">NEXT [ENTER]</span>
        </button>

        {/* Action: Reset Prompter (Index 4) */}
        <button
          type="button"
          onClick={onResetScript}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-md border text-xs font-mono transition-all text-left ${
            selectedIndex === 4
              ? 'border-emerald-400 bg-emerald-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-black'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-zinc-500">[↺]</span>
            <span>Rewind to First Cue</span>
          </span>
          <span className="text-zinc-400">REWIND</span>
        </button>
      </div>
    </div>
  );
};
