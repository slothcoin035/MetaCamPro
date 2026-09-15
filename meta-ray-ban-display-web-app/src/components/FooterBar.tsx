import React from 'react';

interface FooterBarProps {
  lastKeyPressed: string | null;
}

export const FooterBar: React.FC<FooterBarProps> = ({ lastKeyPressed }) => {
  const isKey = (k: string) => lastKeyPressed === k;

  return (
    <footer className="w-full px-5 py-2.5 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-mono select-none bg-black">
      {/* Visual active keys for glasses gesture / keyboard monitoring */}
      <div className="flex items-center space-x-1.5">
        <span
          className={`px-1.5 py-0.5 rounded border text-[10px] transition-colors ${
            isKey('ArrowLeft')
              ? 'border-cyan-400 bg-cyan-400 text-black font-bold shadow-[0_0_8px_#00f0ff]'
              : 'border-zinc-800 text-zinc-400'
          }`}
        >
          ←
        </span>
        <span
          className={`px-1.5 py-0.5 rounded border text-[10px] transition-colors ${
            isKey('ArrowRight')
              ? 'border-cyan-400 bg-cyan-400 text-black font-bold shadow-[0_0_8px_#00f0ff]'
              : 'border-zinc-800 text-zinc-400'
          }`}
        >
          →
        </span>
        <span className="text-zinc-600 text-[10px]">TABS</span>

        <span className="text-zinc-700 mx-1">|</span>

        <span
          className={`px-1.5 py-0.5 rounded border text-[10px] transition-colors ${
            isKey('ArrowUp')
              ? 'border-emerald-400 bg-emerald-400 text-black font-bold shadow-[0_0_8px_#00ff88]'
              : 'border-zinc-800 text-zinc-400'
          }`}
        >
          ↑
        </span>
        <span
          className={`px-1.5 py-0.5 rounded border text-[10px] transition-colors ${
            isKey('ArrowDown')
              ? 'border-emerald-400 bg-emerald-400 text-black font-bold shadow-[0_0_8px_#00ff88]'
              : 'border-zinc-800 text-zinc-400'
          }`}
        >
          ↓
        </span>
        <span className="text-zinc-600 text-[10px]">SELECT</span>
      </div>

      {/* Enter Action */}
      <div className="flex items-center space-x-1.5">
        <span
          className={`px-2 py-0.5 rounded border text-[10px] font-bold transition-colors ${
            isKey('Enter') || isKey(' ')
              ? 'border-white bg-white text-black shadow-[0_0_10px_#ffffff]'
              : 'border-emerald-500/60 text-emerald-300'
          }`}
        >
          [ENTER]
        </span>
        <span className="text-zinc-400 text-[10px]">ACTIVATE</span>
      </div>
    </footer>
  );
};
