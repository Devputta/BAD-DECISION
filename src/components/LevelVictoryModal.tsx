import React, { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, Sparkles, Trophy, ArrowRight, Home } from 'lucide-react';
import { sound } from '../audio/sound';

interface LevelVictoryModalProps {
  levelNumber: number;
  levelTitle: string;
  movesUsed: number;
  parMoves: number;
  isLastLevel: boolean;
  onNextLevel: () => void;
  onMenu: () => void;
}

export const LevelVictoryModal: React.FC<LevelVictoryModalProps> = ({
  levelNumber,
  levelTitle,
  movesUsed,
  parMoves,
  isLastLevel,
  onNextLevel,
  onMenu,
}) => {
  const triggerCelebration = useCallback(() => {
    // Center burst
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#4f8f53', '#e5a93b', '#d96528', '#f2ede4', '#10b981'],
      disableForReducedMotion: true,
    });

    // Dual flank cannons for high visual impact
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.7 },
        colors: ['#4f8f53', '#e5a93b', '#34d399'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.7 },
        colors: ['#d96528', '#e5a93b', '#38bdf8'],
      });
    }, 250);
  }, []);

  useEffect(() => {
    triggerCelebration();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'n' || e.key === 'N') {
        if (isLastLevel) onMenu();
        else onNextLevel();
      } else if (e.key === 'Escape') {
        onMenu();
      } else if (e.key === 'c' || e.key === 'C') {
        triggerCelebration();
        sound.playClearancePassed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLastLevel, onNextLevel, onMenu, triggerCelebration]);

  const isOptimal = movesUsed <= parMoves;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clearance-report-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs font-mono"
    >
      <div className="relative w-full max-w-lg bg-[#151714] text-[#ded7ca] border-2 border-[#37753c] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.95)] space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glowing Retro Celebration Stamp */}
        <div className="flex items-center justify-between border-b border-[#254d29] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-[#204a24] text-[#4ade80] border border-[#3b8743] shadow-[0_0_12px_rgba(74,222,128,0.4)]">
              {isLastLevel ? <Trophy size={18} /> : <CheckCircle2 size={18} />}
            </span>
            <div>
              <div className="text-[10px] text-[#7da380] uppercase tracking-widest">
                CLEARANCE VERIFIED · CHAMBER {levelNumber < 10 ? `0${levelNumber}` : levelNumber} OF 50
              </div>
              <h2
                id="clearance-report-title"
                className="text-lg sm:text-2xl font-display font-black text-[#52b157] uppercase tracking-tight flex items-center gap-2"
              >
                <span>{isLastLevel ? 'ALL 50 CHAMBERS CONQUERED!' : 'CHAMBER CLEARED!'}</span>
                <Sparkles size={18} className="text-[#f59e0b] animate-spin-slow" />
              </h2>
            </div>
          </div>

          {/* Quick celebrate button */}
          <button
            type="button"
            onClick={() => {
              triggerCelebration();
              sound.playClearancePassed();
            }}
            title="Fire celebration confetti again! [C]"
            className="px-2.5 py-1 bg-[#1f2b1e] hover:bg-[#2e422d] border border-[#3b593a] text-[#86efac] text-[10px] font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <span>🎉 CELEBRATE</span>
          </button>
        </div>

        {/* Narrative & Performance Ledger */}
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-[#c9d4c7]">
            {isLastLevel ? (
              <span className="text-[#fde68a] font-semibold">
                Congratulations! You successfully negotiated all 50 analog stress chambers without catastrophic blowouts, turbine disintegration, or facility containment failure.
              </span>
            ) : (
              <span>
                Deterministic sequence executed without pipe rupture, runaway thermal excursion, or high-voltage arc flash. The system stabilized within safe operating margins.
              </span>
            )}
          </p>

          {/* Performance & Scorecard */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-[#192118] border border-[#2b4c2c] rounded-xs text-xs">
            <div>
              <span className="text-[#78967a] uppercase text-[10px] block font-mono">MOVES USED</span>
              <span className="font-bold text-[#f2ede4] tabular-nums text-base sm:text-lg">
                {movesUsed < 10 ? `0${movesUsed}` : movesUsed}
              </span>
            </div>
            <div>
              <span className="text-[#78967a] uppercase text-[10px] block font-mono">PAR RATING</span>
              <span className="font-bold text-[#f2ede4] tabular-nums text-base sm:text-lg">
                {parMoves < 10 ? `0${parMoves}` : parMoves}
              </span>
            </div>
            <div>
              <span className="text-[#78967a] uppercase text-[10px] block font-mono">EFFICIENCY</span>
              <span
                className={`font-black text-xs sm:text-sm tracking-wider flex items-center gap-1 ${
                  isOptimal ? 'text-[#f59e0b]' : 'text-[#4ade80]'
                }`}
              >
                {isOptimal ? <Award size={14} /> : null}
                {isOptimal ? 'PAR MASTER' : 'PASSED'}
              </span>
            </div>
          </div>

          {/* Unlock Notification Banner */}
          {!isLastLevel && (
            <div className="px-3 py-2 bg-[#121f14] border border-[#234d28] flex items-center justify-between text-[11px] text-[#86efac]">
              <span className="font-bold uppercase tracking-wider">
                STATUS: CHAMBER {levelNumber + 1 < 10 ? `0${levelNumber + 1}` : levelNumber + 1} DECLASSIFIED
              </span>
              <span className="text-[10px] text-[#7da380]">READY FOR ENGAGEMENT</span>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="pt-3 border-t border-[#254d29] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="text-xs text-[#8a8377] hover:text-[#f2ede4] uppercase font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Home size={13} />
            <span>[ESC] CONSOLE</span>
          </button>

          <button
            type="button"
            autoFocus
            onClick={isLastLevel ? onMenu : onNextLevel}
            className="px-6 py-2.5 bg-[#2d7333] hover:bg-[#388f3f] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_14px_rgba(45,115,51,0.5)] flex items-center gap-2 group"
          >
            <span>{isLastLevel ? '[ENTER] RETURN TO CONSOLE' : '[SPACE] NEXT CHAMBER'}</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

