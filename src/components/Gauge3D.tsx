import React, { useState, useEffect } from 'react';
import { sound } from '../audio/sound';
import { Gauge, Activity, ShieldAlert } from 'lucide-react';

interface Gauge3DProps {
  initialPressure?: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  className?: string;
}

export const Gauge3D: React.FC<Gauge3DProps> = ({
  initialPressure = 480,
  min = 0,
  max = 1000,
  label = 'LINE PRESSURE',
  unit = 'PSI',
  className = '',
}) => {
  const [pressure, setPressure] = useState<number>(initialPressure);
  const [autoCycle, setAutoCycle] = useState<boolean>(false);

  // Clamp and calculate needle angle across 240-degree arc (-120° to +120°)
  const clampedPressure = Math.max(min, Math.min(max, pressure));
  const percentage = (clampedPressure - min) / (max - min);
  const needleAngle = -120 + percentage * 240;

  // Auto-cycle simulation effect to showcase smooth needle interpolation
  useEffect(() => {
    if (!autoCycle) return;

    const testValues = [80, 260, 520, 840, 960, 420, 150];
    let idx = 0;

    const interval = setInterval(() => {
      idx = (idx + 1) % testValues.length;
      setPressure(testValues[idx]);
      sound.playMeterTick();
    }, 2200);

    return () => clearInterval(interval);
  }, [autoCycle]);

  const isCritical = clampedPressure >= 800;
  const isOptimal = clampedPressure >= 200 && clampedPressure <= 600;

  const handleSetPressure = (val: number) => {
    setAutoCycle(false);
    setPressure(val);
    sound.playSwitchClick();
  };

  return (
    <div className={`relative w-full font-mono select-none ${className}`}>
      {/* 3D Perspective Instrument Enclosure */}
      <div
        className="relative rounded-xs border-2 p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.4)] overflow-hidden transition-colors duration-150"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-main)',
          color: 'var(--text-pri)',
        }}
      >
        {/* Top Chassis Header */}
        <div
          className="flex items-center justify-between pb-2.5 mb-3 text-[10px] border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full border border-black/40"
              style={{
                backgroundColor: isCritical ? '#d93829' : isOptimal ? '#4f8f53' : '#d96528',
                boxShadow: isCritical ? '0 0 8px #d93829' : '0 0 6px #d96528',
              }}
            />
            <span className="font-bold text-[#d96528] tracking-widest uppercase flex items-center gap-1.5">
              <Gauge size={13} />
              <span>GAUGE-3D INSTRUMENT UNIT</span>
            </span>
          </div>
          <span
            className="tracking-wider text-[9px] uppercase"
            style={{ color: 'var(--text-mut)' }}
          >
            MODEL 1974-V3 · ANALOG PNEUMATIC
          </span>
        </div>

        {/* 3D Viewport with Isometric Tilt */}
        <div className="perspective-[1000px] flex justify-center py-2">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-[#181614] border-4 border-[#332f27] shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_4px_12px_rgba(0,0,0,0.9)] flex items-center justify-center transform-gpu [transform:rotateX(12deg)_rotateY(-6deg)] transition-transform duration-700 hover:[transform:rotateX(0deg)_rotateY(0deg)]">
            {/* Convex Glass Lens Glare Sheen */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none z-30" />

            {/* Inner Dial Face: Aged Vintage Ivory Canvas */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-[#e8e1d3] shadow-[inset_0_4px_16px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center overflow-hidden border border-[#52493b]">
              {/* ASCII Dial Arch Background */}
              <pre className="absolute inset-0 flex items-center justify-center text-[7px] sm:text-[8px] leading-[1.05] text-[#4a443a] opacity-40 font-mono pointer-events-none">
{`       .----''''''----.
     .'  _  500 PSI _  '.
    /   / \\    |   / \\   \\
   / 250   \\   |  /   750 \\
  |         \\  | /         |
  | 0  ------\\(o)/------1000|
  |         /  | \\   [DANGER]
   \\       /   |  \\       /
    \\     /    |   \\     /
     '.  '----...----'  .'
       '--------------'`}
              </pre>

              {/* Red Critical Danger Sector Arc */}
              <div className="absolute top-3 right-6 text-[8px] font-bold text-[#b52a1d] tracking-tight uppercase flex items-center gap-1 z-10">
                <ShieldAlert size={10} />
                <span>800+ CRITICAL</span>
              </div>

              {/* Dial Markings and Center Label */}
              <div className="relative z-10 flex flex-col items-center text-center mt-2 pointer-events-none">
                <span className="text-[10px] font-bold tracking-widest text-[#24211b] uppercase">
                  {label}
                </span>
                <span className="text-[8px] text-[#5e584d] font-mono uppercase">
                  ATMOSPHERIC BLEED
                </span>
              </div>

              {/* Physical Rotating Mechanical Needle with Drop Shadow */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${needleAngle}deg)` }}
              >
                {/* Needle Shaft and Arrow Tip */}
                <div className="relative w-1.5 h-48 sm:h-52 flex flex-col items-center justify-start drop-shadow-[2px_4px_6px_rgba(0,0,0,0.7)]">
                  {/* Arrow Head */}
                  <div
                    className="w-0 h-0 border-x-4 border-x-transparent border-b-8 -mb-0.5"
                    style={{ borderBottomColor: isCritical ? '#d93829' : '#2b2721' }}
                  />
                  {/* Needle Blade */}
                  <div
                    className="w-1 flex-1 rounded-t-xs"
                    style={{
                      backgroundColor: isCritical ? '#d93829' : '#2b2721',
                    }}
                  />
                  {/* Counterweight Tail */}
                  <div className="w-2.5 h-6 bg-[#4a443a] rounded-b-xs" />
                </div>
              </div>

              {/* Center Brass Hub with Rivet Core */}
              <div className="absolute z-25 w-8 h-8 rounded-full bg-gradient-to-tr from-[#7a5e2c] via-[#d4af37] to-[#f5d77f] border-2 border-[#3d2e14] shadow-[0_3px_6px_rgba(0,0,0,0.8)] flex items-center justify-center pointer-events-none">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1e1b17] border border-[#524326] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                </div>
              </div>

              {/* Digital Readout Window (Aged Nixie/Bezel style) */}
              <div className="absolute bottom-6 z-10 bg-[#f4efe4] border-2 border-[#52493b] px-3 py-1 shadow-inner text-center min-w-[80px]">
                <div className="text-[7px] text-[#7a7263] uppercase tracking-wider font-bold">
                  TELEMETRY
                </div>
                <div
                  className="text-xs sm:text-sm font-bold font-mono tracking-wider tabular-nums"
                  style={{ color: isCritical ? '#b52a1d' : '#1e1c18' }}
                >
                  {Math.round(clampedPressure)}{' '}
                  <span className="text-[9px] font-normal text-[#665f52]">{unit}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chassis Controls Sub-panel */}
        <div
          className="mt-3 pt-3 border-t text-[10px]"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="uppercase tracking-wider font-bold"
              style={{ color: 'var(--text-mut)' }}
            >
              SMOOTH NEEDLE INTERPOLATION TEST:
            </span>
            <button
              type="button"
              onClick={() => setAutoCycle(!autoCycle)}
              className={`px-2 py-0.5 border text-[9px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 rounded-xs ${
                autoCycle ? 'bg-[#d96528] text-white border-[#d96528]' : ''
              }`}
              style={{
                backgroundColor: autoCycle ? '#d96528' : 'var(--bg-slot)',
                borderColor: autoCycle ? '#d96528' : 'var(--border-subtle)',
                color: autoCycle ? '#ffffff' : 'var(--text-mut)',
              }}
            >
              <Activity size={10} className={autoCycle ? 'animate-pulse' : ''} />
              <span>{autoCycle ? 'AUTO-CYCLING' : 'AUTO CYCLE'}</span>
            </button>
          </div>

          {/* Quick Target Pressure Buttons */}
          <div className="grid grid-cols-4 gap-1.5 text-xs">
            {[80, 340, 650].map((val) => {
              const isSelected = pressure === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSetPressure(val)}
                  className={`py-1.5 px-1 border text-[10px] font-bold uppercase transition-all cursor-pointer rounded-xs ${
                    isSelected ? 'shadow-xs border-[#d96528]' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--btn-sel-bg)' : 'var(--bg-slot)',
                    color: isSelected ? 'var(--btn-sel-text)' : 'var(--text-mut)',
                    borderColor: isSelected ? '#d96528' : 'var(--border-subtle)',
                  }}
                >
                  {val} PSI
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => handleSetPressure(920)}
              className="py-1.5 px-1 border text-[10px] font-bold uppercase transition-all cursor-pointer rounded-xs"
              style={{
                backgroundColor: pressure === 920 ? '#d93829' : 'var(--bg-slot)',
                color: pressure === 920 ? '#ffffff' : '#d93829',
                borderColor: pressure === 920 ? '#d93829' : 'var(--border-subtle)',
              }}
            >
              920 PSI!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
