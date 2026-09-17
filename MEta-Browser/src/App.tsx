/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HudTab, TaskItem, SensorData, LocationData, GestureState } from './types';
import { HeaderBar } from './components/HeaderBar';
import { FooterBar } from './components/FooterBar';
import { GlanceView } from './components/GlanceView';
import { TimerView } from './components/TimerView';
import { TasksView } from './components/TasksView';
import { SensorsView } from './components/SensorsView';
import { NotesView } from './components/NotesView';
import { SnakeView } from './components/SnakeView';
import { PairView } from './components/PairView';
import { SearchView, CATEGORIES } from './components/SearchView';
import { SearchReaderView } from './components/SearchReaderView';
import { GesturesLabView } from './components/GesturesLabView';
import { GestureFeedbackOverlay } from './components/GestureFeedbackOverlay';
import { ComposerModal } from './components/ComposerModal';
import { WebBrowserView, POPULAR_BOOKMARKS } from './components/WebBrowserView';
import { SimulatorControls, EnvironmentType } from './components/SimulatorControls';
import { playNavSound, playActivateSound, playDragSound, playBackSound } from './audio';
import {
  executeWebSearch,
  SearchResultItem,
  InstantAnswer,
  TRENDING_QUERIES,
} from './services/search';

const TABS: HudTab[] = ['search', 'browser', 'glance', 'gestures', 'timer', 'tasks', 'sensors', 'notes', 'snake', 'pair'];

