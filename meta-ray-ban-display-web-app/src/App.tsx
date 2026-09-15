/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HudTab, TaskItem, SensorData, LocationData } from './types';
import { HeaderBar } from './components/HeaderBar';
import { FooterBar } from './components/FooterBar';
import { GlanceView } from './components/GlanceView';
import { TimerView } from './components/TimerView';
import { TasksView } from './components/TasksView';
import { SensorsView } from './components/SensorsView';
import { NotesView } from './components/NotesView';
import { SimulatorControls } from './components/SimulatorControls';
import { playNavSound, playActivateSound } from './audio';

const TABS: HudTab[] = ['glance', 'timer', 'tasks', 'sensors', 'notes'];

const INITIAL_TASKS: TaskItem[] = [
  { id: '1', text: 'Review MRBD display constraints', done: true },
  { id: '2', text: 'Confirm 600x600px viewport lock', done: true },
  { id: '3', text: 'Test D-Pad arrow navigation', done: false },
  { id: '4', text: 'Verify additive contrast on black', done: false },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<HudTab>('glance');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [waveguideSimEnabled, setWaveguideSimEnabled] = useState<boolean>(false);

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
      nav.getBattery().then((battery) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {});
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

  // Calculate maximum item index for current tab to bound arrow key selection
  const getMaxIndexForTab = useCallback((tab: HudTab) => {
    switch (tab) {
      case 'glance':
        return 2; // 3 actions (0: Audio, 1: Location, 2: Next tab)
      case 'timer':
        return 3; // 4 actions (0: Start/Pause, 1: Reset, 2: +1m, 3: +5m)
      case 'tasks':
        return 5; // 4 task items (0-3) + Add (4) + Reset (5)
      case 'sensors':
        return 1; // 2 actions (0: Permission, 1: Calibrate)
      case 'notes':
        return 4; // 3 cue items (0-2) + Advance (3) + Rewind (4)
      default:
        return 0;
    }
  }, []);

  // Reset selectedIndex whenever the tab changes
  const switchTab = useCallback(
    (newTab: HudTab) => {
      setCurrentTab(newTab);
      setSelectedIndex(0);
      if (audioFeedback) playNavSound();
    },
    [audioFeedback],
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
          // Add quick task
          const newId = (tasks.length + 1).toString();
          setTasks((prev) => [
            ...prev,
            { id: newId, text: `Quick Task #${newId}`, done: false },
          ]);
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
          setActiveCueIndex(0);
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

  // Main Keyboard Event Listener (Arrow keys + Enter/Space)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Prevent browser default arrow scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      setLastKeyPressed(e.key);
      setTimeout(() => setLastKeyPressed(null), 300);

      const maxIdx = getMaxIndexForTab(currentTab);

      switch (e.key) {
        case 'ArrowLeft':
          navigateTab('prev');
          break;

        case 'ArrowRight':
          navigateTab('next');
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
          activateCurrentAction();
          break;

        default:
          break;
      }
    },
    [currentTab, getMaxIndexForTab, navigateTab, audioFeedback, activateCurrentAction],
  );

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

  const dateString = now.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  const currentTabIndex = TABS.indexOf(currentTab);

  return (
    <main
      className="min-h-screen w-full bg-black text-white flex items-center justify-center p-2 sm:p-6 overflow-hidden select-none"
      id="mrbd-app-root"
    >
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
        {/* The Canonical 600 x 600 Meta Ray-Ban Display Viewport */}
        <div
          id="mrbd-viewport"
          className={`relative w-[600px] h-[600px] max-w-[600px] max-h-[600px] overflow-hidden rounded-2xl flex flex-col justify-between border transition-all duration-300 ${
            waveguideSimEnabled
              ? 'border-cyan-500/40 shadow-[0_0_30px_rgba(0,240,255,0.25)] bg-cover bg-center'
              : 'border-zinc-800 shadow-2xl bg-black'
          }`}
          style={
            waveguideSimEnabled
              ? {
                  backgroundImage:
                    'radial-gradient(ellipse at center, rgba(10, 15, 25, 0.85) 0%, rgba(0, 0, 0, 0.95) 100%)',
                }
              : { backgroundColor: '#000000' }
          }
        >
          {/* Subtle waveguide optical boundary watermark */}
          <div className="absolute inset-0 pointer-events-none border border-cyan-500/10 rounded-2xl" />

          {/* Top Status & Tabs Bar */}
          <HeaderBar
            currentTab={currentTab}
            tabIndex={currentTabIndex}
            totalTabs={TABS.length}
            timeString={timeString}
            batteryLevel={batteryLevel}
          />

          {/* Active Card Body (strictly bounded, zero overflow) */}
          <section className="flex-1 flex flex-col overflow-hidden relative" id="mrbd-card-content">
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
                onAddTask={() => {
                  const newId = (tasks.length + 1).toString();
                  setTasks((prev) => [
                    ...prev,
                    { id: newId, text: `Quick Task #${newId}`, done: false },
                  ]);
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
              />
            )}
          </section>

          {/* Bottom D-Pad / Navigation Guidance */}
          <FooterBar lastKeyPressed={lastKeyPressed} />
        </div>

        {/* Desktop Companion / Testing Toolbar (helpful when previewing in browser) */}
        <SimulatorControls
          waveguideSimEnabled={waveguideSimEnabled}
          onToggleWaveguideSim={() => setWaveguideSimEnabled((prev) => !prev)}
          onSimulateKey={simulateKey}
        />
      </div>
    </main>
  );
}
