import React, { useRef, useEffect } from 'react';
import { SearchResultItem } from '../services/search';

export interface SearchReaderViewProps {
  result: SearchResultItem;
  selectedIndex?: number; // 0: Open Website, 1: Save to Tasks, 2: Save Note, 3: Back
  scrollOffset?: number; // controlled by Wristband EMG drag
  onAction?: (action: 'open-browser' | 'save-task' | 'save-note' | 'back') => void;
  onScrollChange?: (newOffset: number) => void;
  onOpenBrowser?: (url: string) => void;
  onSaveToTasks?: (item: SearchResultItem) => void;
  onSaveToNotes?: (item: SearchResultItem) => void;
  onBack?: () => void;
}

export const SearchReaderView: React.FC<SearchReaderViewProps> = ({
  result,
  selectedIndex = 0,
  scrollOffset = 0,
  onAction,
  onScrollChange,
  onOpenBrowser,
  onSaveToTasks,
  onSaveToNotes,
  onBack,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const websiteUrl = result.sourceUrl || `https://en.m.wikipedia.org/wiki/${encodeURIComponent(result.title)}`;

  const handleOpenBrowser = () => {
    if (onAction) onAction('open-browser');
    else if (onOpenBrowser) onOpenBrowser(websiteUrl);
  };

  const handleSaveTask = () => {
    if (onAction) onAction('save-task');
    else if (onSaveToTasks) onSaveToTasks(result);
  };

  const handleSaveNote = () => {
    if (onAction) onAction('save-note');
    else if (onSaveToNotes) onSaveToNotes(result);
  };

  const handleGoBack = () => {
    if (onAction) onAction('back');
    else if (onBack) onBack();
  };

  // Synchronize continuous wristband drag scrolling
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollOffset;
    }
  }, [scrollOffset]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black text-white p-4">
      {/* Top HUD Metadata Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 shrink-0">
        <div className="flex items-center space-x-2 truncate">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 uppercase">
            {result.category}
          </span>
          <span className="text-xs font-mono text-zinc-400 truncate">
            {result.source}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400 shrink-0">
          <span>⏱ {result.readTime}</span>
        </div>
      </div>

      {/* Main Content Area - Optical Waveguide Friendly */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Title */}
        <h1 className="text-lg font-bold tracking-tight text-white leading-snug">
          {result.title}
        </h1>

        {/* High-Signal Glance Bullet Points */}
        {result.bulletPoints && result.bulletPoints.length > 0 && (
          <div className="bg-[#0f1422] border border-cyan-500/30 rounded-xl p-3 space-y-1.5 shadow-[0_0_12px_rgba(0,212,255,0.08)]">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>KEY GLANCE TAKEAWAYS</span>
            </div>
            <ul className="space-y-1 text-xs text-zinc-200">
              {result.bulletPoints.map((bp, i) => (
                <li key={i} className="flex items-start space-x-1.5 leading-relaxed">
                  <span className="text-cyan-400 shrink-0 font-bold">•</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full Text / Narrative Brief */}
        <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-sans border-l-2 border-zinc-800 pl-3">
          {result.fullText || result.snippet}
        </div>

        {result.sourceUrl && (
          <div className="text-[10px] font-mono text-zinc-500 pt-1 flex items-center justify-between bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-800/80">
            <span className="truncate max-w-[300px]">
              Source: <span className="text-zinc-400">{result.sourceUrl}</span>
            </span>
            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-0.5 rounded bg-blue-600/30 border border-blue-500/60 text-blue-300 hover:bg-blue-600/50 hover:text-white text-[10px] font-bold shrink-0 flex items-center space-x-1 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
            >
              <span>🌐 CHROME</span>
              <span>↗</span>
            </a>
          </div>
        )}
      </div>

      {/* Bottom Action Bar for Wristband Pinch Activation */}
      <div className="pt-2 border-t border-zinc-800 shrink-0 flex items-center justify-between gap-1.5">
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenBrowser}
          className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-mono font-bold border transition-all text-center truncate flex items-center justify-center space-x-1 cursor-pointer ${
            selectedIndex === 0
              ? 'border-blue-400 bg-blue-900/60 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.5)]'
              : 'border-blue-500/30 bg-blue-950/30 text-blue-300 hover:border-blue-400'
          }`}
        >
          <span>🌐</span>
          <span>{selectedIndex === 0 ? 'OPEN IN CHROME ↗' : 'CHROME ↗'}</span>
        </a>

        <button
          onClick={handleSaveTask}
          className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-mono font-bold border transition-all text-center truncate ${
            selectedIndex === 1
              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-[0_0_12px_rgba(0,255,136,0.4)]'
              : 'border-zinc-800 bg-[#0f0f15] text-zinc-400 hover:border-zinc-700'
          }`}
        >
          {selectedIndex === 1 ? '✓ TASK' : '+ TASK'}
        </button>

        <button
          onClick={handleSaveNote}
          className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-mono font-bold border transition-all text-center truncate ${
            selectedIndex === 2
              ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200 shadow-[0_0_12px_rgba(129,140,248,0.4)]'
              : 'border-zinc-800 bg-[#0f0f15] text-zinc-400 hover:border-zinc-700'
          }`}
        >
          {selectedIndex === 2 ? '✓ NOTE' : '+ NOTE'}
        </button>

        <button
          onClick={handleGoBack}
          className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all text-center shrink-0 ${
            selectedIndex === 3
              ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_12px_rgba(255,170,0,0.4)]'
              : 'border-zinc-800 bg-[#0f0f15] text-zinc-400 hover:border-zinc-700'
          }`}
        >
          ↩ BACK
        </button>
      </div>
    </div>
  );
};
