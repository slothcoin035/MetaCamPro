import React from 'react';

interface FooterBarProps {
  lastKeyPressed: string | null;
}

export const FooterBar: React.FC<FooterBarProps> = ({ lastKeyPressed }) => {
  const isKey = (k: string) => lastKeyPressed === k;

  return (
    <footer className="w-full h-10 px-4 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-mono select-none bg-[#0a0a0f] shrink-0">
      {/* Left: D-Pad Controls Indicator */}
      <div className="flex items-center space-x-1.5">
        <span
          className={`px-1.5 py-0.5 rounded border text-[10px] transition-colors ${
            isKey('ArrowLeft')
              ? 'border-cyan-400 bg-cyan-400 text-black font-bold shadow-[0_0_8px_#00f0ff]'
              : 'border-zinc-800 text-zinc-400 bg-black'
          }`}
        >
          ←
        </span>
        <span
          className={`px-1.5 py-0.5 rounded border text-[10px] transition-colors ${
            isKey('ArrowRight')
              ? 'border-cyan-400 bg-cyan-400 text-black font-bold shadow-[0_0_8px_#00f0ff]'
              : 'border-zinc-800 text-zinc-400 bg-black'
          }`}
        >
          →
        </span>
        <span className="text-zinc-500 text-[10px]">TABS</span>

        <span className="text-zinc-700 mx-1">|</span>

        <span
          className={`px-1.5 py-0.5 rounded border text-[10px] transition-colors ${
            isKey('ArrowUp')
              ? 'border-emerald-400 bg-emerald-400 text-black font-bold shadow-[0_0_8px_#00ff88]'
              : 'border-zinc-800 text-zinc-400 bg-black'
          }`}
        >
          ↑
        </span>
        <span
          className={`px-1.5 py-0.5 rounded border text-[10px] transition-colors ${
            isKey('ArrowDown')
              ? 'border-emerald-400 bg-emerald-400 text-black font-bold shadow-[0_0_8px_#00ff88]'
              : 'border-zinc-800 text-zinc-400 bg-black'
          }`}
        >
          ↓
        </span>
        <span className="text-zinc-500 text-[10px]">NAV</span>
      </div>

      {/* Right: Enter Activation & Escape Back */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <span
            className={`px-1.5 py-0.5 rounded border text-[10px] font-bold transition-colors ${
              isKey('Enter') || isKey(' ')
                ? 'border-white bg-white text-black shadow-[0_0_10px_#ffffff]'
                : 'border-emerald-500/60 text-emerald-300 bg-black'
            }`}
          >
            ENTER
          </span>
          <span className="text-zinc-400 text-[10px]">PINCH</span>
        </div>
        <span className="text-zinc-600">|</span>
        <div className="flex items-center space-x-1">
          <span
            className={`px-1 py-0.5 rounded border text-[10px] transition-colors ${
              isKey('Escape')
                ? 'border-amber-400 bg-amber-400 text-black font-bold'
                : 'border-zinc-800 text-zinc-500 bg-black'
            }`}
          >
            ESC
          </span>
          <span className="text-zinc-500 text-[10px]">BACK</span>
        </div>
      </div>
    </footer>
  );
};
