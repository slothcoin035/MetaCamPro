import React from 'react';
import { SensorData } from '../types';

interface SensorsViewProps {
  selectedIndex: number;
  sensorData: SensorData;
  onRequestPermission: () => void;
  onCalibrate: () => void;
}

export const SensorsView: React.FC<SensorsViewProps> = ({
  selectedIndex,
  sensorData,
  onRequestPermission,
  onCalibrate,
}) => {
  const heading = sensorData.heading ?? 342;
  const tilt = sensorData.tilt ?? 0;
  const roll = sensorData.roll ?? 0;
  const gForce = sensorData.gForce ?? 1.0;

  // Cardinal direction helper
  const getCardinal = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[index];
  };

  const cardinal = getCardinal(heading);

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-4">
      {/* Visual Compass Reticle */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="text-xs font-mono text-cyan-400 tracking-wider">
            IMU ORIENTATION
          </div>
          <div className="text-3xl font-mono font-bold text-white glow-cyan mt-0.5">
            {Math.round(heading)}° {cardinal}
          </div>
          <div className="text-[11px] font-mono text-zinc-400">
            PITCH: {tilt > 0 ? `+${tilt.toFixed(0)}°` : `${tilt.toFixed(0)}°`} • ROLL: {roll.toFixed(0)}°
          </div>
        </div>

        {/* Circular Compass Dial */}
        <div className="relative w-28 h-28 rounded-full border-2 border-cyan-500/40 flex items-center justify-center bg-black">
          {/* Compass markers */}
          <span className="absolute top-1 text-[10px] font-mono font-bold text-emerald-400">N</span>
          <span className="absolute bottom-1 text-[10px] font-mono text-zinc-500">S</span>
          <span className="absolute left-1.5 text-[10px] font-mono text-zinc-500">W</span>
          <span className="absolute right-1.5 text-[10px] font-mono text-zinc-500">E</span>

          {/* Center Crosshair */}
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />

          {/* Dynamic rotating needle */}
          <div
            className="absolute w-0.5 h-10 bg-cyan-400 origin-bottom rounded-full transition-transform duration-100"
            style={{
              transform: `rotate(${heading}deg) translateY(-50%)`,
              boxShadow: '0 0 8px #00f0ff',
            }}
          />

          {/* Level indicator dot */}
          <div
            className="absolute w-2 h-2 rounded-full bg-emerald-400/80 transition-all duration-75"
            style={{
              transform: `translate(${Math.max(-20, Math.min(20, roll))}px, ${Math.max(
                -20,
                Math.min(20, tilt),
              )}px)`,
            }}
          />
        </div>
      </div>

      {/* Sensor Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3 my-2">
        <div className="border border-zinc-800 rounded-md p-2 bg-black/60">
          <div className="text-[10px] font-mono text-zinc-400">G-FORCE ACCEL</div>
          <div className="text-base font-mono font-bold text-emerald-300">
            {gForce.toFixed(2)} G
          </div>
        </div>
        <div className="border border-zinc-800 rounded-md p-2 bg-black/60">
          <div className="text-[10px] font-mono text-zinc-400">IMU STATUS</div>
          <div className="text-base font-mono font-bold text-cyan-300">
            {sensorData.permissionGranted ? 'ONLINE' : 'STANDBY'}
          </div>
        </div>
      </div>

      {/* D-Pad Focusable Actions */}
      <div className="space-y-2 mt-auto">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
          Select with [↑ / ↓], activate with [ENTER]:
        </div>

        {/* Action 0: Request IMU Permission */}
        <button
          type="button"
          onClick={onRequestPermission}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md border text-sm font-mono transition-all text-left ${
            selectedIndex === 0
              ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-black'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-xs text-zinc-500 font-mono">[1]</span>
            <span className="font-medium">
              {sensorData.permissionGranted ? 'Sensor Active' : 'Request Sensor Permission'}
            </span>
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded font-bold ${
              sensorData.permissionGranted
                ? 'bg-emerald-500 text-black shadow-[0_0_8px_#00ff88]'
                : 'bg-cyan-500 text-black shadow-[0_0_8px_#00f0ff]'
            }`}
          >
            {sensorData.permissionGranted ? 'ACTIVE' : 'ENTER'}
          </span>
        </button>

        {/* Action 1: Calibrate / Test heading */}
        <button
          type="button"
          onClick={onCalibrate}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md border text-sm font-mono transition-all text-left ${
            selectedIndex === 1
              ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-black'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-xs text-zinc-500 font-mono">[2]</span>
            <span>Simulate / Step Heading (+45°)</span>
          </span>
          <span className="text-xs text-zinc-400 font-bold">+45°</span>
        </button>
      </div>
    </div>
  );
};
