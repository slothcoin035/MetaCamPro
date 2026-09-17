import React, { useState, useEffect, useRef } from 'react';

export interface WebBrowserViewProps {
  initialUrl?: string;
  selectedIndex?: number;
  dragScrollProgress?: number; // 0 to 1 continuous wristband drag
  onOpenComposer?: (initialUrl: string) => void;
  onNavigateUrl?: (newUrl: string) => void;
}

export interface Bookmark {
  title: string;
  url: string;
  icon: string;
}

export interface ApodData {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
}

const DEFAULT_APOD: ApodData = {
  title: 'A Treasure Chest in the Carina Nebula',
  date: '2026-09-17',
  explanation:
    "This treasure chest is full of stars. The featured image was obtained with NASA's James Webb Space Telescope and shows a dust pillar in the Carina Nebula inside our Galaxy, roughly 7500 light-years away. It is formed by interstellar gas and dust, and shaped by powerful stellar winds and radiation from neighboring stars like Eta Carinae. Astronomers estimate that there are about 70 stars in a compact cluster inside the pillar.",
  url: 'https://apod.nasa.gov/apod/image/2609/JWST_Treasure_Chest_800.jpg',
  hdurl: 'https://apod.nasa.gov/apod/image/2609/JWST_Treasure_Chest.jpg',
  media_type: 'image',
  copyright: 'ESA/Webb, NASA & CSA, M. Reiter',
};

const FRAME_RESTRICTED_DOMAINS = [
  'dochelper.org',
  'n8n.cloud',
  'n8n.io',
  'yahoo.com',
  'yahoo.net',
  'search.yahoo.com',
  'finance.yahoo.com',
  'news.yahoo.com',
  'google.com',
  'google.co',
  'youtube.com',
  'youtu.be',
  'github.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'reddit.com',
  'amazon.com',
  'netflix.com',
  'apple.com',
  'microsoft.com',
  'bing.com',
  'cnn.com',
  'bbc.com',
  'bbc.co.uk',
  'nytimes.com',
  'washingtonpost.com',
  'linkedin.com',
  'twitch.tv',
  'tiktok.com',
  'quora.com',
  'medium.com',
  'ebay.com',
  'chatgpt.com',
  'openai.com',
  'apod.nasa.gov',
  'science.nasa.gov',
];

export const POPULAR_BOOKMARKS: Bookmark[] = [
  { title: 'N8N FLOW', url: 'https://dongle036-n8n.dochelper.org/', icon: '⚡' },
  { title: 'YAHOO', url: 'https://www.yahoo.com', icon: '🟣' },
  { title: 'GOOGLE', url: 'https://www.google.com', icon: '🌐' },
  { title: 'WIKI', url: 'https://en.m.wikipedia.org/wiki/Ray-Ban_Meta', icon: '📖' },
  { title: 'HN NEWS', url: 'https://news.ycombinator.com', icon: '📰' },
  { title: 'WEATHER', url: 'https://wttr.in/?format=v2', icon: '⛅' },
  { title: 'NASA APOD', url: 'https://apod.nasa.gov/apod/astropix.html', icon: '🔭' },
  { title: 'META WEAR', url: 'https://wearables.developer.meta.com', icon: '👓' },
];

export interface YahooNewsItem {
  id: string;
  category: string;
  headline: string;
  snippet: string;
  source: string;
  timeAgo: string;
  url: string;
}

export const YAHOO_BREAKING_NEWS: YahooNewsItem[] = [
  {
    id: 'yn-1',
    category: 'TECH & WEARABLES',
    headline: 'Meta Orion Holographic Glasses & Neural Wristband Reveal Spatial Future',
    snippet: 'Electromyography wristband senses motor intent with micro-pinches, powering lightweight 70-degree FOV augmented reality displays.',
    source: 'Yahoo Tech',
    timeAgo: '12m ago',
    url: 'https://tech.yahoo.com',
  },
  {
    id: 'yn-2',
    category: 'MARKETS & FINANCE',
    headline: 'Global Stocks Rally as AI Data Center and Semiconductor Spending Surges',
    snippet: 'Major market indexes advance as high-performance compute investments and cloud infrastructure expand across tech leaders.',
    source: 'Yahoo Finance',
    timeAgo: '28m ago',
    url: 'https://finance.yahoo.com',
  },
  {
    id: 'yn-3',
    category: 'SCIENCE & SPACE',
    headline: 'James Webb Telescope Captures Star Cluster In Stellar Nursery 7,500 Light Years Away',
    snippet: 'Infrared imaging penetrates cosmic dust pillars to identify dozens of newly ignited proto-stars within the Carina complex.',
    source: 'Yahoo News Science',
    timeAgo: '1h ago',
    url: 'https://news.yahoo.com',
  },
  {
    id: 'yn-4',
    category: 'ENERGY & MOBILITY',
    headline: 'Next-Gen Solid-State Batteries Achieve 600-Mile Range in Real-World Road Trials',
    snippet: 'Automakers prepare pilot manufacturing lines for ceramic electrolyte chemistry providing 10-minute fast recharge capability.',
    source: 'Yahoo Autos',
    timeAgo: '2h ago',
    url: 'https://autos.yahoo.com',
  },
];

