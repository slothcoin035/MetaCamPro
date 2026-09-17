import React, { useEffect, useState } from 'react';
import { GestureState } from '../types';

interface GestureFeedbackOverlayProps {
  gestureState: GestureState;
}

export const GestureFeedbackOverlay: React.FC<GestureFeedbackOverlayProps> = ({ gestureState }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (gestureState.lastGesture !== 'idle') {
      setVisible(true);
      const timer = setTimeout(() => {
        if (!gestureState.isDragging) {
          setVisible(false);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [gestureState.lastGesture, gestureState.lastGestureTime, gestureState.isDragging]);

  if (!visible && !gestureState.isDragging) return null;

  return (
    <div className="absolute top-14 right-4 z-40 pointer-events-none transition-all duration-150 flex items-center space-x-1.5 bg-black/90 border border-cyan-500/40 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(0,212,255,0.3)]">
      {gestureState.lastGesture === 'pinch' && (
        <>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-mono font-bold text-emerald-300">
            EMG PINCH
          </span>
        </>
      )}

      {gestureState.isDragging && (
        <>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-cyan-300">
            DRAG {gestureState.dragDeltaY > 0 ? '↓' : '↑'} {Math.abs(Math.round(gestureState.dragDeltaY))}px
          </span>
        </>
      )}

      {gestureState.lastGesture === 'flick-left' && (
        <span className="text-[10px] font-mono font-bold text-cyan-300 flex items-center space-x-1">
          <span>←</span>
          <span>WRIST FLICK LEFT</span>
        </span>
      )}

      {gestureState.lastGesture === 'flick-right' && (
        <span className="text-[10px] font-mono font-bold text-cyan-300 flex items-center space-x-1">
          <span>WRIST FLICK RIGHT</span>
          <span>→</span>
        </span>
      )}

      {gestureState.lastGesture === 'back' && (
        <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center space-x-1">
          <span>↩</span>
          <span>DOUBLE PINCH (BACK)</span>
        </span>
      )}
    </div>
  );
};
