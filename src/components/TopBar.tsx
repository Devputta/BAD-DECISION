import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface TopBarProps {
  currentView: string;
  incidentCount: number;
  soundEnabled: boolean;
  onNavigate: (view: 'MENU' | 'PLAYING' | 'ARCHIVE') => void;
  onToggleSound: () => void;
  onStartLatest: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  incidentCount,
  soundEnabled,
  onNavigate,
  onToggleSound,
  onStartLatest,
}) => {
  return (
    <header
      className="w-full border-b font-mono text-xs transition-colors duration-150 sticky top-0 z-40"
      style={{
        backgroundColor: 'var(--bg-app)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-pri)',
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 xl:px-12">
        {/* Primary Row */}
        <div className="h-14 flex items-center justify-between gap-3">
          {/* Brand Wordmark (Strictly single-line, whitespace-nowrap) */}
          <button
            type="button"
            onClick={() => onNavigate('MENU')}
            className="flex items-center gap-2.5 group cursor-pointer shrink-0"
            title="Return to Main Console"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#d96528] shadow-[0_0_8px_rgba(217,101,40,0.7)]" />
            <span
              className="font-display font-bold text-base sm:text-lg tracking-tight uppercase whitespace-nowrap group-hover:text-[#d96528] transition-colors"
              style={{ color: 'var(--text-pri)' }}
            >
              BAD DECISION
            </span>
          </button>

          {/* Desktop Navigation Links (Hidden on small mobile screens, visible on md+) */}
          <nav
            className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-mono font-bold"
            style={{ color: 'var(--text-mut)' }}
          >
            <button
              type="button"
              onClick={() => onNavigate('MENU')}
              className={`hover:text-[#d96528] transition-colors cursor-pointer uppercase py-1 ${
                currentView === 'MENU' ? 'text-[#d96528] border-b-2 border-[#d96528]' : ''
              }`}
            >
              CONSOLE
            </button>

            <button
              type="button"
              onClick={() => onNavigate('PLAYING')}
              className={`hover:text-[#d96528] transition-colors cursor-pointer uppercase py-1 ${
                currentView === 'PLAYING' ? 'text-[#d96528] border-b-2 border-[#d96528]' : ''
              }`}
            >
              APPARATUS
            </button>

            <button
              type="button"
              onClick={() => onNavigate('ARCHIVE')}
              className={`hover:text-[#d96528] transition-colors cursor-pointer uppercase py-1 ${
                currentView === 'ARCHIVE' ? 'text-[#d96528] border-b-2 border-[#d96528]' : ''
              }`}
            >
              INCIDENTS ({incidentCount})
            </button>
          </nav>

          {/* Controls Zone */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={onToggleSound}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xs border transition-colors cursor-pointer hover:border-[#d96528]"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
                color: soundEnabled ? '#d96528' : 'var(--text-mut)',
              }}
              title={soundEnabled ? 'Audio: Active' : 'Audio: Muted'}
              aria-label={soundEnabled ? 'Mute audio' : 'Enable audio'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 size={14} className="text-[#d96528]" />
                  <span className="hidden lg:inline text-[10px] font-bold">AUDIO ON</span>
                </>
              ) : (
                <>
                  <VolumeX size={14} className="opacity-50" />
                  <span className="hidden lg:inline text-[10px] opacity-60">MUTED</span>
                </>
              )}
            </button>

            <span
              className="hidden md:inline opacity-30"
              style={{ color: 'var(--text-mut)' }}
            >
              |
            </span>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={onStartLatest}
              className="text-[11px] sm:text-xs font-bold uppercase cursor-pointer px-3 py-1.5 rounded-xs bg-[#d96528] hover:bg-[#ea7535] text-white transition-colors shadow-xs whitespace-nowrap"
            >
              {currentView === 'PLAYING' ? '[R] RESET' : 'COMMENCE →'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip (Segmented tabs, only rendered on mobile < md) */}
        <div
          className="md:hidden flex items-center justify-between border-t py-1.5 gap-1.5 text-[11px]"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <button
            type="button"
            onClick={() => onNavigate('MENU')}
            className={`flex-1 text-center py-1.5 font-bold uppercase rounded-xs transition-colors cursor-pointer border ${
              currentView === 'MENU'
                ? 'bg-[#d96528] text-white border-[#d96528] shadow-xs'
                : 'hover:text-[#d96528]'
            }`}
            style={{
              backgroundColor: currentView === 'MENU' ? '#d96528' : 'var(--bg-card)',
              color: currentView === 'MENU' ? '#ffffff' : 'var(--text-mut)',
              borderColor: currentView === 'MENU' ? '#d96528' : 'var(--border-subtle)',
            }}
          >
            CONSOLE
          </button>

          <button
            type="button"
            onClick={() => onNavigate('PLAYING')}
            className={`flex-1 text-center py-1.5 font-bold uppercase rounded-xs transition-colors cursor-pointer border ${
              currentView === 'PLAYING'
                ? 'bg-[#d96528] text-white border-[#d96528] shadow-xs'
                : 'hover:text-[#d96528]'
            }`}
            style={{
              backgroundColor: currentView === 'PLAYING' ? '#d96528' : 'var(--bg-card)',
              color: currentView === 'PLAYING' ? '#ffffff' : 'var(--text-mut)',
              borderColor: currentView === 'PLAYING' ? '#d96528' : 'var(--border-subtle)',
            }}
          >
            APPARATUS
          </button>

          <button
            type="button"
            onClick={() => onNavigate('ARCHIVE')}
            className={`flex-1 text-center py-1.5 font-bold uppercase rounded-xs transition-colors cursor-pointer border ${
              currentView === 'ARCHIVE'
                ? 'bg-[#d96528] text-white border-[#d96528] shadow-xs'
                : 'hover:text-[#d96528]'
            }`}
            style={{
              backgroundColor: currentView === 'ARCHIVE' ? '#d96528' : 'var(--bg-card)',
              color: currentView === 'ARCHIVE' ? '#ffffff' : 'var(--text-mut)',
              borderColor: currentView === 'ARCHIVE' ? '#d96528' : 'var(--border-subtle)',
            }}
          >
            INCIDENTS ({incidentCount})
          </button>
        </div>
      </div>
    </header>
  );
};
