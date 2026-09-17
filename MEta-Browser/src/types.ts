export type HudTab = 'search' | 'browser' | 'glance' | 'gestures' | 'timer' | 'tasks' | 'sensors' | 'notes' | 'snake' | 'pair';

export interface GestureState {
  lastGesture: 'idle' | 'pinch' | 'drag-up' | 'drag-down' | 'flick-left' | 'flick-right' | 'back';
  isDragging: boolean;
  dragDeltaY: number;
  dragDeltaX: number;
  lastGestureTime: number;
}

export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
  priority?: 'high' | 'normal';
}

export interface SensorData {
  heading: number | null; // alpha (0-360)
  tilt: number | null; // beta (-180 to 180)
  roll: number | null; // gamma (-90 to 90)
  gForce: number | null;
  permissionGranted: boolean;
}

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  status: 'idle' | 'requesting' | 'available' | 'denied' | 'error';
  errorMessage?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface HighScoreItem {
  name: string;
  score: number;
  date: string;
}
