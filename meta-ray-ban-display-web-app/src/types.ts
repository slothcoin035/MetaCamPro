export type HudTab = 'glance' | 'timer' | 'tasks' | 'sensors' | 'notes';

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
