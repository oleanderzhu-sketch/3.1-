export enum GameMode {
  CLASSIC = 'CLASSIC',
  TIME = 'TIME',
}

export enum Difficulty {
  SLOW = 12,
  MEDIUM = 8,
  FAST = 5,
}

export interface BlockData {
  id: string;
  value: number;
  row: number;
  col: number;
}

export interface GameState {
  grid: BlockData[];
  score: number;
  target: number;
  selectedIds: string[];
  isGameOver: boolean;
  mode: GameMode | null;
  timeLeft: number;
  combo: number;
  difficulty: Difficulty;
}

export const GRID_ROWS = 10;
export const GRID_COLS = 6;
export const INITIAL_ROWS = 4;
