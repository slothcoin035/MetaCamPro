import React from 'react';
import { SearchResultItem, InstantAnswer, TRENDING_QUERIES } from '../services/search';

export interface SearchViewProps {
  query?: string;
  selectedIndex?: number; // 0: Search input/composer, 1: Voice search, 2..N: Category pills or Results
  results?: SearchResultItem[];
  instantAnswer?: InstantAnswer;
  isLoading?: boolean;
  isSearching?: boolean;
  activeCategory?: string;
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  onOpenComposer?: () => void;
  onOpenSearchInput?: () => void;
  onVoiceSearch?: () => void;
  onSelectResult?: (item: SearchResultItem) => void;
  onOpenResult?: (item: SearchResultItem) => void;
  onTrendingSelect?: (trendingQuery: string) => void;
  onTriggerSearch?: (trendingQuery: string) => void;
  onOpenUrl?: (url: string) => void;
  onOpenWebsitePrompt?: () => void;
  trendingQueries?: string[];
  dragScrollProgress?: number; // 0 to 1 continuous drag ratio
}

export const CATEGORIES = ['ALL', 'TECH', 'WIKI', 'SCIENCE', 'QUICK FACTS'];

export const POPULAR_SITES = [
  { title: 'n8n Workflow', url: 'https://dongle036-n8n.dochelper.org/', icon: '⚡' },
  { title: 'Yahoo', url: 'https://www.yahoo.com', icon: '🟣' },
  { title: 'Google', url: 'https://www.google.com', icon: '🌐' },
  { title: 'Wikipedia', url: 'https://en.m.wikipedia.org/wiki/Ray-Ban_Meta', icon: '📖' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com', icon: '📰' },
  { title: 'Weather', url: 'https://wttr.in/?format=v2', icon: '⛅' },
  { title: 'NASA APOD', url: 'https://apod.nasa.gov/apod/astropix.html', icon: '🔭' },
  { title: 'Meta Wear', url: 'https://wearables.developer.meta.com', icon: '👓' },
];

export const SearchView: React.FC<SearchViewProps> = ({
  query = '',
  selectedIndex = 0,
  results = [],
  instantAnswer,
  isLoading = false,
  isSearching = false,
  activeCategory,
  selectedCategory,
  onSelectCategory = (_cat: string) => {},
  onOpenComposer,
  onOpenSearchInput,
  onVoiceSearch,
  onSelectResult,
  onOpenResult,
  onTrendingSelect,
  onTriggerSearch,
  onOpenUrl,
  onOpenWebsitePrompt,
  trendingQueries = TRENDING_QUERIES,
  dragScrollProgress = 0,
}) => {
  const currentCategory = activeCategory || selectedCategory || 'ALL';
  const loading = isLoading || isSearching;
  const queriesList = trendingQueries && trendingQueries.length > 0 ? trendingQueries : TRENDING_QUERIES;
  const handleOpenInput = onOpenComposer || onOpenSearchInput || (() => {});
  const handleVoiceInput = onVoiceSearch || onOpenComposer || onOpenSearchInput || (() => {});
  const handleSelectResult = onSelectResult || onOpenResult || (() => {});
  const handleTrending = onTrendingSelect || onTriggerSearch || (() => {});

  // Filter results by active category if not ALL
  const safeResults = results || [];
  const filteredResults = safeResults.filter((item) => {
    if (!item) return false;
    if (currentCategory === 'ALL') return true;
    if (currentCategory === 'TECH') return item.category === 'tech';
    if (currentCategory === 'WIKI') return item.category === 'wiki';
    if (currentCategory === 'SCIENCE') return item.category === 'wiki' || item.category === 'tech';
    if (currentCategory === 'QUICK FACTS') return item.category === 'instant';
    return true;
  });

  // Calculate visible window based on selectedIndex or dragScrollProgress
  // Navigation indices:
  // 0: Search bar
  // 1: Voice search
  // 2..6: Categories (5 items)
  // 7..N: Search Results or Trending
  const isInputSelected = selectedIndex === 0;
  const isVoiceSelected = selectedIndex === 1;
  const isCategorySelected = selectedIndex >= 2 && selectedIndex <= 6;
  const selectedCatIndex = isCategorySelected ? selectedIndex - 2 : -1;
  const selectedResultIndex = selectedIndex >= 7 ? selectedIndex - 7 : -1;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black text-white p-3 space-y-2">
      {/* Quick Website Launcher & Mode Switch Header */}
      <div className="flex items-center justify-between px-0.5 shrink-0">
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
            WEB DESTINATIONS:
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenWebsitePrompt || handleOpenInput}
          className="px-2.5 py-1 rounded-lg border border-blue-500/70 bg-blue-950/70 text-blue-200 text-[10px] font-mono font-bold flex items-center space-x-1 shadow-[0_0_10px_rgba(59,130,246,0.35)] hover:bg-blue-900 transition-all cursor-pointer"
          title="Type or paste any website URL to open"
        >
          <span>🌐</span>
          <span>ENTER WEBSITE URL ↗</span>
        </button>
      </div>

      {/* Popular Websites Strip */}
      <div className="flex items-center space-x-1.5 overflow-x-auto shrink-0 pb-0.5 scrollbar-none">
        {POPULAR_SITES.map((site) => (
          <button
            key={site.url}
            type="button"
            onClick={() => {
              if (onOpenUrl) {
                onOpenUrl(site.url);
              } else {
                window.open(site.url, '_blank');
              }
            }}
            className="px-2 py-0.5 rounded-md border border-zinc-800 bg-[#10101b] hover:border-cyan-500 hover:text-white text-zinc-300 text-[10px] font-mono shrink-0 flex items-center space-x-1 transition-all cursor-pointer"
            title={`Open ${site.title} directly`}
          >
            <span>{site.icon}</span>
            <span>{site.title}</span>
          </button>
        ))}
      </div>

      {/* Search Bar & Voice Input Row */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Search Bar (Focus Index 0) */}
        <button
          onClick={handleOpenInput}
          className={`flex-1 flex items-center justify-between px-3 py-1.5 rounded-xl text-left border transition-all ${
            isInputSelected
              ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_14px_rgba(0,212,255,0.4)]'
              : 'border-zinc-800 bg-[#0f0f18] hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center space-x-2 truncate">
            <span className="text-cyan-400 text-xs">🔍</span>
            <span
              className={`text-xs truncate font-mono ${
                query ? 'text-white font-medium' : 'text-zinc-500'
              }`}
            >
              {query || 'Search Web or type a website address...'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 shrink-0">
            {isInputSelected ? 'PINCH: TYPE' : 'TAP'}
          </span>
        </button>

        {/* Voice Search Pill (Focus Index 1) */}
        <button
          onClick={handleVoiceInput}
          className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all shrink-0 ${
            isVoiceSelected
              ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300 shadow-[0_0_12px_rgba(0,255,136,0.4)]'
              : 'border-zinc-800 bg-[#0f0f18] text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <span className="text-xs">🎙</span>
          <span className="text-[11px] font-mono font-bold">VOICE</span>
        </button>
      </div>

      {/* Category Pills Row (Focus Indices 2-6) */}
      <div className="flex items-center space-x-1.5 overflow-x-hidden shrink-0 py-0.5">
        {CATEGORIES.map((cat, idx) => {
          const isSelected = selectedCatIndex === idx;
          const isActive = currentCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider transition-all border shrink-0 ${
                isSelected
                  ? 'border-cyan-300 bg-cyan-500 text-black shadow-[0_0_10px_#00d4ff]'
                  : isActive
                  ? 'border-cyan-500/50 bg-cyan-950/80 text-cyan-300'
                  : 'border-zinc-800 bg-[#0d0d14] text-zinc-400'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Instant Answer Pill / Top Brief (If available) */}
      {instantAnswer && !loading && (
        <div className="bg-[#0b1329] border border-cyan-500/40 rounded-xl px-3 py-2 shadow-[0_0_12px_rgba(0,212,255,0.12)] shrink-0 flex items-start space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1 shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300">
              <span className="font-bold uppercase tracking-wider">
                {instantAnswer.headline}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-zinc-500">{instantAnswer.source}</span>
                <a
                  href={instantAnswer.sourceUrl || `https://www.google.com/search?q=${encodeURIComponent(instantAnswer.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-1.5 py-0.5 rounded bg-blue-600/30 border border-blue-500/50 text-blue-300 hover:bg-blue-600/50 text-[9px] font-bold flex items-center space-x-0.5"
                  title="Open search in Google Chrome"
                >
                  <span>🌐 CHROME ↗</span>
                </a>
              </div>
            </div>
            <p className="text-xs text-white line-clamp-2 mt-0.5 font-sans leading-relaxed">
              {instantAnswer.answer}
            </p>
          </div>
        </div>
      )}

      {/* Loading State Spinner */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-6">
          <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-cyan-300 tracking-wider">
            SEARCHING WEARABLE WEB...
          </span>
        </div>
      )}

      {/* Main Results or Trending List with Wristband Continuous Drag Scrubber */}
      {!loading && (
        <div className="flex-1 relative flex overflow-hidden">
          {/* Scrollable Cards Container */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {filteredResults.length > 0 ? (
              filteredResults.map((item, idx) => {
                const isSelected = selectedResultIndex === idx;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_14px_rgba(0,212,255,0.35)] translate-x-0.5'
                        : 'border-zinc-800/90 bg-[#0d0e16] hover:border-zinc-700'
                    }`}
                  >
                    {/* Top line: Category and read time */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                      <span className="text-cyan-400 font-bold uppercase truncate max-w-[180px]">
                        {item.source}
                      </span>
                      <span className="text-zinc-500">{item.readTime}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-bold text-white line-clamp-1 mb-1">
                      {item.title}
                    </h3>

                    {/* Snippet */}
                    <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed font-sans">
                      {item.snippet}
                    </p>

                    {/* Card Actions Footer */}
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-zinc-800/80">
                      <span className={isSelected ? 'text-cyan-300 font-bold' : 'text-zinc-500'}>
                        {isSelected ? 'PINCH: READER VIEW →' : 'TAP TO READ'}
                      </span>
                      <a
                        href={
                          item.sourceUrl ||
                          `https://en.m.wikipedia.org/wiki/${encodeURIComponent(item.title)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-0.5 rounded bg-blue-600/30 border border-blue-500/50 text-blue-300 hover:bg-blue-600/60 hover:text-white flex items-center space-x-1 font-bold transition-colors cursor-pointer shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                        title="Open this website in Google Chrome (new tab)"
                      >
                        <span>🌐</span>
                        <span>CHROME ↗</span>
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              /* If no query, show Glanceable Trending Queries */
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-1">
                  RECOMMENDED GLANCE SEARCHES
                </div>
                {(queriesList || []).map((tq, idx) => {
                  const isSelected = selectedResultIndex === idx;
                  return (
                    <button
                      key={tq}
                      onClick={() => handleTrending(tq)}
                      className={`w-full text-left p-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-950/50 text-white shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                          : 'border-zinc-800 bg-[#0b0c13] text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="text-emerald-400">⚡</span>
                        <span className="truncate">{tq}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 shrink-0">
                        {isSelected ? 'PINCH' : '→'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Wristband EMG Continuous Drag Scrubber on Right Edge */}
          <div className="w-4 flex flex-col items-center justify-center py-1 select-none shrink-0 border-l border-zinc-800 pl-1">
            <div className="text-[8px] font-mono text-zinc-600 mb-1">↕</div>
            <div className="flex-1 w-1 bg-zinc-800 rounded-full relative">
              <div
                className="w-2.5 h-4 -left-0.5 bg-cyan-400 rounded-full absolute shadow-[0_0_8px_#00d4ff] transition-all"
                style={{
                  top: `${Math.max(
                    0,
                    Math.min(
                      85,
                      (selectedResultIndex >= 0 && filteredResults.length > 0
                        ? selectedResultIndex / Math.max(1, filteredResults.length - 1)
                        : dragScrollProgress) * 85,
                    ),
                  )}%`,
                }}
              />
            </div>
            <div className="text-[7px] font-mono text-cyan-400 mt-1">EMG</div>
          </div>
        </div>
      )}
    </div>
  );
};

