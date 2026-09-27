export type GameMode = 'MENU' | 'PLAYING' | 'FAILED' | 'VICTORY' | 'ARCHIVE' | 'HOW_TO_PLAY';

export interface InteractiveObject {
  id: string;
  name: string;
  type: 'toggle' | 'lever' | 'dial' | 'plunger' | 'key' | 'breaker';
  label: string;
  state: any; // string, number, or boolean
  options?: { value: any; label: string }[];
  hint?: string;
  dangerous?: boolean;
}

export interface TelemetryGauge {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  value: number;
  dangerLow?: number;
  dangerHigh?: number;
  optimalMin?: number;
  optimalMax?: number;
  format?: (val: number) => string;
}

export interface LevelConsequence {
  isFailure: boolean;
  isVictory: boolean;
  nextState?: Record<string, any>;
  incidentTitle?: string;
  incidentReport?: string;
  incidentCause?: string;
  advice?: string;
}

export interface LevelDefinition {
  id: string;
  levelNumber: number;
  title: string;
  subtitle: string;
  theme: string;
  objective: string;
  briefing: string;
  warningNote: string;
  solutionHint: string;
  solutionSteps: string[];
  technicianNotes?: {
    diagnostic: string;
    operationalAdvice: string;
    verificationCheck: string;
  };
  maxMoves: number;
  parMoves: number;
  initialState: Record<string, any>;
  objects: InteractiveObject[];
  gauges: (state: Record<string, any>) => TelemetryGauge[];
  statusMessage: (state: Record<string, any>, movesUsed: number) => string;
  evaluate: (state: Record<string, any>, actionId: string, newValue: any, movesUsed: number) => LevelConsequence;
}

export interface IncidentRecord {
  id: string;
  levelNumber: number;
  levelTitle: string;
  incidentTitle: string;
  incidentReport: string;
  incidentCause: string;
  date: string;
  moveCount: number;
}

export interface UserProgress {
  unlockedLevels: number; // 1 to 50
  bestMoves: Record<string, number>;
  incidents: IncidentRecord[];
  soundEnabled: boolean;
  levelAttempts?: Record<string, number>;
}