export const YAHOO_MARKET_TICKERS = [
  { symbol: 'S&P 500', value: '5,914.80', change: '+28.15', pct: '+0.48%', positive: true },
  { symbol: 'NASDAQ', value: '18,985.40', change: '+154.20', pct: '+0.82%', positive: true },
  { symbol: 'DOW JONES', value: '43,485.60', change: '+135.90', pct: '+0.31%', positive: true },
  { symbol: 'META', value: '$588.40', change: '+$7.25', pct: '+1.25%', positive: true },
  { symbol: 'NVDA', value: '$128.90', change: '+$2.65', pct: '+2.10%', positive: true },
  { symbol: 'AAPL', value: '$232.15', change: '+$1.38', pct: '+0.60%', positive: true },
  { symbol: 'BTC-USD', value: '$68,420', change: '+$1,605', pct: '+2.40%', positive: true },
];

export const WebBrowserView: React.FC<WebBrowserViewProps> = ({
  initialUrl = 'https://dongle036-n8n.dochelper.org/',
  selectedIndex = 3, // Default focus on Address Bar
  dragScrollProgress = 0,
  onOpenComposer,
  onNavigateUrl,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpticsDark, setIsOpticsDark] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'live' | 'reader' | 'apod'>('live');
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [bypassFrameNotice, setBypassFrameNotice] = useState<boolean>(false);
  const [apodData, setApodData] = useState<ApodData>(DEFAULT_APOD);
  const [isApodLoading, setIsApodLoading] = useState<boolean>(false);
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [inlineUrlText, setInlineUrlText] = useState<string>(initialUrl);
  const [yahooSubTab, setYahooSubTab] = useState<'news' | 'finance' | 'search'>('news');
  const [yahooSearchQuery, setYahooSearchQuery] = useState<string>('');
  const [n8nSubTab, setN8nSubTab] = useState<'hub' | 'quickLinks' | 'webhookTest' | 'setupGuide'>('hub');
  const [webhookPayload, setWebhookPayload] = useState<string>('{\n  "source": "meta_wearable_glasses",\n  "gesture": "emg_index_pinch",\n  "confidence": 0.98,\n  "action": "trigger_workflow"\n}');
  const [webhookUrlInput, setWebhookUrlInput] = useState<string>('https://dongle036-n8n.dochelper.org/webhook-test/wearable-event');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [isSendingWebhook, setIsSendingWebhook] = useState<boolean>(false);
  
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync inline URL with currentUrl
  useEffect(() => {
    setInlineUrlText(currentUrl);
  }, [currentUrl]);

  // Check if current URL is NASA APOD or Yahoo or n8n or other frame-restricted site
  const isApodUrl =
    currentUrl.toLowerCase().includes('apod.nasa.gov') ||
    currentUrl.toLowerCase().includes('science.nasa.gov/apod');

  const isYahooUrl =
    currentUrl.toLowerCase().includes('yahoo.com') ||
    currentUrl.toLowerCase().includes('yahoo.net') ||
    currentUrl.toLowerCase().includes('search.yahoo') ||
    currentUrl.toLowerCase().includes('finance.yahoo');

  const isN8nUrl =
    currentUrl.toLowerCase().includes('n8n') ||
    currentUrl.toLowerCase().includes('dochelper.org');

  const isRestrictedSite = FRAME_RESTRICTED_DOMAINS.some((d) =>
    currentUrl.toLowerCase().includes(d),
  );

  // Fetch live NASA APOD data when navigating to APOD
  useEffect(() => {
    if (isApodUrl) {
      setIsApodLoading(true);
      fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
        .then((res) => {
          if (!res.ok) throw new Error('APOD fetch failed');
          return res.json();
        })
        .then((data: ApodData) => {
          if (data && data.title) {
            setApodData(data);
          }
        })
        .catch((err) => {
          console.warn('Using local fallback APOD data', err);
          setApodData(DEFAULT_APOD);
        })
        .finally(() => {
          setIsApodLoading(false);
        });
    }
  }, [currentUrl, isApodUrl]);

  // Sync when initialUrl prop changes
  useEffect(() => {
    if (initialUrl && initialUrl !== currentUrl) {
      loadUrl(initialUrl);
    }
  }, [initialUrl]);

  // Handle URL navigation
  const loadUrl = (urlToLoad: string) => {
    let cleanUrl = urlToLoad.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      if (cleanUrl.includes('.') && !cleanUrl.includes(' ')) {
        cleanUrl = `https://${cleanUrl}`;
      } else {
        // Search query
        cleanUrl = `https://en.m.wikipedia.org/w/index.php?search=${encodeURIComponent(cleanUrl)}`;
      }
    }

    setIsLoading(true);
    setIframeError(false);
    setBypassFrameNotice(false);
    setCurrentUrl(cleanUrl);

    // Update history
    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, cleanUrl];
    });
    setHistoryIndex((prev) => prev + 1);

    if (onNavigateUrl) {
      onNavigateUrl(cleanUrl);
    }

    // Auto-clear loading after timeout or load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCurrentUrl(history[prevIdx]);
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1200);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCurrentUrl(history[nextIdx]);
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1200);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeError(false);
    if (iframeRef.current) {
      try {
        iframeRef.current.src = currentUrl;
      } catch {
        // Ignore cross-origin error
      }
    }
    setTimeout(() => setIsLoading(false), 1400);
  };

  const handleOpenExternal = () => {
    try {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('Cannot open window in current context', e);
    }
  };

  // Continuous Wristband Drag Scrolling
  useEffect(() => {
    if (contentContainerRef.current) {
      const { scrollHeight, clientHeight } = contentContainerRef.current;
      const maxScroll = Math.max(0, scrollHeight - clientHeight);
      contentContainerRef.current.scrollTop = dragScrollProgress * maxScroll;
    }
  }, [dragScrollProgress]);

  // Derive domain label
  let domain = currentUrl;
  try {
    const parsed = new URL(currentUrl);
    domain = parsed.hostname.replace('www.', '');
  } catch {
    // fallback
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#050508] text-white font-mono overflow-hidden select-none">
      {/* 1. Browser Navigation & URL Bar (600px width layout) */}
      <div className="px-3 pt-2 pb-1.5 border-b border-zinc-800/80 bg-[#0c0c14] shrink-0 space-y-1.5">
        <div className="flex items-center space-x-1.5">
          {/* Back Button [Index 0] */}
          <button
            onClick={handleBack}
            disabled={historyIndex === 0}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
              selectedIndex === 0
                ? 'border-cyan-400 bg-cyan-950/70 text-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.4)]'
                : historyIndex === 0
                ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700'
            }`}
            title="History Back"
          >
            ←
          </button>

          {/* Forward Button [Index 1] */}
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
              selectedIndex === 1
                ? 'border-cyan-400 bg-cyan-950/70 text-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.4)]'
                : historyIndex >= history.length - 1
                ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700'
            }`}
            title="History Forward"
          >
            →
          </button>

          {/* Reload Button [Index 2] */}
          <button
            onClick={handleReload}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
              selectedIndex === 2
                ? 'border-cyan-400 bg-cyan-950/70 text-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.4)]'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700'
            }`}
            title="Reload Page"
          >
            {isLoading ? <span className="animate-spin text-xs">⟳</span> : '↻'}
          </button>

          {/* Address Bar [Index 3] - Inline Input & URL Navigation */}
          {isEditingUrl ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadUrl(inlineUrlText);
                setIsEditingUrl(false);
              }}
              className="flex-1 h-7 flex items-center space-x-1"
            >
              <input
                type="text"
                value={inlineUrlText}
                onChange={(e) => setInlineUrlText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsEditingUrl(false);
                    setInlineUrlText(currentUrl);
                  }
                }}
                autoFocus
                placeholder="Type website address (e.g., google.com)..."
                className="flex-1 h-7 px-2 rounded-lg bg-black border border-cyan-400 text-white font-mono text-[11px] focus:outline-none"
              />
              <button
                type="submit"
                className="h-7 px-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-[10px] rounded-lg cursor-pointer shrink-0"
              >
                GO ➔
              </button>
              <button
                type="button"
                onClick={() => setIsEditingUrl(false)}
                className="h-7 px-1.5 bg-zinc-800 text-zinc-400 text-[10px] rounded-lg cursor-pointer shrink-0"
              >
                ✕
              </button>
            </form>
          ) : (
            <div
              className={`flex-1 h-7 px-2 rounded-lg border flex items-center justify-between text-xs font-mono transition-all overflow-hidden ${
                selectedIndex === 3
                  ? 'border-cyan-400 bg-cyan-950/60 text-white shadow-[0_0_12px_rgba(0,212,255,0.4)] ring-1 ring-cyan-400'
                  : 'border-zinc-800 bg-[#12121c] text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsEditingUrl(true)}
                className="flex items-center space-x-1.5 truncate flex-1 text-left cursor-text"
                title="Click to type a website URL"
              >
                <span className="text-[11px] text-emerald-400">🔒</span>
                <span className="text-zinc-500 text-[10px]">https://</span>
                <span className="font-semibold text-cyan-200 truncate">{domain}</span>
              </button>
              <div className="flex items-center space-x-1 shrink-0 ml-1">
                <button
                  type="button"
                  onClick={() => setIsEditingUrl(true)}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                >
                  TYPE URL
                </button>
                {onOpenComposer && (
                  <button
                    type="button"
                    onClick={() => onOpenComposer(currentUrl)}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 cursor-pointer"
                    title="Voice / Handwriting dictation"
                  >
                    🎙
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Optics Mode Toggle [Index 4] */}
          <button
            onClick={() => setIsOpticsDark((prev) => !prev)}
            className={`px-2 h-7 rounded-lg border flex items-center space-x-1 text-[10px] transition-all shrink-0 ${
              selectedIndex === 4
                ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300 shadow-[0_0_10px_rgba(0,255,136,0.4)]'
                : isOpticsDark
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-400'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
            }`}
            title="Glasses Hologram Dark Filter"
          >
            <span>🌓</span>
            <span>{isOpticsDark ? 'HUD DARK' : 'NORMAL'}</span>
          </button>

          {/* Open in Google Chrome / External Browser [Index 5] */}
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenExternal}
            className={`px-2 h-7 rounded-lg border flex items-center space-x-1 text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
              selectedIndex === 5
                ? 'border-blue-400 bg-blue-900/80 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.6)] ring-1 ring-blue-400'
                : 'border-blue-500/50 bg-blue-950/60 text-blue-300 hover:bg-blue-900/50 hover:border-blue-400'
            }`}
            title="Open in Google Chrome (new tab)"
          >
            <span>🌐</span>
            <span>CHROME</span>
            <span>↗</span>
          </a>
        </div>

        {/* Quick Bookmarks Bar [Indices 6 to 10] */}
        <div className="flex items-center space-x-1.5 overflow-x-hidden pt-0.5">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest shrink-0">
            FAST WEAR:
          </span>
          {POPULAR_BOOKMARKS.map((bm, bIdx) => {
            const isSelected = selectedIndex === 6 + bIdx;
            const isCurrent = currentUrl.includes(bm.url.replace('https://', '').split('/')[0]);
            return (
              <button
                key={bm.title}
                onClick={() => loadUrl(bm.url)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all truncate flex items-center space-x-1 ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950 text-cyan-300 shadow-[0_0_8px_rgba(0,212,255,0.4)] font-bold'
                    : isCurrent
                    ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                    : 'border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{bm.icon}</span>
                <span>{bm.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Bar */}
      {isLoading && (
        <div className="w-full h-0.5 bg-cyan-950 overflow-hidden shrink-0">
          <div className="w-full h-full bg-cyan-400 animate-pulse" />
        </div>
      )}

      {/* 2. Main Web Viewport Area (Strictly sized for HUD) */}
      <div
        ref={contentContainerRef}
        className="flex-1 w-full overflow-y-auto relative bg-black flex flex-col"
      >
        {/* SPECIAL CASE: NASA Astronomy Picture of the Day Native HUD Viewer */}
        {isApodUrl && viewMode !== 'reader' && !bypassFrameNotice && (
          <div className="flex-1 w-full p-3 space-y-2.5 overflow-y-auto font-mono text-xs">
            {/* Header Telemetry */}
            <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/30">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-bold text-cyan-300 uppercase tracking-wide">
                  🔭 NASA APOD • {apodData.date}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-zinc-500">OPTICS:</span>
                <button
                  onClick={() => setIsOpticsDark((prev) => !prev)}
                  className={`px-1.5 py-0.5 rounded text-[10px] border ${
                    isOpticsDark
                      ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {isOpticsDark ? 'HUD FILTER' : 'RGB COLOR'}
                </button>
              </div>
            </div>

            {/* Title & Metadata */}
            <div>
              <h1 className="text-sm font-bold text-white leading-tight font-sans">
                {apodData.title}
              </h1>
              {apodData.copyright && (
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Credit: {apodData.copyright.replace(/\n/g, ' ')}
                </p>
              )}
            </div>

            {/* Astronomy Image Stage */}
            <div className="relative w-full rounded-xl overflow-hidden border border-cyan-500/40 bg-zinc-950 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
              {isApodLoading ? (
                <div className="h-44 flex flex-col items-center justify-center space-y-2 text-cyan-400">
                  <span className="animate-spin text-lg">⟳</span>
                  <span className="text-[11px]">Connecting to NASA Deep Space Network...</span>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={apodData.url}
                    alt={apodData.title}
                    referrerPolicy="no-referrer"
                    className={`w-full max-h-52 object-cover object-center transition-all ${
                      isOpticsDark
                        ? 'brightness-95 contrast-125'
                        : 'brightness-100 contrast-100'
                    }`}
                  />
                  <div className="absolute bottom-2 right-2 flex space-x-1">
                    {apodData.hdurl && (
                      <a
                        href={apodData.hdurl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-cyan-500/50 text-cyan-300 text-[10px] font-bold hover:bg-cyan-950 flex items-center space-x-1"
                        title="View Full High-Definition Telescope Image in Google Chrome"
                      >
                        <span>HD ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Explanation Narrative */}
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                ASTRONOMICAL EXPLANATION:
              </span>
              <p className="text-[11px] leading-relaxed text-zinc-300 font-sans">
                {apodData.explanation}
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-1 flex flex-col gap-1.5">
              <div className="flex gap-2">
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-lg border border-blue-400 bg-blue-900/70 text-blue-200 text-xs font-mono font-bold text-center flex items-center justify-center space-x-1.5 shadow-[0_0_12px_rgba(59,130,246,0.6)] hover:bg-blue-800 cursor-pointer"
                >
                  <span>🌐</span>
                  <span>OPEN ON APOD.NASA.GOV IN CHROME ↗</span>
                </a>
              </div>

              <div className="flex gap-1.5 text-[10px]">
                <button
                  onClick={() => setBypassFrameNotice(true)}
                  className="flex-1 py-1.5 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white text-center"
                >
                  TRY RAW IFRAME
                </button>
                <button
                  onClick={() => setViewMode('reader')}
                  className="flex-1 py-1.5 rounded border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40 text-center"
                >
                  READER SUMMARY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SPECIAL CASE: Yahoo! HUD Wearable Portal (Breaking News, Finance & Search) */}
        {!isApodUrl && isYahooUrl && !bypassFrameNotice && viewMode === 'live' && (
          <div className="flex-1 w-full p-3 space-y-2.5 overflow-y-auto font-mono text-xs">
            {/* Header Telemetry */}
            <div className="flex items-center justify-between pb-1.5 border-b border-purple-500/30">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span className="font-bold text-purple-300 uppercase tracking-wide flex items-center space-x-1">
                  <span>🟣</span>
                  <span>YAHOO! HUD WEARABLE PORTAL</span>
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-zinc-400 font-sans">LIVE FEED</span>
              </div>
            </div>

            {/* Why www.yahoo.com refused to connect - Educational & Action Banner */}
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)] space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-base leading-none">🔒</span>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white font-mono">
                    Why "www.yahoo.com refused to connect" in iframe:
                  </div>
                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                    Yahoo enforces strict browser security (<span className="text-purple-300 font-mono">X-Frame-Options: SAMEORIGIN</span> and <span className="text-purple-300 font-mono">CSP frame-ancestors</span>) to prevent clickjacking and protect your private login session.
                  </p>
                </div>
              </div>

              {/* 1-Click Open in Chrome Button */}
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOpenExternal}
                className="w-full py-2.5 px-3 rounded-lg border border-purple-400 bg-purple-600 text-white font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-[0_0_12px_rgba(168,85,247,0.5)] hover:bg-purple-500 transition-all cursor-pointer"
              >
                <span>🌐</span>
                <span>OPEN FULL YAHOO.COM IN GOOGLE CHROME (NEW TAB) ↗</span>
              </a>
            </div>

            {/* Sub-Tabs: News vs Finance vs Search */}
            <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setYahooSubTab('news')}
                className={`flex-1 py-1 px-2 rounded text-[11px] font-mono font-bold transition-all flex items-center justify-center space-x-1 ${
                  yahooSubTab === 'news'
                    ? 'bg-purple-900/70 border border-purple-400 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>📰</span>
                <span>YAHOO NEWS</span>
              </button>
              <button
                onClick={() => setYahooSubTab('finance')}
                className={`flex-1 py-1 px-2 rounded text-[11px] font-mono font-bold transition-all flex items-center justify-center space-x-1 ${
                  yahooSubTab === 'finance'
                    ? 'bg-emerald-950/70 border border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(0,255,136,0.4)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>📈</span>
                <span>FINANCE TICKERS</span>
              </button>
              <button
                onClick={() => setYahooSubTab('search')}
                className={`flex-1 py-1 px-2 rounded text-[11px] font-mono font-bold transition-all flex items-center justify-center space-x-1 ${
                  yahooSubTab === 'search'
                    ? 'bg-cyan-950/70 border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,212,255,0.4)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🔍</span>
                <span>SEARCH</span>
              </button>
            </div>

            {/* Sub-Tab 1: Breaking News */}
            {yahooSubTab === 'news' && (
              <div className="space-y-2">
                <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                  <span>CURATED YAHOO BREAKING HEADLINES:</span>
                  <span className="text-purple-400">SYNCED LIVE</span>
                </div>
                <div className="space-y-2">
                  {YAHOO_BREAKING_NEWS.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-purple-500/50 transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold">
                          {item.category}
                        </span>
                        <span className="text-zinc-500">{item.timeAgo}</span>
                      </div>
                      <h3 className="text-xs font-bold text-white font-sans leading-snug">
                        {item.headline}
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                        {item.snippet}
                      </p>
                      <div className="pt-1 flex justify-end">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-purple-400 hover:underline flex items-center space-x-1"
                        >
                          <span>Read on {item.source}</span>
                          <span>↗</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Yahoo Finance */}
            {yahooSubTab === 'finance' && (
              <div className="space-y-2">
                <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                  <span>YAHOO FINANCE MARKET GLANCE:</span>
                  <a
                    href="https://finance.yahoo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline text-[10px]"
                  >
                    Open Finance in Chrome ↗
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {YAHOO_MARKET_TICKERS.map((t) => (
                    <div
                      key={t.symbol}
                      className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col space-y-0.5"
                    >
                      <span className="text-[10px] text-zinc-400 font-bold">{t.symbol}</span>
                      <span className="text-xs font-mono font-bold text-white">{t.value}</span>
                      <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
                        <span>▲</span>
                        <span>{t.change}</span>
                        <span>({t.pct})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Yahoo Search */}
            {yahooSubTab === 'search' && (
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-[10px] text-zinc-400 font-mono">SEARCH WITH YAHOO:</span>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (yahooSearchQuery.trim()) {
                      window.open(
                        `https://search.yahoo.com/search?p=${encodeURIComponent(yahooSearchQuery.trim())}`,
                        '_blank',
                        'noopener,noreferrer'
                      );
                    }
                  }}
                  className="space-y-2"
                >
                  <input
                    type="text"
                    value={yahooSearchQuery}
                    onChange={(e) => setYahooSearchQuery(e.target.value)}
                    placeholder="Search Yahoo (e.g. AI glasses, stock quotes...)"
                    className="w-full px-3 py-2 rounded-lg bg-black border border-zinc-700 text-xs text-white placeholder-zinc-500 font-sans focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs flex items-center justify-center space-x-1"
                  >
                    <span>SEARCH YAHOO! IN CHROME</span>
                    <span>↗</span>
                  </button>
                </form>
              </div>
            )}

            {/* Bottom Alternatives */}
            <div className="pt-2 flex gap-1.5 text-[10px]">
              <button
                onClick={() => setBypassFrameNotice(true)}
                className="flex-1 py-1.5 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white text-center"
              >
                ATTEMPT RAW IFRAME
              </button>
              <button
                onClick={() => setViewMode('reader')}
                className="flex-1 py-1.5 rounded border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40 text-center"
              >
                HUD READER MODE
              </button>
            </div>
          </div>
        )}

        {/* SPECIAL CASE: n8n Workflow Automation Wearable Portal */}
        {!isApodUrl && isN8nUrl && !bypassFrameNotice && viewMode === 'live' && (
          <div className="flex-1 w-full p-3 space-y-2.5 overflow-y-auto font-mono text-xs">
            {/* Header Telemetry */}
            <div className="flex items-center justify-between pb-1.5 border-b border-orange-500/30">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                <span className="font-bold text-orange-400 uppercase tracking-wide flex items-center space-x-1">
                  <span>⚡</span>
                  <span>N8N WORKFLOW AUTOMATION HUB</span>
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>ONLINE (HTTP 200)</span>
              </div>
            </div>

            {/* Why n8n refused to connect - Educational & Action Banner */}
            <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.25)] space-y-2.5">
              <div className="flex items-start space-x-2">
                <span className="text-lg leading-none">🔒</span>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white font-mono">
                    Why "dongle036-n8n.dochelper.org refused to connect" in iframe:
                  </div>
                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                    By default, n8n activates <span className="text-orange-300 font-mono">UI Security (X-Frame-Options & strict CSP)</span> to protect workflow credentials and API tokens against clickjacking. Web browsers enforce this by blocking iframe embedding unless explicitly permitted on your server.
                  </p>
                </div>
              </div>

              {/* 1-Click Open in Chrome Button */}
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOpenExternal}
                className="w-full py-2.5 px-3 rounded-lg border border-orange-400 bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all cursor-pointer"
              >
                <span>⚡</span>
                <span>OPEN FULL N8N WORKFLOW IN GOOGLE CHROME (NEW TAB) ↗</span>
              </a>
            </div>

            {/* Sub-Tabs: Hubs vs Webhook Tester vs Embed Setup */}
            <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[11px]">
              <button
                onClick={() => setN8nSubTab('hub')}
                className={`flex-1 py-1 px-2 rounded font-mono font-bold transition-all flex items-center justify-center space-x-1 ${
                  n8nSubTab === 'hub'
                    ? 'bg-orange-950/80 border border-orange-400 text-orange-300 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>⚡</span>
                <span>WORKFLOW HUBS</span>
              </button>
              <button
                onClick={() => setN8nSubTab('webhookTest')}
                className={`flex-1 py-1 px-2 rounded font-mono font-bold transition-all flex items-center justify-center space-x-1 ${
                  n8nSubTab === 'webhookTest'
                    ? 'bg-emerald-950/80 border border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(0,255,136,0.4)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>📡</span>
                <span>WEBHOOK TESTER</span>
              </button>
              <button
                onClick={() => setN8nSubTab('setupGuide')}
                className={`flex-1 py-1 px-2 rounded font-mono font-bold transition-all flex items-center justify-center space-x-1 ${
                  n8nSubTab === 'setupGuide'
                    ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,212,255,0.4)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>⚙️</span>
                <span>IFRAME GUIDE</span>
              </button>
            </div>

            {/* Tab 1: Workflow Hubs & Direct Navigation */}
            {n8nSubTab === 'hub' && (
              <div className="space-y-2">
                <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                  <span>DIRECT N8N ROUTES (OPENS IN CHROME):</span>
                  <span className="text-orange-400 font-bold">1-TAP JUMP</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://dongle036-n8n.dochelper.org/workflows"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-orange-500/60 transition-all flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                      <span>📋</span>
                      <span>All Workflows</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans">
                      View, edit & trigger active workflow automations.
                    </span>
                    <span className="text-[9px] text-orange-400 font-mono pt-1">Open /workflows ↗</span>
                  </a>

                  <a
                    href="https://dongle036-n8n.dochelper.org/executions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-orange-500/60 transition-all flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                      <span>⏱️</span>
                      <span>Executions</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans">
                      Inspect past runs, logs, payloads, and node errors.
                    </span>
                    <span className="text-[9px] text-orange-400 font-mono pt-1">Open /executions ↗</span>
                  </a>

                  <a
                    href="https://dongle036-n8n.dochelper.org/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-orange-500/60 transition-all flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                      <span>⚙️</span>
                      <span>Settings</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans">
                      Configure instance environment, variables & users.
                    </span>
                    <span className="text-[9px] text-orange-400 font-mono pt-1">Open /settings ↗</span>
                  </a>

                  <a
                    href="https://dongle036-n8n.dochelper.org/templates"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-orange-500/60 transition-all flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                      <span>🧩</span>
                      <span>Templates</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans">
                      Browse community templates and prebuilt automations.
                    </span>
                    <span className="text-[9px] text-orange-400 font-mono pt-1">Open /templates ↗</span>
                  </a>
                </div>
              </div>
            )}

            {/* Tab 2: Wearable Webhook Tester */}
            {n8nSubTab === 'webhookTest' && (
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>DISPATCH WEARABLE EVENT TO N8N WEBHOOK:</span>
                  <span className="text-emerald-400">POST TEST</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-mono">Webhook URL Endpoint:</label>
                  <input
                    type="text"
                    value={webhookUrlInput}
                    onChange={(e) => setWebhookUrlInput(e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-black border border-zinc-700 text-xs text-zinc-200 font-mono focus:outline-none focus:border-orange-400"
                    placeholder="https://dongle036-n8n.dochelper.org/webhook/..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-mono">JSON Payload:</label>
                  <textarea
                    rows={4}
                    value={webhookPayload}
                    onChange={(e) => setWebhookPayload(e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-black border border-zinc-700 text-xs text-emerald-400 font-mono focus:outline-none focus:border-orange-400 resize-none"
                  />
                </div>

                <button
                  disabled={isSendingWebhook}
                  onClick={async () => {
                    setIsSendingWebhook(true);
                    setWebhookStatus('Sending payload to n8n webhook...');
                    try {
                      const res = await fetch(webhookUrlInput, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: webhookPayload,
                      });
                      if (res.ok) {
                        const data = await res.text();
                        setWebhookStatus(`✅ Received HTTP ${res.status}: ${data.slice(0, 80) || 'Webhook successfully received!'}`);
                      } else {
                        setWebhookStatus(`⚠️ HTTP ${res.status} (${res.statusText}). Create a Webhook node in n8n listening to this path.`);
                      }
                    } catch (err: any) {
                      setWebhookStatus(`⚠️ Note: Cross-origin or network trigger: ${err.message}. Open n8n in Chrome to test test-webhook.`);
                    } finally {
                      setIsSendingWebhook(false);
                    }
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono font-bold text-xs flex items-center justify-center space-x-1.5"
                >
                  <span>{isSendingWebhook ? '⏳ SENDING...' : '🚀 DISPATCH WEARABLE EVENT TO N8N'}</span>
                </button>

                {webhookStatus && (
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-300">
                    {webhookStatus}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Iframe Embed Setup Guide */}
            {n8nSubTab === 'setupGuide' && (
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="text-[11px] font-bold text-orange-400 font-mono">
                  HOW TO ENABLE IFRAME EMBEDDING IN N8N:
                </div>
                <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                  If you own this self-hosted n8n instance and want to embed the live workflow canvas directly inside this HUD simulator or any dashboard without "refused to connect", configure this single environment variable:
                </p>

                <div className="p-2 rounded bg-black border border-zinc-700 text-xs font-mono text-amber-300">
                  <code>N8N_DISABLE_UI_SECURITY=true</code>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-400 font-mono font-bold">In docker-compose.yml:</div>
                  <pre className="p-2 rounded bg-black/80 border border-zinc-800 text-[10px] font-mono text-zinc-300 overflow-x-auto">
{`environment:
  - N8N_DISABLE_UI_SECURITY=true
  - WEBHOOK_URL=https://dongle036-n8n.dochelper.org/`}
                  </pre>
                </div>

                <p className="text-[10px] text-zinc-400 font-sans">
                  Once restarted with this flag, n8n removes the <code className="text-orange-300">X-Frame-Options: SAMEORIGIN</code> header, allowing full embedded canvas access!
                </p>
              </div>
            )}

            {/* Bottom Alternatives */}
            <div className="pt-2 flex gap-1.5 text-[10px]">
              <button
                onClick={() => setBypassFrameNotice(true)}
                className="flex-1 py-1.5 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white text-center"
              >
                ATTEMPT RAW IFRAME
              </button>
              <button
                onClick={() => setViewMode('reader')}
                className="flex-1 py-1.5 rounded border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40 text-center"
              >
                HUD READER MODE
              </button>
            </div>
          </div>
        )}

        {/* GENERAL FRAME RESTRICTION NOTICE (For domains with X-Frame-Options like Google, Twitter, GitHub) */}
        {!isApodUrl && !isYahooUrl && !isN8nUrl && isRestrictedSite && !bypassFrameNotice && viewMode === 'live' && (
          <div className="flex-1 p-4 flex flex-col justify-center items-center text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/60 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              🔒
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Security Restriction (X-Frame-Options)
              </h2>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                <span className="text-cyan-300 font-semibold">{domain}</span> blocks direct
                embedding inside wearable frames (<span className="text-zinc-300 font-mono">X-Frame-Options: SAMEORIGIN</span>) to protect account credentials.
              </p>
            </div>

            <div className="w-full pt-2 flex flex-col gap-2">
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOpenExternal}
                className="w-full py-2.5 px-4 rounded-xl border border-blue-400 bg-blue-600 text-white text-xs font-mono font-bold text-center flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(59,130,246,0.6)] hover:bg-blue-500 cursor-pointer"
              >
                <span>🌐</span>
                <span>OPEN IN GOOGLE CHROME (NEW TAB) ↗</span>
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('reader')}
                  className="flex-1 py-1.5 px-3 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-xs font-mono hover:bg-cyan-900/50"
                >
                  📖 HUD READER MODE
                </button>
                <button
                  onClick={() => setBypassFrameNotice(true)}
                  className="flex-1 py-1.5 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-mono hover:text-zinc-200"
                >
                  ATTEMPT IFRAME
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live iFrame Mode */}
        {viewMode === 'live' && (!isApodUrl || bypassFrameNotice) && ((!isRestrictedSite && !isYahooUrl && !isN8nUrl) || bypassFrameNotice) && (
          <div className="flex-1 w-full h-full relative flex flex-col min-h-0">
            {/* Top helper notification for iframe loading */}
            <div className="px-3 py-1.5 bg-zinc-950/90 border-b border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="truncate">If page shows "refused to connect", the website blocks iframes.</span>
              </div>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOpenExternal}
                className="ml-2 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] shrink-0 flex items-center space-x-1"
                title="Open directly in Google Chrome"
              >
                <span>OPEN IN CHROME</span>
                <span>↗</span>
              </a>
            </div>

            {iframeError && (
              <div className="p-3 bg-red-950/40 border-b border-red-500/40 text-red-300 text-[11px] font-mono flex items-center justify-between">
                <span>⚠️ Site blocked embedding (X-Frame-Options).</span>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold"
                >
                  OPEN IN CHROME ↗
                </a>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={currentUrl}
              title="HUD Web Browser"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
              onError={() => setIframeError(true)}
              className={`w-full h-full flex-1 border-0 transition-all ${
                isOpticsDark
                  ? 'filter invert hue-rotate-180 brightness-90 contrast-125 bg-black'
                  : 'bg-white'
              }`}
              style={{
                minHeight: '380px',
                pointerEvents: 'auto',
              }}
            />

            {/* In-HUD Smart Fallback Bar */}
            <div className="px-3 py-1.5 bg-[#0a0a10] border-t border-zinc-800 flex items-center justify-between text-[10px] shrink-0 font-mono">
              <div className="flex items-center space-x-2 text-zinc-400 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="truncate">URL: {currentUrl}</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setViewMode('reader')}
                  className="text-cyan-400 hover:underline"
                >
                  📖 READER MODE
                </button>
                <span className="text-zinc-600">|</span>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleOpenExternal}
                  className="px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/50 hover:bg-blue-600/50 hover:text-white flex items-center space-x-1 font-bold cursor-pointer"
                >
                  <span>🌐 OPEN IN CHROME</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Reader Mode (Optimized High-Contrast Text for Glasses Optical Waveguide) */}
        {viewMode === 'reader' && (
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-bold text-cyan-300 uppercase">
                📖 HUD WAVEGUIDE READER
              </span>
              <button
                onClick={() => setViewMode('live')}
                className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 hover:text-white"
              >
                ← BACK TO LIVE WEB
              </button>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-zinc-300 font-sans">
              <div className="text-sm font-bold font-mono text-emerald-300">
                {domain.toUpperCase()}
              </div>
              <div className="text-[11px] font-mono text-zinc-500">
                Active URL: {currentUrl}
              </div>
              <div className="p-3 rounded-xl border border-cyan-500/20 bg-cyan-950/20 font-mono text-xs text-cyan-200">
                Holographic display reader mode renders high-contrast clean typography directly into the glasses field-of-view without eye fatigue.
              </div>
              <p>
                You can smoothly navigate, scroll, or open external companion web tabs at any time. Wristband continuous drag gestures control page scrolling in real time.
              </p>
            </div>

            <div className="pt-3 flex gap-2">
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOpenExternal}
                className="flex-1 py-2 rounded-lg border border-blue-400 bg-blue-900/60 text-blue-200 text-xs font-mono font-bold text-center flex items-center justify-center space-x-1.5 shadow-[0_0_12px_rgba(59,130,246,0.5)] hover:bg-blue-800/80 cursor-pointer"
              >
                <span>🌐</span>
                <span>OPEN IN GOOGLE CHROME ↗</span>
              </a>
              <button
                onClick={() => onOpenComposer && onOpenComposer(currentUrl)}
                className="flex-1 py-2 rounded-lg border border-cyan-400 bg-cyan-950/40 text-cyan-300 text-xs font-mono font-bold text-center"
              >
                ENTER NEW URL 🌐
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Wristband Gesture Tips */}
      <div className="px-3 py-1 bg-[#09090f] border-t border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between shrink-0 font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-cyan-400">DRAG ↕</span>
          <span>SCROLL</span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400">PINCH</span>
          <span>OPEN</span>
        </div>
        <div className="flex items-center space-x-1.5 text-zinc-500">
          <span>FLICK ↔: HISTORY</span>
        </div>
      </div>
    </div>
  );
};
