import React from 'react';

interface StripChartProps {
  logs: { time: string; text: string; alert?: boolean }[];
  primaryGaugeVal: number;
  primaryGaugeMax: number;
}

export const StripChart: React.FC<StripChartProps> = ({
  logs,
  primaryGaugeVal,
  primaryGaugeMax,
}) => {
  return (
    <div className="relative bg-[#1a1917] border-2 border-[#3c3935] p-3 flex flex-col h-full rounded-sm">
      {/* Chart recorder header */}
      <div className="flex items-center justify-between border-b border-[#363430] pb-1.5 mb-2">
        <span className="text-[10px] font-mono tracking-wider text-[#a8a194] uppercase font-bold">
          CONTINUOUS STRIP RECORDER · MOD-74
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4f8f53] animate-pulse" />
          <span className="text-[9px] font-mono text-[#787267]">FEED: 15mm/MIN</span>
        </div>
      </div>

      {/* Grid paper viewport */}
      <div className="relative flex-1 min-h-[140px] bg-[#f0ebd9] border border-[#beb5a1] overflow-hidden p-2 text-[#1c1b19] font-mono shadow-inner">
        {/* Amber graph ruling lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(to right, #cf7132 1px, transparent 1px), linear-gradient(to bottom, #cf7132 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Paper roll perforations along top edge */}
        <div className="absolute top-1 left-2 right-2 flex justify-between pointer-events-none opacity-40">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#8c8270]" />
          ))}
        </div>

        {/* Live ink pen indicator */}
        <div className="relative z-10 flex flex-col justify-end h-full">
          <div className="text-[10px] font-bold text-[#633214] border-b border-[#cf7132]/40 pb-1 flex justify-between">
            <span>CHRONOLOGICAL ACTION LOG</span>
            <span className="tabular-nums">PEN DEFLECTION: {Math.round((primaryGaugeVal / (primaryGaugeMax || 1)) * 100)}%</span>
          </div>

          <div className="mt-1 flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-[10px] leading-tight max-h-[105px]">
            {logs.length === 0 ? (
              <p className="text-[#8c8270] italic">SYSTEM IDLE. AWAITING OPERATOR INPUT...</p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-1.5 ${
                    log.alert ? 'text-[#a82516] font-bold' : 'text-[#2a2926]'
                  }`}
                >
                  <span className="text-[#7a7263] shrink-0 font-normal">[{log.time}]</span>
                  <span className="break-words">{log.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-[#8a8377]">
        <span>CHART SPEED: NORMAL</span>
        <span>CALIBRATION: ±0.2% FS</span>
      </div>
    </div>
  );
};