const INITIAL_TASKS: TaskItem[] = [
  { id: '1', text: 'Review MRBD display constraints', done: true },
  { id: '2', text: 'Confirm 600x600px viewport lock', done: true },
  { id: '3', text: 'Test D-Pad arrow navigation', done: true },
  { id: '4', text: 'Verify additive contrast on black', done: false },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<HudTab>('browser');
  const [tabHistory, setTabHistory] = useState<HudTab[]>(['search']);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<EnvironmentType>('waveguide');
  const [scale, setScale] = useState<number>(1);
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [composerTarget, setComposerTarget] = useState<'task' | 'note' | 'search'>('search');
  const containerRef = useRef<HTMLDivElement>(null);

  // Web Search Engine State
  const [searchQuery, setSearchQuery] = useState<string>('Meta Orion AR glasses specs');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [instantAnswer, setInstantAnswer] = useState<InstantAnswer | undefined>(undefined);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchCategory, setSearchCategory] = useState<string>('ALL');
  const [activeSearchResult, setActiveSearchResult] = useState<SearchResultItem | null>(null);
  const [readerSelectedIndex, setReaderSelectedIndex] = useState<number>(0);
  const [readerScrollOffset, setReaderScrollOffset] = useState<number>(0);
  const [dragScrollProgress, setDragScrollProgress] = useState<number>(0);

  // Web Browser State
  const [browserUrl, setBrowserUrl] = useState<string>('https://dongle036-n8n.dochelper.org/');

  // Meta Wristband Gesture State (EMG Pinch & Continuous Drag)
  const [gestureState, setGestureState] = useState<GestureState>({
    lastGesture: 'idle',
    isDragging: false,
    dragDeltaY: 0,
    dragDeltaX: 0,
    lastGestureTime: Date.now(),
  });
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  // Responsive scale observer: guarantees 600x600 HUD never clips or gets cut in half on any screen size
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      // Reserve vertical padding for bottom developer toolbar and margin
      const padX = 24;
      const padY = 80;
      const availW = Math.max(120, clientWidth - padX);
      const availH = Math.max(120, clientHeight - padY);
      const scaleX = availW / 600;
      const scaleY = availH / 600;
      // Exact 1.0 (600x600) on standard or large screens, cleanly scaled down on small viewports
      const calculatedScale = Math.min(1, scaleX, scaleY);
      setScale(Math.max(0.2, calculatedScale));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    const observer = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  // Time & Date State
  const [now, setNow] = useState<Date>(new Date());

  // Audio preference
  const [audioFeedback, setAudioFeedback] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mrbd_audio');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Battery Level
  const [batteryLevel, setBatteryLevel] = useState<number>(88);

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(300); // 5 mins
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Tasks State
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('mrbd_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // Sensors State
  const [sensorData, setSensorData] = useState<SensorData>({
    heading: null,
    tilt: null,
    roll: null,
    gForce: null,
    permissionGranted: false,
  });

  // Location State
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: null,
    longitude: null,
    accuracy: null,
    status: 'idle',
  });

  // Notes/Teleprompter State
  const [activeCueIndex, setActiveCueIndex] = useState<number>(0);

  // Real-time Clock interval
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (audioFeedback) playActivateSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, audioFeedback]);

  // Battery API check if supported
  useEffect(() => {
    type BatteryManager = {
      level: number;
      addEventListener: (type: string, listener: () => void) => void;
    };
    type NavWithBattery = Navigator & {
      getBattery?: () => Promise<BatteryManager>;
    };

    const nav = navigator as NavWithBattery;
    if (typeof nav.getBattery === 'function') {
      nav
        .getBattery()
        .then((battery) => {
          setBatteryLevel(Math.round(battery.level * 100));
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
        })
        .catch(() => {});
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mrbd_tasks', JSON.stringify(tasks));
    } catch {
      // Ignore
    }
  }, [tasks]);

  // Save audio setting
  useEffect(() => {
    try {
      localStorage.setItem('mrbd_audio', JSON.stringify(audioFeedback));
    } catch {
      // Ignore
    }
  }, [audioFeedback]);

  // Reset selectedIndex whenever the tab changes
  const switchTab = useCallback(
    (newTab: HudTab, addToHistory = true) => {
      if (addToHistory && newTab !== currentTab) {
        setTabHistory((prev) => [...prev, currentTab]);
      }
      setCurrentTab(newTab);
      setSelectedIndex(0);
      setActiveSearchResult(null);
      if (audioFeedback) playNavSound();
    },
    [audioFeedback, currentTab],
  );

  // Helper to test if a string is a domain or website URL
  const isLikelyWebsiteUrl = (q: string) => {
    const trimmed = q.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
    if (!trimmed.includes(' ') && /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed)) {
      return true;
    }
    return false;
  };

  // Real Search Execution or Direct Website Navigation
  const performSearch = useCallback(
    async (queryToSearch: string) => {
      const trimmed = queryToSearch.trim();
      if (!trimmed) return;

      // If user entered a website URL or domain, open the website directly!
      if (isLikelyWebsiteUrl(trimmed)) {
        let clean = trimmed;
        if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
          clean = `https://${clean}`;
        }
        setBrowserUrl(clean);
        switchTab('browser');
        if (audioFeedback) playActivateSound();
        return;
      }

      setIsSearching(true);
      setSearchQuery(queryToSearch);
      if (audioFeedback) playNavSound();
      try {
        const res = await executeWebSearch(queryToSearch);
        setSearchResults(res.results);
        setInstantAnswer(res.instantAnswer);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    },
    [audioFeedback, switchTab],
  );

  // Initial search load
  useEffect(() => {
    performSearch('Meta Orion AR glasses specs');
  }, [performSearch]);

  // Calculate maximum item index for current tab to bound arrow key selection
  const getMaxIndexForTab = useCallback(
    (tab: HudTab) => {
      switch (tab) {
        case 'search':
          if (activeSearchResult) return 3; // 4 actions (Open in Browser, Save Task, Save Note, Back)
          const itemsCount = searchResults.length > 0 ? searchResults.length : TRENDING_QUERIES.length;
          // 0: Search input, 1: Voice, 2-6: Categories (5), 7..: Items
          return 1 + 1 + 5 + itemsCount - 1;
        case 'browser':
          return 10; // 0: Back, 1: Fwd, 2: Reload, 3: Address, 4: Optics, 5: Popout, 6-10: Bookmarks
        case 'gestures':
          return 3; // 4 actions (0: Pinch, 1: Drag Up, 2: Drag Down, 3: Back)
        case 'glance':
          return 2; // 3 actions (0: Audio, 1: Location, 2: Next tab)
        case 'timer':
          return 3; // 4 actions (0: Start/Pause, 1: Reset, 2: +1m, 3: +5m)
        case 'tasks':
          return 5; // 4 tasks (0-3) + Composer (4) + Reset (5)
        case 'sensors':
          return 1; // 2 actions (0: Permission, 1: Calibrate)
        case 'notes':
          return 5; // 3 cues (0-2) + Advance (3) + Composer (4) + Rewind (5)
        case 'snake':
          return 0; // 1 action (0: Start/Restart)
        case 'pair':
          return 0; // 1 action (0: Copy link)
        default:
          return 0;
      }
    },
    [activeSearchResult, searchResults.length],
  );

  // Tab switching helper
  const navigateTab = useCallback(
    (direction: 'prev' | 'next') => {
      const currentIdx = TABS.indexOf(currentTab);
      let nextIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
      if (nextIdx >= TABS.length) nextIdx = 0;
      if (nextIdx < 0) nextIdx = TABS.length - 1;
      switchTab(TABS[nextIdx]);
    },
    [currentTab, switchTab],
  );

  // Escape key back navigation helper
  const handleBack = useCallback(() => {
    if (isComposerOpen) {
      setIsComposerOpen(false);
      return;
    }
    if (activeSearchResult) {
      setActiveSearchResult(null);
      setGestureState((prev) => ({
        ...prev,
        lastGesture: 'back',
        lastGestureTime: Date.now(),
      }));
      if (audioFeedback) playBackSound();
      return;
    }
    if (tabHistory.length > 0) {
      const lastTab = tabHistory[tabHistory.length - 1];
      setTabHistory((prev) => prev.slice(0, prev.length - 1));
      switchTab(lastTab, false);
    } else if (currentTab !== 'search') {
      switchTab('search', false);
    }
  }, [isComposerOpen, activeSearchResult, audioFeedback, tabHistory, currentTab, switchTab]);

  // Request IMU Sensors
  const requestSensorPermission = useCallback(() => {
    type OrientationWithPermission = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    const DOE = DeviceOrientationEvent as OrientationWithPermission;

    const startListeners = () => {
      window.addEventListener('deviceorientation', (e: DeviceOrientationEvent) => {
        setSensorData((prev) => ({
          ...prev,
          heading: e.alpha !== null ? e.alpha : prev.heading,
          tilt: e.beta !== null ? e.beta : prev.tilt,
          roll: e.gamma !== null ? e.gamma : prev.roll,
          permissionGranted: true,
        }));
      });

      window.addEventListener('devicemotion', (e: DeviceMotionEvent) => {
        if (e.accelerationIncludingGravity) {
          const { x, y, z } = e.accelerationIncludingGravity;
          if (x !== null && y !== null && z !== null) {
            const g = Math.sqrt(x * x + y * y + z * z) / 9.81;
            setSensorData((prev) => ({
              ...prev,
              gForce: g,
            }));
          }
        }
      });
      setSensorData((prev) => ({ ...prev, permissionGranted: true }));
      if (audioFeedback) playActivateSound();
    };

    if (typeof DOE !== 'undefined' && typeof DOE.requestPermission === 'function') {
      DOE.requestPermission()
        .then((state) => {
          if (state === 'granted') {
            startListeners();
          }
        })
        .catch(() => {});
    } else {
      startListeners();
    }
  }, [audioFeedback]);

  // Request Location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationData({
        latitude: null,
        longitude: null,
        accuracy: null,
        status: 'error',
        errorMessage: 'Geolocation unavailable',
      });
      return;
    }

    setLocationData((prev) => ({ ...prev, status: 'requesting' }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationData({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          status: 'available',
        });
        if (audioFeedback) playActivateSound();
      },
      (err) => {
        setLocationData({
          latitude: null,
          longitude: null,
          accuracy: null,
          status: 'denied',
          errorMessage: err.message,
        });
      },
      { timeout: 10000 },
    );
  }, [audioFeedback]);

  // Execute currently focused action in the active tab
  const activateCurrentAction = useCallback(() => {
    if (audioFeedback) playActivateSound();

    switch (currentTab) {
      case 'search':
        if (activeSearchResult) {
          if (readerSelectedIndex === 0) {
            // Open in Web Browser
            const targetUrl =
              activeSearchResult.sourceUrl ||
              `https://en.m.wikipedia.org/wiki/${encodeURIComponent(activeSearchResult.title)}`;
            setBrowserUrl(targetUrl);
            setActiveSearchResult(null);
            switchTab('browser');
          } else if (readerSelectedIndex === 1) {
            // Save to Tasks
            const newTask: TaskItem = {
              id: String(Date.now()),
              text: `Search: ${activeSearchResult.title.slice(0, 32)}`,
              done: false,
              priority: 'high',
            };
            setTasks((prev) => [newTask, ...prev]);
            setActiveSearchResult(null);
          } else if (readerSelectedIndex === 2) {
            // Save to Notes
            setActiveCueIndex(0);
            switchTab('notes');
          } else if (readerSelectedIndex === 3) {
            // Back to results
            setActiveSearchResult(null);
          }
          return;
        }

        if (selectedIndex === 0 || selectedIndex === 1) {
          // Open search composer
          setComposerTarget('search');
          setIsComposerOpen(true);
        } else if (selectedIndex >= 2 && selectedIndex <= 6) {
          // Category pill
          setSearchCategory(CATEGORIES[selectedIndex - 2]);
        } else if (selectedIndex >= 7) {
          const listIdx = selectedIndex - 7;
          if (searchResults.length > 0) {
            const item = searchResults[listIdx];
            if (item) {
              setActiveSearchResult(item);
              setReaderSelectedIndex(0);
              setReaderScrollOffset(0);
            }
          } else {
            const tq = TRENDING_QUERIES[listIdx];
            if (tq) {
              performSearch(tq);
            }
          }
        }
        break;

      case 'browser':
        if (selectedIndex === 3) {
          setComposerTarget('browser-url');
          setIsComposerOpen(true);
        } else if (selectedIndex === 5) {
          try {
            window.open(browserUrl, '_blank', 'noopener,noreferrer');
          } catch (e) {
            console.warn('Cannot open external window', e);
          }
        } else if (selectedIndex >= 6 && selectedIndex <= 10) {
          const bm = POPULAR_BOOKMARKS[selectedIndex - 6];
          if (bm) {
            setBrowserUrl(bm.url);
          }
        }
        break;

      case 'gestures':
        if (selectedIndex === 0) {
          setGestureState((prev) => ({ ...prev, lastGesture: 'pinch', lastGestureTime: Date.now() }));
          if (audioFeedback) playActivateSound();
        } else if (selectedIndex === 1) {
          setGestureState((prev) => ({ ...prev, lastGesture: 'drag-up', lastGestureTime: Date.now() }));
          if (audioFeedback) playDragSound(0.8);
        } else if (selectedIndex === 2) {
          setGestureState((prev) => ({ ...prev, lastGesture: 'drag-down', lastGestureTime: Date.now() }));
          if (audioFeedback) playDragSound(0.8);
        } else if (selectedIndex === 3) {
          setGestureState((prev) => ({ ...prev, lastGesture: 'back', lastGestureTime: Date.now() }));
          if (audioFeedback) playBackSound();
        }
        break;

      case 'glance':
        if (selectedIndex === 0) {
          setAudioFeedback((prev) => !prev);
        } else if (selectedIndex === 1) {
          requestLocation();
        } else if (selectedIndex === 2) {
          navigateTab('next');
        }
        break;

      case 'timer':
        if (selectedIndex === 0) {
          setIsTimerRunning((prev) => !prev);
        } else if (selectedIndex === 1) {
          setIsTimerRunning(false);
          setTimerSeconds(300);
        } else if (selectedIndex === 2) {
          setTimerSeconds((prev) => prev + 60);
        } else if (selectedIndex === 3) {
          setTimerSeconds((prev) => prev + 300);
        }
        break;

      case 'tasks':
        if (selectedIndex < 4) {
          // Toggle task item
          const targetTask = tasks[selectedIndex];
          if (targetTask) {
            setTasks((prev) =>
              prev.map((t, idx) => (idx === selectedIndex ? { ...t, done: !t.done } : t)),
            );
          }
        } else if (selectedIndex === 4) {
          // Open Composer
          setComposerTarget('task');
          setIsComposerOpen(true);
        } else if (selectedIndex === 5) {
          // Reset default checklist
          setTasks(INITIAL_TASKS);
        }
        break;

      case 'sensors':
        if (selectedIndex === 0) {
          requestSensorPermission();
        } else if (selectedIndex === 1) {
          // Step heading by 45 degrees
          setSensorData((prev) => ({
            ...prev,
            heading: ((prev.heading ?? 0) + 45) % 360,
          }));
        }
        break;

      case 'notes':
        if (selectedIndex <= 2) {
          setActiveCueIndex(selectedIndex);
        } else if (selectedIndex === 3) {
          setActiveCueIndex((prev) => (prev + 1) % 5);
        } else if (selectedIndex === 4) {
          setComposerTarget('note');
          setIsComposerOpen(true);
        } else if (selectedIndex === 5) {
          setActiveCueIndex(0);
        }
        break;

      case 'snake':
        // Snake view handles its own starting with Enter
        break;

      case 'pair':
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
        }
        break;
    }
  }, [
    currentTab,
    selectedIndex,
    tasks,
    audioFeedback,
    requestLocation,
    navigateTab,
    requestSensorPermission,
  ]);

  // Main Keyboard Event Listener (Arrow keys + Enter/Space + Escape)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // If modal is open, let modal handle input
      if (isComposerOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsComposerOpen(false);
        }
        return;
      }

      // Prevent browser default arrow scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      setLastKeyPressed(e.key);
      setTimeout(() => setLastKeyPressed(null), 300);

      // In snake tab, let Snake view handle arrow steering
      if (currentTab === 'snake' && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }

      // If active search reader is open, route navigation to reader
      if (currentTab === 'search' && activeSearchResult) {
        if (e.key === 'ArrowLeft') {
          if (audioFeedback) playNavSound();
          setReaderSelectedIndex((prev) => (prev > 0 ? prev - 1 : 2));
        } else if (e.key === 'ArrowRight') {
          if (audioFeedback) playNavSound();
          setReaderSelectedIndex((prev) => (prev < 2 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
          if (audioFeedback) playDragSound(0.4);
          setReaderScrollOffset((prev) => Math.max(0, prev - 60));
        } else if (e.key === 'ArrowDown') {
          if (audioFeedback) playDragSound(0.4);
          setReaderScrollOffset((prev) => prev + 60);
        } else if (e.key === 'Enter' || e.key === ' ') {
          activateCurrentAction();
        } else if (e.key === 'Escape') {
          handleBack();
        }
        return;
      }

      const maxIdx = getMaxIndexForTab(currentTab);

      switch (e.key) {
        case 'ArrowLeft':
          if (currentTab === 'search' && selectedIndex >= 2 && selectedIndex <= 6) {
            const catIdx = selectedIndex - 2;
            if (catIdx > 0) {
              setSearchCategory(CATEGORIES[catIdx - 1]);
              setSelectedIndex(selectedIndex - 1);
              if (audioFeedback) playNavSound();
            } else {
              navigateTab('prev');
            }
          } else {
            setGestureState((prev) => ({ ...prev, lastGesture: 'flick-left', lastGestureTime: Date.now() }));
            navigateTab('prev');
          }
          break;

        case 'ArrowRight':
          if (currentTab === 'search' && selectedIndex >= 2 && selectedIndex <= 6) {
            const catIdx = selectedIndex - 2;
            if (catIdx < CATEGORIES.length - 1) {
              setSearchCategory(CATEGORIES[catIdx + 1]);
              setSelectedIndex(selectedIndex + 1);
              if (audioFeedback) playNavSound();
            } else {
              navigateTab('next');
            }
          } else {
            setGestureState((prev) => ({ ...prev, lastGesture: 'flick-right', lastGestureTime: Date.now() }));
            navigateTab('next');
          }
          break;

        case 'ArrowUp':
          if (audioFeedback) playNavSound();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIdx));
          break;

        case 'ArrowDown':
          if (audioFeedback) playNavSound();
          setSelectedIndex((prev) => (prev < maxIdx ? prev + 1 : 0));
          break;

        case 'Enter':
        case ' ':
          setGestureState((prev) => ({ ...prev, lastGesture: 'pinch', lastGestureTime: Date.now() }));
          activateCurrentAction();
          break;

        case 'Escape':
          setGestureState((prev) => ({ ...prev, lastGesture: 'back', lastGestureTime: Date.now() }));
          handleBack();
          break;

        default:
          break;
      }
    },
    [
      isComposerOpen,
      currentTab,
      activeSearchResult,
      selectedIndex,
      getMaxIndexForTab,
      navigateTab,
      audioFeedback,
      activateCurrentAction,
      handleBack,
    ],
  );

  // Pointer event handlers for Continuous Wristband Drag (EMG)
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    setGestureState((prev) => ({
      ...prev,
      isDragging: true,
      dragDeltaX: 0,
      dragDeltaY: 0,
      lastGestureTime: Date.now(),
    }));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    setGestureState((prev) => ({
      ...prev,
      dragDeltaX: dx,
      dragDeltaY: dy,
    }));

    if (activeSearchResult) {
      setReaderScrollOffset((prev) => Math.max(0, prev - dy * 0.8));
      if (Math.abs(dy) > 12 && audioFeedback) {
        playDragSound(0.5);
      }
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
    } else if (currentTab === 'search') {
      if (Math.abs(dy) > 32) {
        const step = dy > 0 ? 1 : -1;
        const maxIdx = getMaxIndexForTab('search');
        setSelectedIndex((prev) => Math.max(0, Math.min(maxIdx, prev + step)));
        setGestureState((prev) => ({
          ...prev,
          lastGesture: dy > 0 ? 'drag-down' : 'drag-up',
          lastGestureTime: Date.now(),
        }));
        if (audioFeedback) playDragSound(0.6);
        pointerStartRef.current = { x: e.clientX, y: e.clientY };
      } else if (Math.abs(dx) > 50 && Math.abs(dy) < 25) {
        const catIdx = CATEGORIES.indexOf(searchCategory);
        if (dx > 0 && catIdx < CATEGORIES.length - 1) {
          setSearchCategory(CATEGORIES[catIdx + 1]);
        } else if (dx < 0 && catIdx > 0) {
          setSearchCategory(CATEGORIES[catIdx - 1]);
        }
        setGestureState((prev) => ({
          ...prev,
          lastGesture: dx > 0 ? 'flick-right' : 'flick-left',
          lastGestureTime: Date.now(),
        }));
        if (audioFeedback) playNavSound();
        pointerStartRef.current = { x: e.clientX, y: e.clientY };
      }
    }
  };

  const handlePointerUp = () => {
    pointerStartRef.current = null;
    setGestureState((prev) => ({
      ...prev,
      isDragging: false,
      dragDeltaX: 0,
      dragDeltaY: 0,
    }));
  };

  // Attach keydown listener to window
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Helper for on-screen D-pad buttons
  const simulateKey = (key: string) => {
    const event = new KeyboardEvent('keydown', { key });
    handleKeyDown(event);
  };

  // Formatted strings
  const timeString = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateString = now
    .toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase();

  const currentTabIndex = TABS.indexOf(currentTab);

  // Background style generator based on environment simulation
  const getEnvironmentStyle = () => {
    switch (environment) {
      case 'waveguide':
        return {
          backgroundImage:
            'radial-gradient(ellipse at center, rgba(16, 24, 38, 0.94) 0%, rgba(0, 0, 0, 0.98) 100%)',
        };
      case 'livingroom':
        return {
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), radial-gradient(circle at 20% 30%, #3e2723 0%, #1a1a24 100%)',
        };
      case 'office':
        return {
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.88)), radial-gradient(circle at 80% 20%, #1e3a5f 0%, #0d1117 100%)',
        };
      case 'outdoor':
        return {
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.82)), radial-gradient(circle at 50% 10%, #0369a1 0%, #022c22 100%)',
        };
      case 'black':
      default:
        return { backgroundColor: '#000000' };
    }
  };

  return (
    <main
      className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden select-none relative"
      id="mrbd-app-root"
    >
      <div
        ref={containerRef}
        className="flex-1 w-full h-full flex items-center justify-center overflow-hidden p-2 relative"
      >
        {/* Scaled Bounding Box Wrapper:
            By matching the outer wrapper's width and height to `${600 * scale}px`,
            flexbox centers the scaled geometry directly!
            This mathematically eliminates clipping or half-cut views on any window height. */}
        <div
          style={{
            width: `${Math.round(600 * scale)}px`,
            height: `${Math.round(600 * scale)}px`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {/* The Canonical 600 x 600 Meta Ray-Ban Display Viewport */}
          <div
            id="mrbd-viewport"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              width: '600px',
              height: '600px',
              minWidth: '600px',
              minHeight: '600px',
              maxWidth: '600px',
              maxHeight: '600px',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${scale})`,
              transformOrigin: 'center center',
              backgroundColor: '#000000',
              touchAction: 'none',
              ...getEnvironmentStyle(),
            }}
            className={`relative overflow-hidden rounded-2xl flex flex-col justify-between border transition-all duration-300 shadow-2xl shrink-0 ${
              environment !== 'black'
                ? 'border-cyan-500/50 shadow-[0_0_40px_rgba(0,240,255,0.25)]'
                : 'border-zinc-800'
            }`}
          >
            {/* Subtle waveguide optical boundary watermark */}
            <div className="absolute inset-0 pointer-events-none border border-cyan-500/10 rounded-2xl" />

            {/* Real-time Meta Wristband Gesture HUD Feedback Overlay */}
            <GestureFeedbackOverlay gestureState={gestureState} />

            {/* Top Status & Tabs Bar (fixed 48px) */}
            <HeaderBar
              currentTab={currentTab}
              tabIndex={currentTabIndex}
              totalTabs={TABS.length}
              timeString={timeString}
              batteryLevel={batteryLevel}
              onSwitchTab={switchTab}
            />

            {/* Active Card Body (strictly bounded to remaining 512px height, zero overflow) */}
            <section
              className="flex-1 w-full flex flex-col overflow-hidden relative"
              id="mrbd-card-content"
            >
              {/* SEARCH VIEW */}
              {currentTab === 'search' && !activeSearchResult && (
                <SearchView
                  selectedIndex={selectedIndex}
                  query={searchQuery}
                  results={searchResults}
                  instantAnswer={instantAnswer}
                  isSearching={isSearching}
                  selectedCategory={searchCategory}
                  trendingQueries={TRENDING_QUERIES}
                  onSelectCategory={(cat) => {
                    setSearchCategory(cat);
                    if (audioFeedback) playNavSound();
                  }}
                  onTriggerSearch={(q) => performSearch(q)}
                  onOpenUrl={(url) => {
                    setBrowserUrl(url);
                    switchTab('browser');
                    if (audioFeedback) playActivateSound();
                  }}
                  onOpenWebsitePrompt={() => {
                    setComposerTarget('browser-url');
                    setIsComposerOpen(true);
                  }}
                  onOpenResult={(item) => {
                    setActiveSearchResult(item);
                    setReaderSelectedIndex(0);
                    setReaderScrollOffset(0);
                    if (audioFeedback) playActivateSound();
                  }}
                  onOpenSearchInput={() => {
                    setComposerTarget('search');
                    setIsComposerOpen(true);
                  }}
                  onVoiceSearch={() => {
                    setComposerTarget('search');
                    setIsComposerOpen(true);
                  }}
                  dragScrollProgress={dragScrollProgress}
                />
              )}

              {/* SEARCH READER VIEW */}
              {currentTab === 'search' && activeSearchResult && (
                <SearchReaderView
                  result={activeSearchResult}
                  selectedIndex={readerSelectedIndex}
                  scrollOffset={readerScrollOffset}
                  onAction={(action) => {
                    if (action === 'open-browser') {
                      const targetUrl =
                        activeSearchResult.sourceUrl ||
                        `https://en.m.wikipedia.org/wiki/${encodeURIComponent(activeSearchResult.title)}`;
                      setBrowserUrl(targetUrl);
                      setActiveSearchResult(null);
                      switchTab('browser');
                      if (audioFeedback) playActivateSound();
                    } else if (action === 'back') {
                      setActiveSearchResult(null);
                      if (audioFeedback) playBackSound();
                    } else if (action === 'save-task') {
                      const newTask: TaskItem = {
                        id: String(Date.now()),
                        text: `Search: ${activeSearchResult.title.slice(0, 32)}`,
                        done: false,
                        priority: 'high',
                      };
                      setTasks((prev) => [newTask, ...prev]);
                      setActiveSearchResult(null);
                      if (audioFeedback) playActivateSound();
                    } else if (action === 'save-note') {
                      setActiveCueIndex(0);
                      switchTab('notes');
                    }
                  }}
                  onOpenBrowser={(url) => {
                    setBrowserUrl(url);
                    setActiveSearchResult(null);
                    switchTab('browser');
                    if (audioFeedback) playActivateSound();
                  }}
                  onScrollChange={(newOffset) => setReaderScrollOffset(newOffset)}
                />
              )}

              {/* WEB BROWSER VIEW */}
              {currentTab === 'browser' && (
                <WebBrowserView
                  initialUrl={browserUrl}
                  selectedIndex={selectedIndex}
                  dragScrollProgress={dragScrollProgress}
                  onOpenComposer={() => {
                    setComposerTarget('browser-url');
                    setIsComposerOpen(true);
                  }}
                  onNavigateUrl={(newUrl) => setBrowserUrl(newUrl)}
                />
              )}

              {/* GESTURES LAB VIEW */}
              {currentTab === 'gestures' && (
                <GesturesLabView
                  selectedIndex={selectedIndex}
                  gestureState={gestureState}
                  onTestGesture={(type) => {
                    if (type === 'pinch') {
                      setGestureState((prev) => ({ ...prev, lastGesture: 'pinch', lastGestureTime: Date.now() }));
                      if (audioFeedback) playActivateSound();
                    } else if (type === 'drag-up') {
                      setGestureState((prev) => ({ ...prev, lastGesture: 'drag-up', lastGestureTime: Date.now() }));
                      if (audioFeedback) playDragSound(0.8);
                    } else if (type === 'drag-down') {
                      setGestureState((prev) => ({ ...prev, lastGesture: 'drag-down', lastGestureTime: Date.now() }));
                      if (audioFeedback) playDragSound(0.8);
                    } else if (type === 'back') {
                      setGestureState((prev) => ({ ...prev, lastGesture: 'back', lastGestureTime: Date.now() }));
                      if (audioFeedback) playBackSound();
                    }
                  }}
                />
              )}

              {currentTab === 'glance' && (
                <GlanceView
                  selectedIndex={selectedIndex}
                  timeString={timeString}
                  dateString={dateString}
                  audioFeedbackEnabled={audioFeedback}
                  onToggleAudio={() => setAudioFeedback((prev) => !prev)}
                  locationData={locationData}
                  onRequestLocation={requestLocation}
                  onNextTab={() => navigateTab('next')}
                  pendingTasksCount={tasks.filter((t) => !t.done).length}
                  timerActive={isTimerRunning}
                  compassHeading={sensorData.heading}
                />
              )}

              {currentTab === 'timer' && (
                <TimerView
                  selectedIndex={selectedIndex}
                  secondsLeft={timerSeconds}
                  isRunning={isTimerRunning}
                  onToggleTimer={() => setIsTimerRunning((prev) => !prev)}
                  onResetTimer={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(300);
                  }}
                  onAddSeconds={(sec) => setTimerSeconds((prev) => prev + sec)}
                />
              )}

              {currentTab === 'tasks' && (
                <TasksView
                  selectedIndex={selectedIndex}
                  tasks={tasks}
                  onToggleTask={(id) =>
                    setTasks((prev) =>
                      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
                    )
                  }
                  onOpenComposer={() => {
                    setComposerTarget('task');
                    setIsComposerOpen(true);
                  }}
                  onResetTasks={() => setTasks(INITIAL_TASKS)}
                />
              )}

              {currentTab === 'sensors' && (
                <SensorsView
                  selectedIndex={selectedIndex}
                  sensorData={sensorData}
                  onRequestPermission={requestSensorPermission}
                  onCalibrate={() =>
                    setSensorData((prev) => ({
                      ...prev,
                      heading: ((prev.heading ?? 0) + 45) % 360,
                    }))
                  }
                />
              )}

              {currentTab === 'notes' && (
                <NotesView
                  selectedIndex={selectedIndex}
                  activeLineIndex={activeCueIndex}
                  onSelectLine={(idx) => setActiveCueIndex(idx)}
                  onAdvanceLine={() => setActiveCueIndex((prev) => (prev + 1) % 5)}
                  onResetScript={() => setActiveCueIndex(0)}
                  onOpenComposer={() => {
                    setComposerTarget('note');
                    setIsComposerOpen(true);
                  }}
                />
              )}

              {currentTab === 'snake' && (
                <SnakeView selectedIndex={selectedIndex} />
              )}

              {currentTab === 'pair' && (
                <PairView selectedIndex={selectedIndex} />
              )}

              {/* On-Glasses Voice & Handwriting Composer Simulation */}
              <ComposerModal
                isOpen={isComposerOpen}
                title={
                  composerTarget === 'browser-url'
                    ? 'Navigate Web Address (URL / Voice)'
                    : composerTarget === 'search'
                    ? 'Web Search (Voice / Handwriting)'
                    : composerTarget === 'task'
                    ? 'Add Task via Voice / Handwriting'
                    : 'Compose Teleprompter Cue'
                }
                placeholder={
                  composerTarget === 'browser-url'
                    ? 'Enter website URL (e.g., wikipedia.org, bbc.com)...'
                    : composerTarget === 'search'
                    ? 'Ask or search anything (e.g., Orion glasses specs)...'
                    : composerTarget === 'task'
                    ? 'Dictate or write task...'
                    : 'Dictate note or cue...'
                }
                isSearchMode={composerTarget === 'search'}
                isUrlMode={composerTarget === 'browser-url'}
                initialValue={composerTarget === 'browser-url' ? browserUrl : ''}
                onCommit={(newText) => {
                  if (newText.trim()) {
                    if (composerTarget === 'browser-url') {
                      let clean = newText.trim();
                      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
                        if (clean.includes('.') && !clean.includes(' ')) {
                          clean = `https://${clean}`;
                        } else if (!clean.includes(' ')) {
                          clean = `https://${clean}.com`;
                        } else {
                          clean = `https://www.google.com/search?q=${encodeURIComponent(clean)}`;
                        }
                      }
                      setBrowserUrl(clean);
                      switchTab('browser');
                    } else if (composerTarget === 'search') {
                      performSearch(newText.trim());
                    } else if (composerTarget === 'task') {
                      const newId = (tasks.length + 1).toString();
                      setTasks((prev) => [
                        ...prev,
                        { id: newId, text: newText.trim(), done: false },
                      ]);
                    }
                  }
                  setIsComposerOpen(false);
                  if (audioFeedback) playActivateSound();
                }}
                onCancel={() => setIsComposerOpen(false)}
              />
            </section>

            {/* Bottom D-Pad / Navigation Guidance (fixed 40px) */}
            <FooterBar lastKeyPressed={lastKeyPressed} />
          </div>
        </div>
      </div>

      {/* Floating Developer Toolbar & Simulator Controls */}
      <SimulatorControls
        environment={environment}
        onChangeEnvironment={(env) => setEnvironment(env)}
        onSimulateKey={simulateKey}
        scale={scale}
        browserUrl={browserUrl}
        onOpenWebsitePrompt={() => {
          setComposerTarget('browser-url');
          setIsComposerOpen(true);
        }}
      />
    </main>
  );
}
