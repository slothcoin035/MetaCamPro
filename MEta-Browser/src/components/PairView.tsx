import React, { useMemo } from 'react';
import { generateQrMatrix } from '../utils/qr';

interface PairViewProps {
  selectedIndex: number;
}

export const PairView: React.FC<PairViewProps> = ({ selectedIndex }) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://meta.com';
  // Meta Ray-Ban Display deep link structure from toolkit
  const pairingUrl = `https://wearables.developer.meta.com/connect?url=${encodeURIComponent(
    currentUrl,
  )}`;

  const matrix = useMemo(() => generateQrMatrix(pairingUrl), [pairingUrl]);

  return (
    <div className="w-full h-full flex flex-col justify-between px-5 py-3 overflow-hidden">
      {/* Title & Description */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            PAIR META DISPLAY GLASSES
          </span>
          <span className="text-[10px] font-mono text-emerald-400">QR-CODE TOOLKIT</span>
        </div>
        <p className="text-[11px] font-mono text-zinc-400 leading-snug">
          Scan with your phone camera or Meta AI app to connect this web app to your glasses.
        </p>
      </div>

      {/* QR Code Graphic (SVG) */}
      <div className="flex items-center justify-center my-2">
        <div className="p-3 bg-white rounded-xl shadow-[0_0_24px_rgba(0,212,255,0.3)] flex flex-col items-center">
          <svg
            width="170"
            height="170"
            viewBox="0 0 25 25"
            className="shape-rendering-crisp"
          >
            {matrix.map((row, r) =>
              row.map((val, c) =>
                val ? (
                  <rect
                    key={`${r}-${c}`}
                    x={c}
                    y={r}
                    width={1}
                    height={1}
                    fill="#000000"
                  />
                ) : null,
              ),
            )}
          </svg>
          <span className="text-[9px] font-mono font-bold text-black mt-1.5 uppercase tracking-wider">
            SCAN TO OPEN IN META AI
          </span>
        </div>
      </div>

      {/* Manual Steps from Meta Wearables Documentation */}
      <div className="border border-zinc-800 rounded-lg p-2 bg-[#14141f] text-[10px] font-mono text-zinc-300 space-y-1">
        <div className="text-cyan-300 font-bold">MANUAL SETUP IN META AI APP:</div>
        <div className="flex items-center gap-1 text-zinc-400">
          <span className="text-emerald-400 font-bold">1.</span>
          <span>Devices → Display Glasses Settings → Web apps</span>
        </div>
        <div className="flex items-center gap-1 text-zinc-400">
          <span className="text-emerald-400 font-bold">2.</span>
          <span>Tap "Add a web app" & enter your public HTTPS URL</span>
        </div>
      </div>

      {/* Action to copy or proceed */}
      <div className="space-y-1 mt-auto">
        <button
          type="button"
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(currentUrl);
            }
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 0
              ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500">[📋]</span>
            <span>Copy Live Web App URL</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">PRESS ENTER</span>
        </button>
      </div>
    </div>
  );
};
