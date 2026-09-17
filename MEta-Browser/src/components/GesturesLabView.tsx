import React, { useState } from 'react';
import { GestureState } from '../types';

interface GesturesLabViewProps {
  gestureState: GestureState;
  selectedIndex: number; // Focus navigation index for interactive controls
  onSimulateGesture: (type: 'pinch' | 'drag-up' | 'drag-down' | 'flick-left' | 'flick-right' | 'back') => void;
}

export const GesturesLabView: React.FC<GesturesLabViewProps> = ({
  gestureState,
  selectedIndex,
  onSimulateGesture,
}) => {
  const [sliderValue, setSliderValue] = useState(50);
  const [pinchCount, setPinchCount] = useState(0);

  const handleInteractivePinch = () => {
    setPinchCount((prev) => prev + 1);
    onSimulateGesture('pinch');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black text-white p-3 space-y-2.5">
      {/* Top Title & EMG Status */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00d4ff]" />
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            META WRISTBAND EMG LAB
          </span>
        </div>
        <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
          NEURAL LINK ACTIVE
        </div>
      </div>

      {/* Real-time Gesture Telemetry Display */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        {/* Pinch Sensor Box */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            gestureState.lastGesture === 'pinch'
              ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_16px_rgba(0,255,136,0.4)]'
              : 'border-zinc-800 bg-[#0d0e17]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>PINCH (ENTER)</span>
            <span className="text-emerald-400 font-bold">x{pinchCount}</span>
          </div>
          <div className="mt-1 flex items-center space-x-2">
            <span className="text-lg">🤌</span>
            <span className="text-xs font-bold text-white">
              {gestureState.lastGesture === 'pinch' ? 'PINCH DETECTED!' : 'Index + Thumb Tap'}
            </span>
          </div>
        </div>

        {/* Continuous EMG Drag Sensor Box */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            gestureState.isDragging
              ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_16px_rgba(0,212,255,0.4)]'
              : 'border-zinc-800 bg-[#0d0e17]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>EMG DRAG (SLIDE)</span>
            <span className="text-cyan-400 font-bold">
              {Math.round(gestureState.dragDeltaY)}px
            </span>
          </div>
          <div className="mt-1 flex items-center space-x-2">
            <span className="text-lg">↔</span>
            <span className="text-xs font-bold text-white">
              {gestureState.isDragging ? 'CONTINUOUS DRAG' : 'Slide Wrist Up/Down'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Wristband Gesture Calibration Canvas */}
      <div className="flex-1 bg-[#090b12] border border-cyan-500/20 rounded-xl p-3 flex flex-col justify-between overflow-hidden">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center justify-between">
            <span>CONTINUOUS DRAG TEST SLIDER</span>
            <span className="text-zinc-400 font-mono text-[10px]">{sliderValue}%</span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
            Drag on the slider below or swipe wrist up/down to test real-time gesture sensitivity.
          </p>

          {/* Interactive continuous slider */}
          <div className="relative py-2">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[9px] font-mono text-zinc-500 mt-1">
              <span>0% LOW</span>
              <span>50% MID</span>
              <span>100% MAX</span>
            </div>
          </div>
        </div>

        {/* Gesture Cheatsheet */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
          <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
            META WRISTBAND GESTURE GUIDE
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
            <div className="bg-black/60 p-1.5 rounded border border-zinc-800 text-zinc-300">
              <span className="text-emerald-400 font-bold">Pinch</span>: Select / Enter
            </div>
            <div className="bg-black/60 p-1.5 rounded border border-zinc-800 text-zinc-300">
              <span className="text-cyan-400 font-bold">Drag ↕</span>: Continuous Scroll
            </div>
            <div className="bg-black/60 p-1.5 rounded border border-zinc-800 text-zinc-300">
              <span className="text-cyan-300 font-bold">Flick ↔</span>: Switch Tabs/Categories
            </div>
            <div className="bg-black/60 p-1.5 rounded border border-zinc-800 text-zinc-300">
              <span className="text-amber-400 font-bold">2x Pinch</span>: Back / Dismiss
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Test Buttons */}
      <div className="grid grid-cols-4 gap-1.5 shrink-0 pt-1">
        <button
          onClick={handleInteractivePinch}
          className={`py-1.5 px-1 rounded-lg border text-[10px] font-mono font-bold transition-all text-center ${
            selectedIndex === 0
              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_#00ff88]'
              : 'border-zinc-800 bg-[#0f0f15] text-zinc-400'
          }`}
        >
          🤌 TEST PINCH
        </button>
        <button
          onClick={() => onSimulateGesture('drag-up')}
          className={`py-1.5 px-1 rounded-lg border text-[10px] font-mono font-bold transition-all text-center ${
            selectedIndex === 1
              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_#00d4ff]'
              : 'border-zinc-800 bg-[#0f0f15] text-zinc-400'
          }`}
        >
          ↑ DRAG UP
        </button>
        <button
          onClick={() => onSimulateGesture('drag-down')}
          className={`py-1.5 px-1 rounded-lg border text-[10px] font-mono font-bold transition-all text-center ${
            selectedIndex === 2
              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_#00d4ff]'
              : 'border-zinc-800 bg-[#0f0f15] text-zinc-400'
          }`}
        >
          ↓ DRAG DOWN
        </button>
        <button
          onClick={() => onSimulateGesture('back')}
          className={`py-1.5 px-1 rounded-lg border text-[10px] font-mono font-bold transition-all text-center ${
            selectedIndex === 3
              ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_10px_#ffaa00]'
              : 'border-zinc-800 bg-[#0f0f15] text-zinc-400'
          }`}
        >
          ↩ 2x PINCH
        </button>
      </div>
    </div>
  );
};
