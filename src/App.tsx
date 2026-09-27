import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { GameMode, LevelConsequence, IncidentRecord, UserProgress } from './types/game';
import { LEVELS } from './levels/data';
import { loadProgress, saveProgress } from './storage/progress';
import { sound } from './audio/sound';
import { TopBar } from './components/TopBar';
import { TitleMenu } from './components/TitleMenu';
import { ControlRoom } from './components/ControlRoom';
import { IncidentModal } from './components/IncidentModal';
import { LevelVictoryModal } from './components/LevelVictoryModal';
import { IncidentArchive } from './components/IncidentArchive';
import { HintModal } from './components/HintModal';
import { DeclassifiedSolutionModal } from './components/DeclassifiedSolutionModal';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [mode, setMode] = useState<GameMode>('MENU');
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [levelState, setLevelState] = useState<Record<string, any>>(() => ({ ...LEVELS[0].initialState }));
  const [movesUsed, setMovesUsed] = useState<number>(0);
  const [activeConsequence, setActiveConsequence] = useState<LevelConsequence | null>(null);
  const [chartLogs, setChartLogs] = useState<{ time: string; text: string; alert?: boolean }[]>([
    { time: '00:00', text: 'SYSTEM INITIALIZED. INSTRUMENT RACK ONLINE.' },
  ]);

  // Hint & Declassified Solution State
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [declassifiedLevels, setDeclassifiedLevels] = useState<Record<string, boolean>>({});

  // Theme: Dark (Control Room Night Rig) / Light (Day Shift Archive Drafting)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bad_decision_theme') === 'light' ? 'light' : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('bad_decision_theme', theme);
  }, [theme]);

  const currentLevel = LEVELS[currentLevelIdx] || LEVELS[0];
  const attemptCount = progress.levelAttempts?.[currentLevel.id] || 0;
  const isDeclassified = !!declassifiedLevels[currentLevel.id] || attemptCount >= 9;

  // Sync sound controller with saved progress preference
  useEffect(() => {
    sound.setEnabled(progress.soundEnabled);
  }, [progress.soundEnabled]);

  // Persist progress changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const toggleSound = useCallback(() => {
    setProgress((prev) => {
      const nextSound = !prev.soundEnabled;
      sound.setEnabled(nextSound);
      if (nextSound) {
        sound.playSwitchClick();
      }
      return { ...prev, soundEnabled: nextSound };
    });
  }, []);

  const startLevel = useCallback((lvlNum: number) => {
    const targetIdx = Math.max(0, Math.min(LEVELS.length - 1, lvlNum - 1));
    const targetLevel = LEVELS[targetIdx];

    setCurrentLevelIdx(targetIdx);
    setLevelState({ ...targetLevel.initialState });
    setMovesUsed(0);
    setActiveConsequence(null);
    setShowHintModal(false);
    setShowSolutionModal(false);
    setChartLogs([
      { time: '00:00', text: `ENGAGED CHAMBER 0${targetLevel.levelNumber}: ${targetLevel.title}` },
      { time: '00:01', text: 'BASELINE SENSORS CALIBRATED.' },
    ]);
    setMode('PLAYING');
  }, []);

  const resetCurrentLevel = useCallback(() => {
    sound.playSwitchClick();
    setLevelState({ ...currentLevel.initialState });
    setMovesUsed(0);
    setActiveConsequence(null);
    setShowHintModal(false);
    setShowSolutionModal(false);
    setChartLogs((prev) => [
      ...prev.slice(-8),
      { time: `00:${String(movesUsed + 1).padStart(2, '0')}`, text: 'APPARATUS RESET TO BASELINE.' },
    ]);
    setMode('PLAYING');
  }, [currentLevel, movesUsed]);

  // Active pressure bleeding effect for Chamber 01
  useEffect(() => {
    if (mode !== 'PLAYING' || currentLevel.id !== 'level-01') return;
    if (levelState.reliefBypass !== 'BLEED' || (levelState.pressure ?? 800) <= 40) return;

    const timer = setInterval(() => {
      setLevelState((prev) => {
        if (prev.reliefBypass !== 'BLEED' || (prev.pressure ?? 800) <= 40) {
          clearInterval(timer);
          return prev;
        }
        const currentP = prev.pressure ?? 800;
        const nextPressure = Math.max(40, currentP - 40);
        return {
          ...prev,
          pressure: nextPressure,
        };
      });
    }, 110);

    return () => clearInterval(timer);
  }, [mode, currentLevel.id, levelState.reliefBypass, levelState.pressure]);

  const handleAction = useCallback(
    (objId: string, newValue: any) => {
      if (mode !== 'PLAYING') return;

      const newMoves = movesUsed + 1;
      setMovesUsed(newMoves);

      // Play special sound effects
      if (objId === 'reliefBypass' && newValue === 'BLEED') {
        sound.playSteamHiss();
      }

      // Identify object label for chart logging
      const matchedObj = currentLevel.objects.find((o) => o.id === objId);
      const optLabel =
        matchedObj?.options?.find((o) => o.value === newValue)?.label || String(newValue);

      // Evaluate consequences
      const consequence = currentLevel.evaluate(levelState, objId, newValue, newMoves);

      // Update state with resolved consequence nextState
      const resolvedState = consequence.nextState || {
        ...levelState,
        [objId]: newValue,
      };
      setLevelState(resolvedState);

      // Add log to strip chart
      const timeStr = `00:${String(newMoves).padStart(2, '0')}`;
      setChartLogs((prev) => [
        ...prev.slice(-10),
        {
          time: timeStr,
          text: `${matchedObj?.name || objId} → ${optLabel}`,
          alert: consequence.isFailure,
        },
      ]);

      // Handle Failure
      if (consequence.isFailure) {
        sound.playCatastrophe();
        setActiveConsequence(consequence);

        const newAttempts = (progress.levelAttempts?.[currentLevel.id] || 0) + 1;

        // Log into incident history
        const newIncident: IncidentRecord = {
          id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          levelNumber: currentLevel.levelNumber,
          levelTitle: currentLevel.title,
          incidentTitle: consequence.incidentTitle || 'OPERATOR BLUNDER',
          incidentReport: consequence.incidentReport || 'Apparatus failed due to incorrect procedure.',
          incidentCause: consequence.incidentCause || 'Violation of equipment rules.',
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          moveCount: newMoves,
        };

        setProgress((prev) => {
          const exists = prev.incidents.some((i) => i.incidentTitle === newIncident.incidentTitle);
          return {
            ...prev,
            incidents: exists ? prev.incidents : [newIncident, ...prev.incidents].slice(0, 50),
            levelAttempts: {
              ...(prev.levelAttempts || {}),
              [currentLevel.id]: newAttempts,
            },
          };
        });

        // If 9 failed attempts reached, 10th time shows the declassified answer!
        if (newAttempts >= 9) {
          setDeclassifiedLevels((prev) => ({ ...prev, [currentLevel.id]: true }));
        }

        setMode('FAILED');
        return;
      }

      // Handle Victory
      if (consequence.isVictory) {
        sound.playClearancePassed();
        setActiveConsequence(consequence);
        setMode('VICTORY');

        setProgress((prev) => {
          const nextUnlocked = Math.max(prev.unlockedLevels, currentLevel.levelNumber + 1);
          const currentBest = prev.bestMoves[currentLevel.id];
          const newBestMoves = {
            ...prev.bestMoves,
            [currentLevel.id]: currentBest ? Math.min(currentBest, newMoves) : newMoves,
          };

          return {
            ...prev,
            unlockedLevels: Math.min(LEVELS.length, nextUnlocked),
            bestMoves: newBestMoves,
          };
        });
        return;
      }

      // Check move limit expiration
      if (newMoves >= currentLevel.maxMoves) {
        sound.playCatastrophe();
        const timeoutConsequence: LevelConsequence = {
          isFailure: true,
          isVictory: false,
          incidentTitle: 'EXHAUSTED OPERATION CYCLE',
          incidentReport: `Operator exceeded the maximum permitted ${currentLevel.maxMoves} actions. The mechanical interlocks engaged emergency lockdown to prevent system strain.`,
          incidentCause: 'Indecisive or redundant actuator cycling.',
          advice: 'Plan your entire sequence before flipping the first lever. Efficiency matters.',
        };
        setActiveConsequence(timeoutConsequence);

        const newAttempts = (progress.levelAttempts?.[currentLevel.id] || 0) + 1;
        setProgress((prev) => ({
          ...prev,
          levelAttempts: {
            ...(prev.levelAttempts || {}),
            [currentLevel.id]: newAttempts,
          },
        }));

        if (newAttempts >= 9) {
          setDeclassifiedLevels((prev) => ({ ...prev, [currentLevel.id]: true }));
        }

        setMode('FAILED');
      }
    },
    [mode, movesUsed, currentLevel, levelState, progress.levelAttempts]
  );

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in an input, ignore
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Reset shortcut
      if (e.key === 'r' || e.key === 'R') {
        if (mode === 'PLAYING') {
          e.preventDefault();
          resetCurrentLevel();
        }
      }

      // Escape shortcut
      if (e.key === 'Escape') {
        if (showHintModal) {
          setShowHintModal(false);
          return;
        }
        if (showSolutionModal) {
          setShowSolutionModal(false);
          return;
        }
        if (mode !== 'MENU') {
          e.preventDefault();
          setMode('MENU');
        }
      }

      // Number keys 1-9 to trigger actuators during active play
      if (mode === 'PLAYING' && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key, 10) - 1;
        if (index < currentLevel.objects.length) {
          e.preventDefault();
          const targetObj = currentLevel.objects[index];
          const currentState =
            levelState[targetObj.id] !== undefined ? levelState[targetObj.id] : targetObj.state;

          if (targetObj.options && targetObj.options.length > 0) {
            const currentIdx = targetObj.options.findIndex((o) => o.value === currentState);
            const nextIdx = (currentIdx + 1) % targetObj.options.length;
            handleAction(targetObj.id, targetObj.options[nextIdx].value);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, currentLevel, levelState, handleAction, resetCurrentLevel, showHintModal, showSolutionModal]);

  const handleNextLevel = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      startLevel(currentLevelIdx + 2);
    } else {
      setMode('MENU');
    }
  };

  const handleRetryFromIncident = () => {
    // If the player has failed 9 times, on attempt 10 show the answer and give last attempt!
    if (attemptCount >= 9) {
      setShowSolutionModal(true);
    } else {
      resetCurrentLevel();
    }
  };

  const handleStartLastAttempt = () => {
    setDeclassifiedLevels((prev) => ({ ...prev, [currentLevel.id]: true }));
    setShowSolutionModal(false);
    resetCurrentLevel();
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-mono selection:bg-[#d96528] selection:text-white transition-colors duration-150 ${
        theme === 'light' ? 'theme-light' : ''
      }`}
      style={{
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-pri)',
      }}
    >
      {/* Universal Top Bar */}
      <TopBar
        currentView={mode}
        incidentCount={progress.incidents.length}
        soundEnabled={progress.soundEnabled}
        onNavigate={(view) => {
          if (view === 'PLAYING' && mode !== 'PLAYING') {
            startLevel(currentLevelIdx + 1);
          } else {
            setMode(view);
          }
        }}
        onToggleSound={toggleSound}
        onStartLatest={() => {
          if (mode === 'PLAYING') {
            resetCurrentLevel();
          } else {
            startLevel(1);
          }
        }}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full flex flex-col justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 xl:px-12 py-6 sm:py-8 flex flex-col flex-1 justify-center">
          {mode === 'MENU' && (
            <TitleMenu
              levels={LEVELS}
              unlockedLevels={progress.unlockedLevels}
              bestMoves={progress.bestMoves}
              incidentCount={progress.incidents.length}
              soundEnabled={progress.soundEnabled}
              onToggleSound={toggleSound}
              onStartLevel={startLevel}
              onOpenArchive={() => setMode('ARCHIVE')}
            />
          )}

          {(mode === 'PLAYING' || mode === 'FAILED' || mode === 'VICTORY') && (
            <ControlRoom
              level={currentLevel}
              levelState={levelState}
              movesUsed={movesUsed}
              maxMoves={currentLevel.maxMoves}
              gauges={currentLevel.gauges(levelState)}
              chartLogs={chartLogs}
              soundEnabled={progress.soundEnabled}
              attemptCount={attemptCount}
              isDeclassified={isDeclassified}
              onToggleSound={toggleSound}
              onAction={handleAction}
              onReset={resetCurrentLevel}
              onOpenArchive={() => setMode('ARCHIVE')}
              onSelectLevel={(lvl) => startLevel(lvl)}
              onOpenHint={() => setShowHintModal(true)}
              onOpenSolution={() => setShowSolutionModal(true)}
              unlockedLevels={progress.unlockedLevels}
            />
          )}

          {mode === 'ARCHIVE' && (
            <IncidentArchive
              incidents={progress.incidents}
              onBack={() => setMode('MENU')}
            />
          )}
        </div>
      </main>

      {/* Catastrophic Bad Decision Modal */}
      {mode === 'FAILED' && activeConsequence && !showSolutionModal && (
        <IncidentModal
          consequence={activeConsequence}
          levelNumber={currentLevel.levelNumber}
          levelTitle={currentLevel.title}
          onRetry={handleRetryFromIncident}
          onMenu={() => setMode('MENU')}
        />
      )}

      {/* 10th Attempt Declassified Solution Modal */}
      {showSolutionModal && (
        <DeclassifiedSolutionModal
          level={currentLevel}
          attemptNumber={Math.max(10, attemptCount + 1)}
          onStartLastAttempt={handleStartLastAttempt}
          onDismiss={() => setShowSolutionModal(false)}
        />
      )}

      {/* Technical Hint Modal */}
      {showHintModal && (
        <HintModal
          level={currentLevel}
          levelState={levelState}
          attemptCount={attemptCount}
          onClose={() => setShowHintModal(false)}
        />
      )}

      {/* Clearance Inspection Passed Modal */}
      {mode === 'VICTORY' && (
        <LevelVictoryModal
          levelNumber={currentLevel.levelNumber}
          levelTitle={currentLevel.title}
          movesUsed={movesUsed}
          parMoves={currentLevel.parMoves}
          isLastLevel={currentLevelIdx === LEVELS.length - 1}
          onNextLevel={handleNextLevel}
          onMenu={() => setMode('MENU')}
        />
      )}

      {/* Full-width bottom frame rule spanning edge-to-edge with attempt telemetry & theme toggle */}
      <footer
        className="w-full border-t font-mono text-[11px] py-2 mt-auto transition-colors duration-150"
        style={{
          backgroundColor: 'var(--bg-app)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-mut)',
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>1970S ANALOG LABORATORY RIG</span>
            <span style={{ color: 'var(--text-dim)' }}>·</span>
            <span>
              CHAMBER {currentLevel.levelNumber < 10 ? `0${currentLevel.levelNumber}` : currentLevel.levelNumber} ATTEMPTS: <span className="text-[#d96528] font-bold">{attemptCount}</span> / 10
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10px]">
            {/* Visual Light / Dark Mode Toggle */}
            <div
              className="flex items-center border rounded-xs p-0.5"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-main)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  sound.playSwitchClick();
                  setTheme('dark');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 font-bold uppercase transition-colors cursor-pointer rounded-xs ${
                  theme === 'dark'
                    ? 'bg-[#d96528] text-white shadow-xs'
                    : 'hover:text-[#d96528]'
                }`}
                style={{
                  color: theme === 'dark' ? '#ffffff' : 'var(--text-mut)',
                }}
                title="Switch to Dark Mode (Night Control Room)"
              >
                <Moon size={11} />
                <span>DARK</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playSwitchClick();
                  setTheme('light');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 font-bold uppercase transition-colors cursor-pointer rounded-xs ${
                  theme === 'light'
                    ? 'bg-[#d96528] text-white shadow-xs'
                    : 'hover:text-[#d96528]'
                }`}
                style={{
                  color: theme === 'light' ? '#ffffff' : 'var(--text-mut)',
                }}
                title="Switch to Light Mode (Day Drafting Office)"
              >
                <Sun size={11} />
                <span>LIGHT</span>
              </button>
            </div>

            <div
              className="hidden sm:flex items-center gap-2"
              style={{ color: 'var(--text-mut)' }}
            >
              <span>[1-9] ACTUATORS</span>
              <span style={{ color: 'var(--text-dim)' }}>·</span>
              <span>[R] RESET</span>
              <span style={{ color: 'var(--text-dim)' }}>·</span>
              <span>[ESC] CONSOLE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
