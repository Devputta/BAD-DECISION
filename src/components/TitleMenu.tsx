import React, { useState } from 'react';
import { LevelDefinition } from '../types/game';
import { sound } from '../audio/sound';
import { Gauge3D } from './Gauge3D';
import { CheckCircle2, Lock, ArrowRight, ShieldCheck, Gauge as GaugeIcon, Activity, Flame } from 'lucide-react';

interface TitleMenuProps {
  levels: LevelDefinition[];
  unlockedLevels: number;
  bestMoves: Record<string, number>;
  incidentCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onStartLevel: (lvlNum: number) => void;
  onOpenArchive: () => void;
}

export const TitleMenu: React.FC<TitleMenuProps> = ({
  levels,
  unlockedLevels,
  bestMoves,
  incidentCount,
  onStartLevel,
  onOpenArchive,
}) => {
  const [sectorRange, setSectorRange] = useState<'ALL' | '1-10' | '11-20' | '21-30' | '31-40' | '41-50'>('1-10');

  const filteredLevels = levels.filter((lvl) => {
    if (sectorRange === 'ALL') return true;
    if (sectorRange === '1-10') return lvl.levelNumber >= 1 && lvl.levelNumber <= 10;
    if (sectorRange === '11-20') return lvl.levelNumber >= 11 && lvl.levelNumber <= 20;
    if (sectorRange === '21-30') return lvl.levelNumber >= 21 && lvl.levelNumber <= 30;
    if (sectorRange === '31-40') return lvl.levelNumber >= 31 && lvl.levelNumber <= 40;
    if (sectorRange === '41-50') return lvl.levelNumber >= 41 && lvl.levelNumber <= 50;
    return true;
  });

  return (
    <div
      className="w-full font-mono transition-colors duration-150"
      style={{ color: 'var(--text-pri)' }}
    >
      {/* Editorial Game Entrance with Interactive 3D ASCII Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14 items-center mb-10">
        {/* Left Column: Briefing & Operational Ledger */}
        <div className="lg:col-span-7 space-y-4">
          <div
            className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2"
            style={{ color: 'var(--text-mut)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#d96528]" />
            <span>EXPERIMENTAL ANALOG RIG · 1974 · 50 CHAMBERS</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-none"
            style={{ color: 'var(--text-pri)' }}
          >
            BAD DECISION.
          </h1>

          <div className="space-y-1 text-base sm:text-lg text-[#d96528] font-display font-semibold">
            <p>Fifty chambers.</p>
            <p>One wrong flip is fatal.</p>
          </div>

          <p
            className="text-xs sm:text-sm leading-relaxed max-w-xl"
            style={{ color: 'var(--text-sec)' }}
          >
            You stand before an analog experimental control system. Every switch, valve, and lever has a physical, deterministic consequence.
          </p>

          <p
            className="text-xs sm:text-sm leading-relaxed max-w-xl"
            style={{ color: 'var(--text-mut)' }}
          >
            Observe the gauges before you act. Physics is deterministic; ignorance is loud.
          </p>

          {/* Technical Specifications Summary Strip (fills desktop width authentically) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 pb-1 max-w-xl">
            <div
              className="p-2.5 rounded-xs border"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="text-[9px] uppercase font-bold text-[#d96528] flex items-center gap-1">
                <GaugeIcon size={11} />
                <span>CHAMBERS</span>
              </div>
              <div className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-pri)' }}>
                50 LEVELS
              </div>
            </div>

            <div
              className="p-2.5 rounded-xs border"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="text-[9px] uppercase font-bold text-[#d96528] flex items-center gap-1">
                <Activity size={11} />
                <span>MANIFOLD</span>
              </div>
              <div className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-pri)' }}>
                1000 PSI MAX
              </div>
            </div>

            <div
              className="p-2.5 rounded-xs border"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="text-[9px] uppercase font-bold text-[#d96528] flex items-center gap-1">
                <Flame size={11} />
                <span>FAIL RATE</span>
              </div>
              <div className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-pri)' }}>
                INSTANT LOSS
              </div>
            </div>

            <div
              className="p-2.5 rounded-xs border"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="text-[9px] uppercase font-bold text-[#d96528] flex items-center gap-1">
                <ShieldCheck size={11} />
                <span>ATTEMPTS</span>
              </div>
              <div className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-pri)' }}>
                10 / CHAMBER
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <button
              type="button"
              onClick={() => {
                sound.playSwitchClick();
                onStartLevel(1);
              }}
              className="px-6 py-3 bg-[#d96528] hover:bg-[#ea7535] text-white font-bold tracking-wider uppercase transition-colors cursor-pointer shadow-sm rounded-xs flex items-center gap-2"
            >
              <span>[ COMMENCE TEST ]</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={onOpenArchive}
              className="px-5 py-3 border font-bold tracking-wider uppercase transition-colors cursor-pointer rounded-xs hover:border-[#d96528]"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-pri)',
              }}
            >
              [ INCIDENT ARCHIVE {incidentCount > 0 ? `(${incidentCount})` : ''} ]
            </button>
          </div>
        </div>

        {/* Right Column: 3D Gauge Viewport */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <div className="w-full max-w-md">
            <Gauge3D initialPressure={480} min={0} max={1000} label="LINE PRESSURE" unit="PSI" />
          </div>
        </div>
      </div>

      <div
        className="w-full h-px my-8"
        style={{ backgroundColor: 'var(--border-subtle)' }}
      />

      {/* Experimental Chamber Roster (2-Column Dense Grid for Wide Screen Presence) */}
      <div>
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs uppercase tracking-wider mb-4 pb-2 border-b"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-mut)',
          }}
        >
          <span className="font-bold">TEST CHAMBER DIRECTORY</span>
          <span>
            PROGRESSION: <span className="text-[#d96528] font-bold">{Math.min(unlockedLevels, levels.length)}</span> / {levels.length} ACCESSIBLE
          </span>
        </div>

        {/* Sector Grouping Tabs for 50 Levels */}
        <div className="flex flex-wrap gap-1.5 mb-6 text-[10px]">
          {(['1-10', '11-20', '21-30', '31-40', '41-50', 'ALL'] as const).map((rng) => (
            <button
              key={rng}
              type="button"
              onClick={() => {
                sound.playSwitchClick();
                setSectorRange(rng);
              }}
              className={`px-3 py-1 font-bold uppercase transition-colors border cursor-pointer rounded-xs ${
                sectorRange === rng ? 'bg-[#d96528] text-white border-[#d96528]' : ''
              }`}
              style={{
                backgroundColor: sectorRange === rng ? '#d96528' : 'var(--bg-card)',
                color: sectorRange === rng ? '#ffffff' : 'var(--text-mut)',
                borderColor: sectorRange === rng ? '#d96528' : 'var(--border-main)',
              }}
            >
              {rng === 'ALL' ? 'ALL 50 CHAMBERS' : `CHAMBERS ${rng}`}
            </button>
          ))}
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredLevels.map((lvl) => {
            const isUnlocked = lvl.levelNumber <= unlockedLevels;
            const bestScore = bestMoves[lvl.id];
            const isBeaten = bestScore !== undefined;

            return (
              <div
                key={lvl.id}
                className="p-3.5 rounded-xs border transition-colors flex flex-col justify-between gap-2.5 shadow-xs"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: isBeaten ? '#3ba54b' : isUnlocked ? 'var(--border-main)' : 'var(--border-subtle)',
                  opacity: isUnlocked ? 1 : 0.6,
                }}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm text-[#d96528] font-bold">
                      CH {lvl.levelNumber < 10 ? `0${lvl.levelNumber}` : lvl.levelNumber}
                    </span>
                    <span style={{ color: 'var(--text-dim)' }}>·</span>
                    <span
                      className="font-display text-sm font-bold uppercase tracking-tight"
                      style={{ color: 'var(--text-pri)' }}
                    >
                      {lvl.title}
                    </span>
                  </div>

                  {isBeaten ? (
                    <span className="text-[10px] text-[#3ba54b] font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 size={12} />
                      <span>{bestScore} MOVES</span>
                    </span>
                  ) : (
                    <span
                      className="text-[10px] font-mono shrink-0 uppercase"
                      style={{ color: 'var(--text-mut)' }}
                    >
                      PAR {lvl.parMoves < 10 ? `0${lvl.parMoves}` : lvl.parMoves}
                    </span>
                  )}
                </div>

                {/* Objective */}
                <p
                  className="text-xs leading-relaxed line-clamp-2"
                  style={{ color: 'var(--text-sec)' }}
                >
                  {lvl.objective}
                </p>

                {/* Footer / Action */}
                <div
                  className="pt-2 border-t flex items-center justify-between gap-2 text-xs"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <span
                    className="text-[10px] uppercase truncate"
                    style={{ color: 'var(--text-mut)' }}
                  >
                    {lvl.subtitle}
                  </span>

                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSwitchClick();
                        onStartLevel(lvl.levelNumber);
                      }}
                      className="px-3 py-1 font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-xs text-[11px] bg-[#d96528] hover:bg-[#ea7535] text-white flex items-center gap-1 shrink-0 shadow-xs"
                    >
                      <span>ENGAGE</span>
                      <ArrowRight size={11} />
                    </button>
                  ) : (
                    <span
                      className="text-[10px] font-bold uppercase flex items-center gap-1 shrink-0"
                      style={{ color: 'var(--text-dim)' }}
                    >
                      <Lock size={11} />
                      <span>LOCKED</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Minimal Footer Note */}
      <div
        className="mt-12 pt-4 border-t flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2"
        style={{
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-dim)',
        }}
      >
        <span>1970S MECHANICAL LABORATORY SIMULATION · 50 TOTAL CHAMBERS</span>
        <span>KEYBOARD SHORTCUTS: [1-9] ACTUATORS · [R] RESET · [ESC] CONSOLE</span>
      </div>
    </div>
  );
};
