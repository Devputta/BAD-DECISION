import React from 'react';
import { InteractiveObject } from '../types/game';
import { sound } from '../audio/sound';

interface MechanicalSwitchProps {
  obj: InteractiveObject;
  index: number;
  disabled?: boolean;
  onAction: (objId: string, newValue: any) => void;
}

export const MechanicalSwitch: React.FC<MechanicalSwitchProps> = ({
  obj,
  index,
  disabled = false,
  onAction,
}) => {
  const { id, name, type, state, options = [], hint, dangerous } = obj;

  const currentIdx = options.findIndex((o) => o.value === state);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;
  const isFirst = activeIdx === 0;

  const handleToggle = () => {
    if (disabled) return;

    if (type === 'breaker') {
      sound.playHeavyBreaker();
    } else if (type === 'dial') {
      sound.playRatchet();
    } else if (dangerous) {
      sound.playArcBuzz();
    } else {
      sound.playSwitchClick();
    }

    if (options.length === 2) {
      const nextVal = state === options[0].value ? options[1].value : options[0].value;
      onAction(id, nextVal);
    } else if (options.length > 2) {
      const nextIdx = (activeIdx + 1) % options.length;
      onAction(id, options[nextIdx].value);
    }
  };

  const handleSelect = (val: any) => {
    if (disabled || val === state) return;
    if (type === 'breaker') sound.playHeavyBreaker();
    else if (type === 'dial') sound.playRatchet();
    else sound.playSwitchClick();
    onAction(id, val);
  };

  return (
    <div
      className="h-full flex flex-col justify-between p-3.5 select-none font-mono rounded-xs border shadow-sm transition-colors duration-150"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-main)',
        color: 'var(--text-pri)',
      }}
    >
      {/* 1. Actuator Identification (Fixed height for horizontal alignment) */}
      <div
        className="flex items-start gap-1.5 h-8 pb-1.5 mb-2 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <span
          className="text-[10px] font-bold shrink-0 pt-0.5"
          style={{ color: 'var(--text-mut)' }}
        >
          0{index + 1}.
        </span>
        <span
          className="text-xs font-bold tracking-tight uppercase leading-snug line-clamp-2"
          style={{ color: 'var(--text-pri)' }}
        >
          {name}
        </span>
      </div>

      {/* 2. Physical Mechanical Mechanism (Centered in uniform height) */}
      <div className="my-2 h-24 flex items-center justify-center">
        {type === 'breaker' ? (
          // Heavy Knife Switch Breaker
          <button
            type="button"
            disabled={disabled}
            onClick={handleToggle}
            className="group relative w-28 h-20 border-2 p-2 flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-[#d96528] cursor-pointer shadow-inner rounded-xs transition-colors"
            style={{
              backgroundColor: 'var(--bg-slot)',
              borderColor: 'var(--border-subtle)',
            }}
            title={`Toggle ${name}`}
          >
            <div className="absolute left-2.5 top-2.5 bottom-2.5 w-3 bg-[#a38042] border border-[#524021]" />
            <div className="absolute right-2.5 top-2.5 bottom-2.5 w-3 bg-[#a38042] border border-[#524021]" />

            <div
              className={`w-18 h-4.5 rounded-xs transition-transform duration-200 flex items-center justify-center shadow-md ${
                isFirst
                  ? '-rotate-24 translate-y-1.5 bg-[#423e38] border border-[#5c564f]'
                  : 'rotate-12 -translate-y-1 bg-[#b89558] border border-[#ffe099]'
              }`}
            >
              <div className="w-6 h-1.5 bg-[#141312] rounded-full" />
            </div>
          </button>
        ) : type === 'dial' ? (
          // Heavy Bakelite Rotary Dial / Valve Wheel
          <button
            type="button"
            disabled={disabled}
            onClick={handleToggle}
            className="group relative w-20 h-20 rounded-full border-4 shadow-md flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-[#d96528] cursor-pointer active:scale-95 transition-all"
            style={{
              backgroundColor: 'var(--bg-slot)',
              borderColor: 'var(--border-subtle)',
            }}
            title="Rotate Dial"
          >
            <div
              className="absolute inset-1 rounded-full border border-dashed pointer-events-none"
              style={{ borderColor: 'var(--border-main)' }}
            />

            {/* Rotary Pointer Needle Indicator */}
            <div
              className="w-12 h-12 rounded-full border shadow-inner flex items-center justify-center relative transition-transform duration-200"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
                transform: `rotate(${activeIdx * (360 / Math.max(1, options.length))}deg)`,
              }}
            >
              <div className="absolute -top-1 w-2.5 h-4 bg-[#d96528] rounded-xs shadow-xs" />
              <div className="w-4 h-4 rounded-full bg-[#1b1a18] border border-[#4a453d]" />
            </div>
          </button>
        ) : type === 'plunger' ? (
          // Giant Emergency Palm-Button / Plunger
          <button
            type="button"
            disabled={disabled}
            onClick={handleToggle}
            className="group relative w-20 h-20 rounded-full p-2 border-3 shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-600 active:scale-90 transition-transform cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-slot)',
              borderColor: 'var(--border-subtle)',
            }}
            title="Press Plunger"
          >
            <div className="w-14 h-14 rounded-full red-filament shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_12px_rgba(180,45,35,0.7)] flex items-center justify-center text-white text-[10px] font-bold text-center leading-tight">
              PUSH
            </div>
          </button>
        ) : type === 'key' ? (
          // Brass Cylinder 90° Key Switch
          <button
            type="button"
            disabled={disabled}
            onClick={handleToggle}
            className="relative w-20 h-16 border p-2 flex flex-col items-center justify-center focus:outline-none focus:ring-1 focus:ring-[#d96528] cursor-pointer rounded-xs"
            style={{
              backgroundColor: 'var(--bg-slot)',
              borderColor: 'var(--border-subtle)',
            }}
            title="Turn Key"
          >
            <div className="w-9 h-9 rounded-full bg-[#b89558] border-2 border-[#544321] flex items-center justify-center shadow-inner">
              <div
                className={`w-5 h-1 bg-[#141312] rounded transition-transform duration-200 ${
                  isFirst ? 'rotate-0' : 'rotate-90'
                }`}
              />
            </div>
          </button>
        ) : (
          // Mechanical Industrial Toggle Lever
          <button
            type="button"
            disabled={disabled}
            onClick={handleToggle}
            className="relative w-16 h-20 border rounded-xs flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-[#d96528] cursor-pointer shadow-inner transition-colors"
            style={{
              backgroundColor: 'var(--bg-slot)',
              borderColor: 'var(--border-subtle)',
            }}
            title="Flip Switch"
          >
            <div
              className={`w-4 h-12 bg-gradient-to-b from-[#87827b] via-[#ded7ca] to-[#47433d] rounded-xs border border-[#332f29] shadow-md transition-transform duration-150 ${
                isFirst ? 'rotate-20 translate-y-1' : '-rotate-20 -translate-y-1'
              }`}
            />
          </button>
        )}
      </div>

      {/* 3. Perfectly Aligned Options Grid with Mechanical Status Indicator */}
      <div
        className="w-full mt-2 pt-2 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="grid grid-cols-2 gap-1.5 w-full">
          {options.map((opt) => {
            const isSelected = opt.value === state;
            return (
              <button
                key={String(opt.value)}
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(opt.value)}
                className={`py-1.5 px-1.5 text-center text-[10px] sm:text-[11px] font-mono font-bold rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1 border ${
                  isSelected ? 'shadow-xs border-[#d96528]' : ''
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--btn-sel-bg)' : 'var(--btn-unsel-bg)',
                  color: isSelected ? 'var(--btn-sel-text)' : 'var(--btn-unsel-text)',
                  borderColor: isSelected ? '#d96528' : 'var(--border-subtle)',
                }}
                title={opt.label}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                    isSelected ? 'bg-[#d96528] amber-glow-active' : 'opacity-30 bg-current'
                  }`}
                />
                <span className="leading-none text-center">
                  {opt.label.length > 9 ? opt.label.slice(0, 8) + '.' : opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 4. Functional Technical Hint */}
        <div
          className="mt-2 text-[10px] leading-tight line-clamp-2 min-h-[2.4em]"
          style={{ color: 'var(--text-mut)' }}
        >
          {hint}
        </div>
      </div>
    </div>
  );
};
