import React from 'react';
import { TelemetryGauge } from '../types/game';

interface AnalogGaugeProps {
  gauge: TelemetryGauge;
}

export const AnalogGauge: React.FC<AnalogGaugeProps> = ({ gauge }) => {
  const { min, max, value, label, unit, dangerHigh, dangerLow, optimalMax } = gauge;

  // Arc range: 240 degrees (from -120deg to +120deg)
  const clamped = Math.max(min, Math.min(max, value));
  const pct = (clamped - min) / (max - min || 1);
  const angle = -120 + pct * 240;

  // Ticks
  const tickCount = 10;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const tickPct = i / tickCount;
    const tickVal = Math.round(min + tickPct * (max - min));
    const tickAngle = -120 + tickPct * 240;
    const rad = (tickAngle - 90) * (Math.PI / 180);
    const isMajor = i % 2 === 0;
    const outerR = 66;
    const innerR = isMajor ? 54 : 60;

    return {
      x1: 75 + outerR * Math.cos(rad),
      y1: 75 + outerR * Math.sin(rad),
      x2: 75 + innerR * Math.cos(rad),
      y2: 75 + innerR * Math.sin(rad),
      val: tickVal,
      tx: 75 + 44 * Math.cos(rad),
      ty: 75 + 44 * Math.sin(rad),
      isMajor,
    };
  });

  const isDanger =
    (dangerHigh !== undefined && value >= dangerHigh) ||
    (dangerLow !== undefined && value <= dangerLow);

  return (
    <div className="flex flex-col items-center select-none font-mono">
      {/* Gauge Title Header */}
      <div
        className="text-[11px] font-bold uppercase tracking-wider mb-1 text-center"
        style={{ color: 'var(--text-pri)' }}
      >
        {label}
      </div>

      {/* Physical Instrument Dial (Flush-mounted analog dial with metallic rim) */}
      <div
        className="relative w-40 h-40 rounded-full border-4 shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center transition-colors"
        style={{
          backgroundColor: 'var(--bg-slot)',
          borderColor: 'var(--border-main)',
        }}
      >
        {/* Inner dial face: aged paper ivory dial background */}
        <div className="relative w-34 h-34 rounded-full bg-[#eee7da] shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden">
          {/* Convex lens glare sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/35 pointer-events-none rounded-full" />

          <svg viewBox="0 0 150 150" className="w-full h-full">
            {/* Critical danger red arc */}
            {dangerHigh !== undefined && (
              <path
                d="M 124 110 A 66 66 0 0 0 141 75"
                fill="none"
                stroke="#c93b2b"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.8"
              />
            )}

            {/* Dial scale ticks */}
            {ticks.map((t, idx) => (
              <g key={idx}>
                <line
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke="#26231f"
                  strokeWidth={t.isMajor ? '2' : '1'}
                />
                {t.isMajor && (
                  <text
                    x={t.tx}
                    y={t.ty}
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill="#3d372e"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {t.val}
                  </text>
                )}
              </g>
            ))}

            {/* Dial unit label */}
            <text
              x="75"
              y="112"
              fontSize="8"
              fontFamily="monospace"
              fontWeight="bold"
              fill="#524b3f"
              textAnchor="middle"
            >
              {unit}
            </text>

            {/* Mechanical pointer needle */}
            <g transform={`rotate(${angle} 75 75)`} className="transition-transform duration-250 ease-out">
              <polygon
                points="73,75 75,17 77,75 75,90"
                fill={isDanger ? '#c93b2b' : '#1f1e1c'}
                stroke="#0f0e0d"
                strokeWidth="0.5"
              />
              <circle cx="75" cy="85" r="4" fill="#2d2925" />
            </g>

            {/* Brass center pivot cap */}
            <circle cx="75" cy="75" r="7" fill="#b89558" stroke="#524021" strokeWidth="1.5" />
            <circle cx="75" cy="75" r="3" fill="#1f1e1c" />
          </svg>

          {/* Warning filament blip */}
          {isDanger && (
            <div className="absolute top-2 w-2 h-2 rounded-full bg-[#c93b2b] animate-ping" />
          )}
        </div>
      </div>

      {/* Clean Telemetry Readout Below Instrument */}
      <div className="mt-2 text-center text-xs space-y-0.5">
        <div className="flex items-center justify-center gap-2">
          <span style={{ color: 'var(--text-mut)' }}>CURRENT:</span>
          <span
            className="font-bold tabular-nums"
            style={{ color: isDanger ? '#d96528' : 'var(--text-pri)' }}
          >
            {value} {unit}
          </span>
        </div>
        <div
          className="text-[10px] space-x-2"
          style={{ color: 'var(--text-dim)' }}
        >
          {optimalMax !== undefined && <span>SAFE: &lt; {optimalMax} {unit}</span>}
          {dangerHigh !== undefined && <span>CRITICAL: &gt; {dangerHigh} {unit}</span>}
        </div>
      </div>
    </div>
  );
};
