import { IncidentRecord, UserProgress } from '../types/game';

const STORAGE_KEY = 'bad_decision_prog_v1';

const DEFAULT_PROGRESS: UserProgress = {
  unlockedLevels: 1,
  bestMoves: {},
  incidents: [],
  soundEnabled: true,
};

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;

    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return DEFAULT_PROGRESS;
    }

    // Validate unlockedLevels (integer between 1 and 50)
    let unlockedLevels = 1;
    if (typeof parsed.unlockedLevels === 'number' && parsed.unlockedLevels >= 1 && parsed.unlockedLevels <= 50) {
      unlockedLevels = Math.floor(parsed.unlockedLevels);
    }

    // Validate bestMoves (record of string -> positive integer)
    const bestMoves: Record<string, number> = {};
    if (typeof parsed.bestMoves === 'object' && parsed.bestMoves !== null) {
      for (const [key, val] of Object.entries(parsed.bestMoves)) {
        if (typeof key === 'string' && typeof val === 'number' && val > 0 && val < 999) {
          bestMoves[key] = Math.floor(val);
        }
      }
    }

    // Validate incidents array
    const incidents: IncidentRecord[] = [];
    if (Array.isArray(parsed.incidents)) {
      for (const inc of parsed.incidents) {
        if (
          inc &&
          typeof inc.id === 'string' &&
          typeof inc.levelNumber === 'number' &&
          typeof inc.incidentTitle === 'string' &&
          typeof inc.incidentReport === 'string'
        ) {
          incidents.push({
            id: String(inc.id).slice(0, 64),
            levelNumber: Number(inc.levelNumber) || 1,
            levelTitle: String(inc.levelTitle || '').slice(0, 100),
            incidentTitle: String(inc.incidentTitle).slice(0, 120),
            incidentReport: String(inc.incidentReport).slice(0, 500),
            incidentCause: String(inc.incidentCause || '').slice(0, 200),
            date: String(inc.date || '').slice(0, 50),
            moveCount: Number(inc.moveCount) || 1,
          });
        }
      }
    }

    const soundEnabled = typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true;

    // Validate levelAttempts
    const levelAttempts: Record<string, number> = {};
    if (typeof parsed.levelAttempts === 'object' && parsed.levelAttempts !== null) {
      for (const [key, val] of Object.entries(parsed.levelAttempts)) {
        if (typeof key === 'string' && typeof val === 'number' && val >= 0) {
          levelAttempts[key] = Math.floor(val);
        }
      }
    }

    return {
      unlockedLevels,
      bestMoves,
      incidents,
      soundEnabled,
      levelAttempts,
    };
  } catch (err) {
    console.warn('Failed to parse saved progress, falling back to clean state', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Failed to save game progress', err);
  }
}
