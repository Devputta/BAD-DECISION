import React, { useEffect } from 'react';
import { LevelDefinition } from '../types/game';
import { Wrench, AlertTriangle, Eye, ShieldCheck, X } from 'lucide-react';

interface HintModalProps {
  level: LevelDefinition;
  levelState: Record<string, any>;
  attemptCount: number;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  level,
  attemptCount,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const notes = level.technicianNotes;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="technician-note-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs font-mono"
    >
      <div
        className="relative w-full max-w-xl p-5 sm:p-7 shadow-2xl space-y-4 rounded-xs border-2 transition-colors duration-150"
        style={{
          backgroundColor: 'var(--modal-bg)',
          borderColor: 'var(--modal-border)',
          color: 'var(--text-pri)',
        }}
      >
        {/* Header with Attempts Badge */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <div
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest"
              style={{ color: 'var(--text-mut)' }}
            >
              <span>FIELD TECHNICIAN'S LOG · #1974-DOC</span>
              <span>·</span>
              <span className="text-[#d96528] font-bold">
                CHAMBER {level.levelNumber < 10 ? `0${level.levelNumber}` : level.levelNumber}
              </span>
            </div>
            <h2
              id="technician-note-title"
              className="text-base sm:text-lg font-display font-bold uppercase mt-0.5 tracking-tight flex items-center gap-2"
              style={{ color: 'var(--text-pri)' }}
            >
              <Wrench size={16} className="text-[#d96528]" />
              <span>{level.title} — APPARATUS DIAGNOSTIC</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Attempts Indicator */}
            <div
              className="px-2.5 py-1 text-right shrink-0 border rounded-xs"
              style={{
                backgroundColor: 'var(--modal-box-bg)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <span
                className="text-[9px] block uppercase leading-none"
                style={{ color: 'var(--text-mut)' }}
              >
                ATTEMPTS
              </span>
              <span className="font-bold text-xs tabular-nums text-[#d96528]">
                {attemptCount} <span className="opacity-60 font-normal">/ 10</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:text-[#d96528] cursor-pointer transition-colors"
              style={{ color: 'var(--text-mut)' }}
              title="Close [ESC]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 1. Dynamic Objective Extraction */}
        <div
          className="p-3 border-l-3 text-xs rounded-xs"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: '#d96528',
          }}
        >
          <span className="text-[10px] font-bold text-[#d96528] uppercase tracking-wider block mb-1">
            MANDATORY MISSION OBJECTIVE:
          </span>
          <p
            className="font-display text-sm leading-snug font-medium"
            style={{ color: 'var(--text-pri)' }}
          >
            {level.objective}
          </p>
        </div>

        {/* 2. Baseline Machine State Diagnostic (Non-Spoiler) */}
        <div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1"
            style={{ color: 'var(--text-mut)' }}
          >
            <Eye size={12} className="text-[#d96528]" />
            <span>BASELINE TELEMETRY & INITIAL MACHINE STATE:</span>
          </span>
          <p
            className="text-xs p-3 leading-relaxed border rounded-xs"
            style={{
              backgroundColor: 'var(--modal-box-bg)',
              borderColor: 'var(--modal-box-border)',
              color: 'var(--modal-box-text)',
            }}
          >
            {notes?.diagnostic || level.briefing}
          </p>
        </div>

        {/* 3. Technician's Specific Operational Advice (Non-Spoiler) */}
        <div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1"
            style={{ color: 'var(--text-mut)' }}
          >
            <AlertTriangle size={12} className="text-[#d96528]" />
            <span>FIELD TECHNICIAN'S INVESTIGATIVE RECOMMENDATION:</span>
          </span>
          <div
            className="p-3 border-l-2 text-xs italic leading-relaxed rounded-xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: '#d96528',
              color: 'var(--text-pri)',
            }}
          >
            "{notes?.operationalAdvice || level.solutionHint}"
          </div>
        </div>

        {/* 4. Safety Verification Checkpoint */}
        <div>
          <div className="p-3 bg-[#132315] border border-[#2d5c33] text-[#86efac] text-xs space-y-1 rounded-xs">
            <span className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 text-[#4ade80]">
              <ShieldCheck size={12} />
              <span>SAFETY VERIFICATION PROTOCOL:</span>
            </span>
            <p className="leading-relaxed text-[#cbf4d2]">
              {notes?.verificationCheck ||
                'Recheck dial and gauge needles before releasing physical door latches or engaging master breakers.'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div
          className="pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <span
            className="text-[10px] uppercase font-bold"
            style={{ color: 'var(--text-mut)' }}
          >
            NOTE: ALL CONSEQUENCES ARE DETERMINISTIC
          </span>

          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#d96528] hover:bg-[#ea7535] text-white font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md rounded-xs"
          >
            RETURN TO APPARATUS [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
