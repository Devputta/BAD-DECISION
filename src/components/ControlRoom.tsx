import React from 'react';
import { LevelDefinition, TelemetryGauge } from '../types/game';
import { AnalogGauge } from './AnalogGauge';
import { MechanicalSwitch } from './MechanicalSwitch';
import { RotateCcw, HelpCircle, FileText } from 'lucide-react';
import { sound } from '../audio/sound';

interface ControlRoomProps {
  level: LevelDefinition;
  levelState: Record<string, any>;
  movesUsed: number;
  maxMoves: number;
  gauges: TelemetryGauge[];
  chartLogs: { time: string; text: string; alert?: boolean }[];
  soundEnabled: boolean;
  attemptCount: number;
  isDeclassified: boolean;
  onToggleSound: () => void;
  onAction: (objId: string, val: any) => void;
  onReset: () => void;
  onOpenArchive: () => void;
  onSelectLevel: (lvl: number) => void;
  onOpenHint: () => void;
  onOpenSolution: () => void;
  unlockedLevels: number;
}

export const ControlRoom: React.FC<ControlRoomProps> = ({
  level,
  levelState,
  movesUsed,
  maxMoves,
  gauges,
  attemptCount,
  isDeclassified,
  onAction,
  onReset,
  onSelectLevel,
  onOpenHint,
  onOpenSolution,
  unlockedLevels,
}) => {
  const movesRemaining = maxMoves - movesUsed;
  const statusText = level.statusMessage(levelState, movesUsed);
  const primaryGauge = gauges[0] || { value: 0, max: 100, min: 0, unit: '' };

  // Calculate flow meter progress percentage
  const flowPct = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((primaryGauge.value - primaryGauge.min) /
          (primaryGauge.max - primaryGauge.min || 1)) *
          100
      )
    )
  );

  return (
    <div
      className="w-full font-mono transition-colors duration-150"
      style={{ color: 'var(--text-pri)' }}
    >
      {/* 1. Chamber Identification & Quick Selector */}
      <div
        className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-2.5 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-sm font-bold text-[#d96528] tracking-wider">
            CHAMBER {level.levelNumber < 10 ? `0${level.levelNumber}` : level.levelNumber}
          </span>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <h1
            className="font-display font-bold text-lg sm:text-xl uppercase tracking-tight"
            style={{ color: 'var(--text-pri)' }}
          >
            {level.title}
          </h1>
          <span
            className="hidden sm:inline text-xs"
            style={{ color: 'var(--text-mut)' }}
          >
            — {level.subtitle}
          </span>
        </div>

        {/* Minimal chamber switch links with sliding window for 50 levels */}
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className="text-[10px] uppercase mr-1"
            style={{ color: 'var(--text-mut)' }}
          >
            RIG:
          </span>
          {level.levelNumber > 1 && (
            <button
              type="button"
              onClick={() => {
                sound.playRatchet();
                onSelectLevel(level.levelNumber - 1);
              }}
              className="px-1.5 py-0.5 text-xs font-bold transition-colors cursor-pointer hover:text-[#d96528]"
              style={{ color: 'var(--text-mut)' }}
              title="Previous Chamber"
            >
              ←
            </button>
          )}

          {[-2, -1, 0, 1, 2].map((offset) => {
            const lvlNum = level.levelNumber + offset;
            if (lvlNum < 1 || lvlNum > 50) return null;
            const isUnlocked = lvlNum <= unlockedLevels;
            const isCurrent = lvlNum === level.levelNumber;
            return (
              <button
                key={lvlNum}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  sound.playRatchet();
                  onSelectLevel(lvlNum);
                }}
                className={`px-1.5 py-0.5 text-xs font-bold transition-colors cursor-pointer ${
                  isCurrent ? 'underline underline-offset-4' : ''
                }`}
                style={{
                  color: isCurrent
                    ? '#d96528'
                    : isUnlocked
                    ? 'var(--text-mut)'
                    : 'var(--text-dim)',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                }}
                title={isUnlocked ? `Chamber ${lvlNum < 10 ? `0${lvlNum}` : lvlNum}` : 'Locked'}
              >
                {lvlNum < 10 ? `0${lvlNum}` : lvlNum}
              </button>
            );
          })}

          {level.levelNumber < 50 && level.levelNumber < unlockedLevels && (
            <button
              type="button"
              onClick={() => {
                sound.playRatchet();
                onSelectLevel(level.levelNumber + 1);
              }}
              className="px-1.5 py-0.5 text-xs font-bold transition-colors cursor-pointer hover:text-[#d96528]"
              style={{ color: 'var(--text-mut)' }}
              title="Next Chamber"
            >
              →
            </button>
          )}
        </div>
      </div>

      {/* 2. Objective & Safety */}
      <div className="my-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div className="md:col-span-8">
          <div
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--text-mut)' }}
          >
            PRIMARY OBJECTIVE
          </div>
          <p
            className="font-display text-base sm:text-lg font-medium leading-snug"
            style={{ color: 'var(--text-pri)' }}
          >
            {level.objective}.
          </p>
          <p
            className="text-xs mt-1 leading-relaxed"
            style={{ color: 'var(--text-sec)' }}
          >
            {level.briefing}
          </p>
        </div>

        <div
          className="md:col-span-4 md:border-l md:pl-5"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="text-[10px] font-bold text-[#d96528] uppercase tracking-widest mb-1">
            SAFETY RULE
          </div>
          <p
            className="text-xs leading-relaxed font-semibold"
            style={{ color: 'var(--text-pri)' }}
          >
            {level.warningNote}
          </p>
          <div
            className="mt-2 text-[10px]"
            style={{ color: 'var(--text-mut)' }}
          >
            ATTEMPTS RECORDED: <span className="font-bold text-[#d96528]">{attemptCount}</span> / 10
          </div>
        </div>
      </div>

      <div
        className="w-full h-px my-4"
        style={{ backgroundColor: 'var(--border-subtle)' }}
      />

      {/* 3. The Machine Apparatus (Visual Hero) */}
      <div className="my-6">
        {/* Analog Instrument cluster */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 py-4">
          {gauges.map((g) => (
            <AnalogGauge key={g.id} gauge={g} />
          ))}
        </div>

        {/* Declassified Procedure Guidance Banner (shown on 10th attempt) */}
        {isDeclassified && (
          <div
            className="my-4 p-3.5 border text-xs rounded-xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: '#d96528',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#d96528] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <FileText size={13} />
                <span>DECLASSIFIED OPERATIONAL ANSWER (FINAL ATTEMPT):</span>
              </span>
              <span className="text-[10px] text-[#d96528] uppercase font-bold">
                ATTEMPT 10 OF 10
              </span>
            </div>
            <div
              className="space-y-1 font-mono"
              style={{ color: 'var(--text-pri)' }}
            >
              {level.solutionSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#d96528] font-bold shrink-0">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Physical Interconnected Controls */}
        <div
          className="mt-8 pt-6 border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="text-[10px] font-bold uppercase tracking-wider text-center mb-4"
            style={{ color: 'var(--text-mut)' }}
          >
            ACTUATOR BANK · DIRECT MECHANICAL COUPLING [KEYS 1–{level.objects.length}]
          </div>

          {/* Clean grid with items-stretch for identical vertical height and baseline alignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
            {level.objects.map((obj, idx) => (
              <MechanicalSwitch
                key={obj.id}
                obj={{
                  ...obj,
                  state:
                    levelState[obj.id] !== undefined
                      ? levelState[obj.id]
                      : obj.state,
                }}
                index={idx}
                disabled={movesRemaining <= 0}
                onAction={onAction}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        className="w-full h-px my-6"
        style={{ backgroundColor: 'var(--border-subtle)' }}
      />

      {/* 4. Physical Flow Line & System Status (Cause & Effect) */}
      <div className="my-4 space-y-4">
        {/* Dynamic Flow indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <span
            className="text-[11px] uppercase font-bold tracking-wider shrink-0"
            style={{ color: 'var(--text-mut)' }}
          >
            {primaryGauge.label} FLOW:
          </span>

          <div className="flex-1 max-w-xl mx-2 flex items-center gap-2">
            <span
              className="text-[10px] font-mono shrink-0 font-bold"
              style={{ color: 'var(--text-pri)' }}
            >
              {primaryGauge.value} {primaryGauge.unit}
            </span>
            <div
              className="relative flex-1 h-2 rounded-full overflow-hidden border"
              style={{
                backgroundColor: 'var(--progress-track)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div
                className="h-full bg-[#d96528] transition-all duration-300"
                style={{ width: `${flowPct}%` }}
              />
            </div>
            <span
              className="text-[10px] font-mono shrink-0"
              style={{ color: 'var(--text-mut)' }}
            >
              SAFE &lt; {primaryGauge.optimalMax || 50} {primaryGauge.unit}
            </span>
          </div>
        </div>

        {/* Physical Status Warning Label */}
        <div
          className="py-2.5 px-3 border-l-3 flex items-center gap-3 text-xs rounded-xs shadow-xs"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: '#d96528',
          }}
        >
          <span className="w-2 h-2 rounded-full amber-filament amber-glow-active shrink-0" />
          <span className="font-mono text-[#d96528] font-bold uppercase tracking-tight">
            {statusText}
          </span>
        </div>
      </div>

      {/* 5. Minimal Move Budget, Hint, Answer & Fast Reset Footer */}
      <div
        className="mt-8 pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div
          className="flex items-center gap-4"
          style={{ color: 'var(--text-mut)' }}
        >
          <div>
            <span className="uppercase text-[10px]">MOVES: </span>
            <span
              className="font-bold tabular-nums"
              style={{ color: 'var(--text-pri)' }}
            >
              {movesUsed < 10 ? `0${movesUsed}` : movesUsed} / {maxMoves < 10 ? `0${maxMoves}` : maxMoves}
            </span>
          </div>
          <span style={{ color: 'var(--text-dim)' }}>·</span>
          <div>
            <span className="uppercase text-[10px]">ALLOWANCE: </span>
            <span
              className={`font-bold tabular-nums ${
                movesRemaining <= 2 ? 'text-[#d96528]' : ''
              }`}
              style={{ color: movesRemaining <= 2 ? '#d96528' : 'var(--text-pri)' }}
            >
              {movesRemaining < 10 ? `0${movesRemaining}` : movesRemaining} LEFT
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Hint Trigger Button */}
          <button
            type="button"
            onClick={onOpenHint}
            className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-xs hover:border-[#d96528]"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-pri)',
            }}
            title="Read engineering hint"
          >
            <HelpCircle size={13} className="text-[#d96528]" />
            <span>[ ? HINT ]</span>
          </button>

          {/* Show Answer Trigger (Unlocked when attempted >= 9 or isDeclassified) */}
          {(attemptCount >= 9 || isDeclassified) && (
            <button
              type="button"
              onClick={onOpenSolution}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d96528] bg-[#d96528] text-white hover:bg-[#ea7535] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer animate-pulse rounded-xs shadow-xs"
              title="View declassified operational solution"
            >
              <FileText size={13} />
              <span>[ VIEW ANSWER ]</span>
            </button>
          )}

          {/* Reset Test Button */}
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-bold text-[#d96528] hover:text-[#ea7535] uppercase tracking-wider transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>[R] RESET TEST</span>
          </button>
        </div>
      </div>
    </div>
  );
};
