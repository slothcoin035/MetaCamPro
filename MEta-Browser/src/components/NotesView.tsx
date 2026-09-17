import React from 'react';

interface NotesViewProps {
  selectedIndex: number;
  activeLineIndex: number;
  onSelectLine: (idx: number) => void;
  onAdvanceLine: () => void;
  onResetScript: () => void;
  onOpenComposer: () => void;
}

const SPEECH_POINTS = [
  'Welcome to the Meta Ray-Ban Display Web App suite.',
  'Rendered in a 600×600 pixel additive optical waveguide.',
  'Pure black (#000000) is fully transparent on the display.',
  'Neural Band wrist gestures map directly to Arrow keys and Enter.',
  'All interactive surfaces maintain high contrast against the real world.',
];

export const NotesView: React.FC<NotesViewProps> = ({
  selectedIndex,
  activeLineIndex,
  onSelectLine,
  onAdvanceLine,
  onResetScript,
  onOpenComposer,
}) => {
  return (
    <div className="w-full h-full flex flex-col justify-between px-5 py-3 overflow-hidden">
      {/* Title & Reading Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase">
            GLANCE TELEPROMPTER
          </span>
          <span className="text-[11px] font-mono text-emerald-400">
            CUE {activeLineIndex + 1}/{SPEECH_POINTS.length}
          </span>
        </div>

        {/* Script Cards (strictly limited to 3 items) */}
        <div className="space-y-1.5">
          {SPEECH_POINTS.slice(0, 3).map((line, idx) => {
            const isFocusSelected = selectedIndex === idx;
            const isCurrentCue = activeLineIndex === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectLine(idx)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all focusable ${
                  isFocusSelected
                    ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
                    : 'border-zinc-800 bg-[#14141f] text-zinc-300'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                      isCurrentCue
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <p
                    className={`text-xs leading-snug ${
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
      <div className="space-y-1.5 mt-auto">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">
          D-Pad [↑ / ↓], Advance [ENTER]:
        </div>

        {/* Action: Next Line (Index 3) */}
        <button
          type="button"
          onClick={onAdvanceLine}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 3
              ? 'border-emerald-400 bg-emerald-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500">[▶]</span>
            <span>Advance Next Cue</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">NEXT [ENTER]</span>
        </button>

        {/* Action: Voice/Text Note via Composer (Index 4) */}
        <button
          type="button"
          onClick={onOpenComposer}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 4
              ? 'border-emerald-400 bg-emerald-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500">[✎]</span>
            <span>Dictate / Compose Note</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-bold">COMPOSER</span>
        </button>

        {/* Action: Reset Prompter (Index 5) */}
        <button
          type="button"
          onClick={onResetScript}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 5
              ? 'border-emerald-400 bg-emerald-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500">[↺]</span>
            <span>Rewind to First Cue</span>
          </span>
          <span className="text-[10px] text-zinc-400">REWIND</span>
        </button>
      </div>
    </div>
  );
};
