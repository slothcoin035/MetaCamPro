import React, { useState, useEffect, useRef } from 'react';

interface ComposerModalProps {
  isOpen: boolean;
  title: string;
  initialValue?: string;
  placeholder?: string;
  isSearchMode?: boolean;
  isUrlMode?: boolean;
  onCommit: (text: string) => void;
  onCancel: () => void;
}

export const ComposerModal: React.FC<ComposerModalProps> = ({
  isOpen,
  title,
  initialValue = '',
  placeholder = 'Tap to speak or type query...',
  isSearchMode = false,
  isUrlMode = false,
  onCommit,
  onCancel,
}) => {
  const [text, setText] = useState<string>(initialValue);
  const [mode, setMode] = useState<'voice' | 'handwriting'>('voice');
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialValue);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialValue]);

  // Voice dictation simulation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isDictating) {
      const phrases = isUrlMode
        ? [
            'en.m.wikipedia.org',
            'news.ycombinator.com',
            'wearables.developer.meta.com',
            'wttr.in',
          ]
        : isSearchMode
        ? [
            'Meta Orion AR specs',
            'EMG wristband neural signal',
            'James Webb telescope deep field',
            'Quantum computing coherence',
          ]
        : [
            'Checking smart glasses status',
            'Review display safe margin',
            'Calibrate IMU heading',
            'Confirm 600x600 fit',
          ];
      let step = 0;
      interval = setInterval(() => {
        if (step < phrases.length) {
          setText(phrases[step]);
          step++;
        } else {
          setIsDictating(false);
        }
      }, 900);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDictating, isSearchMode, isUrlMode]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col justify-between p-5 text-white font-mono animate-in fade-in duration-200">
      {/* Composer Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold text-xs text-cyan-300 uppercase tracking-wider">
            {title}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setMode('voice')}
            className={`px-2 py-0.5 rounded text-[10px] ${
              mode === 'voice' ? 'bg-cyan-500 text-black font-bold' : 'text-zinc-400'
            }`}
          >
            VOICE
          </button>
          <button
            type="button"
            onClick={() => setMode('handwriting')}
            className={`px-2 py-0.5 rounded text-[10px] ${
              mode === 'handwriting' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400'
            }`}
          >
            HANDWRITING
          </button>
        </div>
      </div>

      {/* Input Box with On-Device Hints */}
      <div className="my-auto space-y-3">
        <div className="text-[11px] text-zinc-400">
          {mode === 'voice'
            ? 'Neural Band Voice Dictation Active:'
            : 'Temple Swipe Handwriting Recognition:'}
        </div>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onCommit(text);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
              }
            }}
            placeholder={placeholder}
            className="w-full px-3.5 py-3 rounded-lg bg-[#14141f] border-2 border-cyan-400 text-white font-mono text-sm focus:outline-none focus:shadow-[0_0_16px_rgba(0,212,255,0.4)]"
          />
        </div>

        {/* Quick Voice Simulation Buttons */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setIsDictating((prev) => !prev)}
            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
              isDictating
                ? 'bg-red-500 text-white border-red-400 animate-pulse'
                : 'bg-[#1a1a2e] text-cyan-300 border-cyan-500/40'
            }`}
          >
            {isDictating ? '🎙️ LISTENING...' : '🎙️ SIMULATE VOICE'}
          </button>
          <button
            type="button"
            onClick={() => setText('google.com')}
            className="px-2 py-1 rounded text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white truncate"
          >
            "google.com"
          </button>
          <button
            type="button"
            onClick={() =>
              setText(
                isUrlMode
                  ? 'en.m.wikipedia.org'
                  : isSearchMode
                  ? 'Meta Orion AR glasses specs'
                  : 'Review HUD contrast'
              )
            }
            className="px-2 py-1 rounded text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white truncate max-w-[170px]"
          >
            "{isUrlMode ? 'wikipedia.org' : isSearchMode ? 'Meta Orion AR specs' : 'Review HUD contrast'}"
          </button>
          <button
            type="button"
            onClick={() =>
              setText(
                isUrlMode
                  ? 'news.ycombinator.com'
                  : isSearchMode
                  ? 'How does EMG wristband work'
                  : 'Confirm 600x600 fit'
              )
            }
            className="px-2 py-1 rounded text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white truncate max-w-[170px]"
          >
            "{isUrlMode ? 'news.ycombinator.com' : isSearchMode ? 'EMG wristband' : 'Confirm 600x600 fit'}"
          </button>
        </div>
      </div>

      {/* Composer Action Controls */}
      <div className="flex items-center space-x-2 pt-2 border-t border-zinc-800">
        <button
          type="button"
          onClick={() => onCommit(text)}
          className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-black font-bold text-xs shadow-[0_0_10px_#00ff88] hover:bg-emerald-400 transition-colors"
        >
          {isUrlMode ||
          (text.trim().includes('.') && !text.trim().includes(' ')) ||
          text.trim().startsWith('http://') ||
          text.trim().startsWith('https://')
            ? '🌐 OPEN WEBSITE [ENTER]'
            : isSearchMode
            ? '🔍 SEARCH WEB [ENTER]'
            : 'COMMIT TO APP [ENTER]'}
        </button>

        {(isUrlMode || isSearchMode) && text.trim() && (
          <a
            href={
              isUrlMode
                ? text.trim().startsWith('http://') || text.trim().startsWith('https://')
                  ? text.trim()
                  : text.trim().includes('.') && !text.trim().includes(' ')
                  ? `https://${text.trim()}`
                  : `https://www.google.com/search?q=${encodeURIComponent(text.trim())}`
                : `https://www.google.com/search?q=${encodeURIComponent(text.trim())}`
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onCancel()}
            className="px-3 py-2.5 rounded-lg bg-blue-600/40 border border-blue-500/80 text-blue-200 font-bold text-xs flex items-center space-x-1 hover:bg-blue-600/70 shadow-[0_0_12px_rgba(59,130,246,0.4)] cursor-pointer shrink-0"
            title="Open directly in Google Chrome (new tab)"
          >
            <span>🌐</span>
            <span>CHROME ↗</span>
          </a>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 text-xs hover:text-white transition-colors"
        >
          CANCEL [ESC]
        </button>
      </div>
    </div>
  );
};
