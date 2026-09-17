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

  // Cardinal direction calculation
  const getCardinal = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[index];
  };

  const cardinal = getCardinal(heading);

  return (
    <div className="w-full h-full flex flex-col justify-between px-5 py-3 overflow-hidden">
      {/* Visual Compass Reticle & Artificial Horizon */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="text-xs font-mono text-cyan-400 tracking-wider">
            IMU ORIENTATION
          </div>
          <div className="text-2xl font-mono font-bold text-white glow-cyan mt-0.5">
            {Math.round(heading)}° {cardinal}
          </div>
          <div className="text-[10px] font-mono text-zinc-400">
            PITCH: {tilt > 0 ? `+${tilt.toFixed(0)}°` : `${tilt.toFixed(0)}°`} • ROLL: {roll.toFixed(0)}°
          </div>
        </div>

        {/* Circular Compass Dial */}
        <div className="relative w-20 h-20 rounded-full border border-cyan-500/40 flex items-center justify-center bg-[#000000]">
          {/* Compass markers */}
          <span className="absolute top-0.5 text-[9px] font-mono font-bold text-emerald-400">N</span>
          <span className="absolute bottom-0.5 text-[9px] font-mono text-zinc-500">S</span>
          <span className="absolute left-1 text-[9px] font-mono text-zinc-500">W</span>
          <span className="absolute right-1 text-[9px] font-mono text-zinc-500">E</span>

          {/* Center Crosshair */}
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />

          {/* Dynamic rotating needle */}
          <div
            className="absolute w-0.5 h-8 bg-cyan-400 origin-bottom rounded-full transition-transform duration-100"
            style={{
              transform: `rotate(${heading}deg) translateY(-50%)`,
              boxShadow: '0 0 8px #00f0ff',
            }}
          />

          {/* Level indicator dot */}
          <div
            className="absolute w-2 h-2 rounded-full bg-emerald-400/80 transition-all duration-75"
            style={{
              transform: `translate(${Math.max(-16, Math.min(16, roll))}px, ${Math.max(
                -16,
                Math.min(16, tilt),
              )}px)`,
            }}
          />
        </div>
      </div>

      {/* Sensor Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2.5 my-1.5">
        <div className="border border-zinc-800 rounded-lg p-2 bg-[#14141f]">
          <div className="text-[10px] font-mono text-zinc-400">G-FORCE ACCEL</div>
          <div className="text-sm font-mono font-bold text-emerald-300">
            {gForce.toFixed(2)} G
          </div>
        </div>
        <div className="border border-zinc-800 rounded-lg p-2 bg-[#14141f]">
          <div className="text-[10px] font-mono text-zinc-400">IMU STATUS</div>
          <div className="text-sm font-mono font-bold text-cyan-300">
            {sensorData.permissionGranted ? 'ONLINE' : 'STANDBY'}
          </div>
        </div>
      </div>

      {/* D-Pad Focusable Actions */}
      <div className="space-y-1.5 mt-auto">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">
          D-Pad [↑ / ↓], Activate [ENTER]:
        </div>

        {/* Action 0: Request IMU Permission */}
        <button
          type="button"
          onClick={onRequestPermission}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 0
              ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500 font-mono">[1]</span>
            <span className="font-medium">
              {sensorData.permissionGranted ? 'Sensor Active' : 'Request Sensor Permission'}
            </span>
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
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
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 1
              ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500 font-mono">[2]</span>
            <span>Step Compass Heading (+45°)</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-bold">+45°</span>
        </button>
      </div>
    </div>
  );
};
