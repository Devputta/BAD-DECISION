import React, { useState } from 'react';
import { IncidentRecord } from '../types/game';

interface IncidentArchiveProps {
  incidents: IncidentRecord[];
  onBack: () => void;
}

export const IncidentArchive: React.FC<IncidentArchiveProps> = ({ incidents, onBack }) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    incidents.length > 0 ? incidents[0].id : null
  );

  const selectedIncident =
    incidents.find((i) => i.id === selectedId) || (incidents.length > 0 ? incidents[0] : null);

  // Calculate unique chambers failed
  const failedChambers = new Set(incidents.map((i) => i.levelNumber)).size;

  return (
    <div
      className="w-full font-mono transition-colors duration-150"
      style={{ color: 'var(--text-pri)' }}
    >
      {/* Archive Header */}
      <div
        className="flex items-baseline justify-between border-b pb-3 mb-6"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div>
          <div
            className="text-[10px] uppercase tracking-widest mb-1"
            style={{ color: 'var(--text-mut)' }}
          >
            PLANT FATALITY REGISTRY · CLASSIFIED
          </div>
          <h1
            className="text-xl sm:text-2xl font-display font-bold uppercase"
            style={{ color: 'var(--text-pri)' }}
          >
            Black Box Incident Archive
          </h1>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-xs text-[#d96528] hover:text-[#eb7b3d] font-bold uppercase transition-colors cursor-pointer"
        >
          ← Return to Console
        </button>
      </div>

      {/* Session Status Ledger */}
      <div className="mb-8">
        <div
          className="text-[11px] font-bold uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-mut)' }}
        >
          SESSION TELEMETRY STATUS
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-y py-3"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <span
              className="uppercase block text-[10px]"
              style={{ color: 'var(--text-mut)' }}
            >
              CHAMBERS WITH INCIDENTS
            </span>
            <span
              className="font-bold text-sm tabular-nums"
              style={{ color: 'var(--text-pri)' }}
            >
              {failedChambers < 10 ? `0${failedChambers}` : failedChambers} / 50
            </span>
          </div>
          <div>
            <span
              className="uppercase block text-[10px]"
              style={{ color: 'var(--text-mut)' }}
            >
              FAILURES RECORDED
            </span>
            <span
              className="font-bold text-sm tabular-nums"
              style={{ color: 'var(--text-pri)' }}
            >
              {incidents.length < 10 ? `0${incidents.length}` : incidents.length}
            </span>
          </div>
          <div>
            <span
              className="uppercase block text-[10px]"
              style={{ color: 'var(--text-mut)' }}
            >
              CORONER CLASSIFICATION
            </span>
            <span className="font-bold text-[#d96528] text-sm">
              {incidents.length === 0 ? 'CLEAN RECORD' : 'MULTIPLE BAD DECISIONS'}
            </span>
          </div>
        </div>
      </div>

      {/* Incident Records Registry */}
      <div>
        <div
          className="text-[11px] font-bold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-mut)' }}
        >
          INCIDENT RECORDS
        </div>

        {incidents.length === 0 ? (
          <div
            className="space-y-2 text-xs"
            style={{ color: 'var(--text-mut)' }}
          >
            <p className="italic mb-4" style={{ color: 'var(--text-sec)' }}>
              NO INCIDENTS RECORDED. ALL TESTS PRESERVED NOMINAL.
            </p>
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="flex items-center justify-between border-b py-2"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <span>0{n}</span>
                <span className="opacity-30">──────────────────────────────────────────</span>
                <span className="opacity-50">RECORD CLEAR</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Record List */}
            <div
              className="md:col-span-5 divide-y"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {incidents.map((inc, idx) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <button
                    key={inc.id || idx}
                    type="button"
                    onClick={() => setSelectedId(inc.id)}
                    className={`w-full text-left py-2.5 px-2 flex items-center justify-between text-xs transition-colors cursor-pointer rounded-xs ${
                      isSelected ? 'font-bold' : 'hover:text-[#d96528]'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--bg-card)' : 'transparent',
                      color: isSelected ? '#d96528' : 'var(--text-pri)',
                    }}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span
                        className="font-mono shrink-0"
                        style={{ color: 'var(--text-mut)' }}
                      >
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span className="truncate uppercase font-bold">
                        {inc.incidentTitle}
                      </span>
                    </div>
                    <span
                      className="text-[10px] shrink-0 ml-2"
                      style={{ color: 'var(--text-mut)' }}
                    >
                      CH-{inc.levelNumber < 10 ? `0${inc.levelNumber}` : inc.levelNumber}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Incident Report (Direct Typed Sheet) */}
            {selectedIncident && (
              <div
                className="md:col-span-7 border p-5 sm:p-6 text-xs space-y-4 rounded-xs shadow-sm"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-main)',
                  color: 'var(--text-pri)',
                }}
              >
                <div
                  className="border-b pb-3"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div
                    className="text-[10px] uppercase font-bold"
                    style={{ color: 'var(--text-mut)' }}
                  >
                    CHAMBER {selectedIncident.levelNumber < 10 ? `0${selectedIncident.levelNumber}` : selectedIncident.levelNumber} · {selectedIncident.levelTitle}
                  </div>
                  <h2 className="text-base sm:text-lg font-display font-bold text-[#c93b2b] uppercase mt-0.5">
                    {selectedIncident.incidentTitle}
                  </h2>
                </div>

                <div>
                  <span
                    className="text-[10px] font-bold uppercase block mb-1"
                    style={{ color: 'var(--text-mut)' }}
                  >
                    CAUSE
                  </span>
                  <p
                    className="leading-relaxed font-semibold"
                    style={{ color: 'var(--text-pri)' }}
                  >
                    {selectedIncident.incidentCause}
                  </p>
                </div>

                <div>
                  <span
                    className="text-[10px] font-bold uppercase block mb-1"
                    style={{ color: 'var(--text-mut)' }}
                  >
                    INCIDENT DESCRIPTION
                  </span>
                  <p
                    className="leading-relaxed italic border-l-2 border-[#c93b2b] pl-3 py-1 font-mono rounded-xs"
                    style={{
                      backgroundColor: 'var(--bg-slot)',
                      color: 'var(--text-pri)',
                    }}
                  >
                    "{selectedIncident.incidentReport}"
                  </p>
                </div>

                <div
                  className="pt-2 border-t flex items-center justify-between text-[10px]"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-mut)',
                  }}
                >
                  <span>
                    TRIGGERED ON MOVE: {selectedIncident.moveCount < 10 ? `0${selectedIncident.moveCount}` : selectedIncident.moveCount}
                  </span>
                  <span>RECORD PERMANENTLY PRESERVED</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
