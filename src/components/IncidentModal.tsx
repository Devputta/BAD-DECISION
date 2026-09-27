import React, { useEffect } from 'react';
import { LevelConsequence } from '../types/game';

interface IncidentModalProps {
  consequence: LevelConsequence;
  levelNumber: number;
  levelTitle: string;
  onRetry: () => void;
  onMenu: () => void;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({
  consequence,
  levelNumber,
  levelTitle,
  onRetry,
  onMenu,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        onRetry();
      } else if (e.key === 'Escape') {
        onMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRetry, onMenu]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="incident-report-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs font-mono"
    >
      <div
        className="relative w-full max-w-lg border-2 p-6 sm:p-8 shadow-2xl space-y-4 rounded-xs transition-colors duration-150"
        style={{
          backgroundColor: 'var(--modal-bg)',
          borderColor: '#822a1f',
          color: 'var(--text-pri)',
        }}
      >
        {/* Incident Header */}
        <div
          className="border-b pb-3"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="text-[10px] uppercase tracking-widest"
            style={{ color: 'var(--text-mut)' }}
          >
            INCIDENT REPORT · CHAMBER {levelNumber < 10 ? `0${levelNumber}` : levelNumber} / {levelTitle}
          </div>
          <h2
            id="incident-report-title"
            className="text-lg sm:text-xl font-display font-bold text-[#c93b2b] uppercase mt-1 tracking-tight"
          >
            {consequence.incidentTitle || 'FATAL OPERATOR ERROR'}
          </h2>
        </div>

        {/* Narrative & Cause */}
        <div className="space-y-3 text-xs leading-relaxed">
          <div>
            <span
              className="text-[10px] font-bold uppercase block mb-1"
              style={{ color: 'var(--text-mut)' }}
            >
              CAUSE
            </span>
            <p style={{ color: 'var(--text-pri)' }}>
              {consequence.incidentCause || 'Violation of operational sequence.'}
            </p>
          </div>

          <div>
            <span
              className="text-[10px] font-bold uppercase block mb-1"
              style={{ color: 'var(--text-mut)' }}
            >
              RESULT
            </span>
            <p
              className="italic border-l-2 border-[#c93b2b] pl-3 py-1 font-mono rounded-xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-pri)',
              }}
            >
              "{consequence.incidentReport}"
            </p>
          </div>

          {consequence.advice && (
            <div
              className="pt-2 border-t"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <span className="text-[10px] font-bold text-[#d96528] uppercase block mb-1">
                OPERATIONAL LESSON
              </span>
              <p
                className="font-medium"
                style={{ color: 'var(--text-sec)' }}
              >
                {consequence.advice}
              </p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div
          className="pt-4 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <button
            type="button"
            onClick={onMenu}
            className="text-xs uppercase font-bold transition-colors cursor-pointer hover:text-[#d96528]"
            style={{ color: 'var(--text-mut)' }}
          >
            [ESC] CONSOLE
          </button>

          <button
            type="button"
            autoFocus
            onClick={onRetry}
            className="px-5 py-2.5 bg-[#c93b2b] hover:bg-[#a82a1d] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md rounded-xs"
          >
            [R] RETRY CHAMBER
          </button>
        </div>
      </div>
    </div>
  );
};
