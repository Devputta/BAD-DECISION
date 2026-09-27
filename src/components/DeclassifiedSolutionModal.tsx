import React from 'react';
import { LevelDefinition } from '../types/game';

interface DeclassifiedSolutionModalProps {
  level: LevelDefinition;
  attemptNumber: number;
  onStartLastAttempt: () => void;
  onDismiss?: () => void;
}

export const DeclassifiedSolutionModal: React.FC<DeclassifiedSolutionModalProps> = ({
  level,
  attemptNumber,
  onStartLastAttempt,
  onDismiss,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="declassified-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs font-mono"
    >
      <div
        className="relative w-full max-w-xl border-2 p-6 sm:p-8 shadow-2xl space-y-5 rounded-xs transition-colors duration-150"
        style={{
          backgroundColor: 'var(--modal-bg)',
          borderColor: '#d96528',
          color: 'var(--text-pri)',
        }}
      >
        {/* Vintage Red Stamped Badge */}
        <div
          className="flex items-center justify-between pb-3 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <div className="text-[10px] text-[#d96528] font-bold uppercase tracking-widest">
              OFFICIAL PROTOCOL OVERRIDE · ATTEMPT {attemptNumber} / 10
            </div>
            <h2
              id="declassified-title"
              className="text-lg sm:text-xl font-display font-bold uppercase mt-1 tracking-tight"
              style={{ color: 'var(--text-pri)' }}
            >
              OPERATIONAL SOLUTION DECLASSIFIED
            </h2>
          </div>
          <span className="border border-[#c93b2b] text-[#c93b2b] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-xs">
            LAST CHANCE
          </span>
        </div>

        {/* Advisory */}
        <div
          className="p-3.5 border-l-3 border-[#d96528] text-xs leading-relaxed rounded-xs"
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-pri)',
          }}
        >
          <p className="font-bold text-[#d96528] mb-1 uppercase text-[10px]">
            FACILITY MEMORANDUM:
          </p>
          <p>
            You have failed this chamber {attemptNumber - 1} times. To avert catastrophic facility write-off, 
            command has declassified the verified mechanical sequence. You are granted one final operational 
            attempt to execute this procedure.
          </p>
        </div>

        {/* Verified Step-by-Step Answer / Solution */}
        <div>
          <span className="text-[11px] font-bold text-[#d96528] uppercase tracking-wider block mb-2">
            MANDATORY SOLUTION SEQUENCE:
          </span>
          <div
            className="p-3.5 space-y-2 text-xs border rounded-xs font-mono"
            style={{
              backgroundColor: 'var(--modal-box-bg)',
              borderColor: 'var(--modal-box-border)',
              color: 'var(--modal-box-text)',
            }}
          >
            {level.solutionSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="text-[#d96528] font-bold shrink-0">
                  0{idx + 1}.
                </span>
                <span className="leading-snug">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div
          className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="uppercase font-bold transition-colors cursor-pointer hover:text-[#d96528]"
              style={{ color: 'var(--text-mut)' }}
            >
              [ESC] RETURN TO APPARATUS
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            autoFocus
            onClick={onStartLastAttempt}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#d96528] hover:bg-[#ea7535] text-white font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md rounded-xs"
          >
            ENGAGE FINAL ATTEMPT 10/10 →
          </button>
        </div>
      </div>
    </div>
  );
};
