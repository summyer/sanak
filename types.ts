export interface Coordinate {
  x: number;
  y: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface GameState {
  snake: Coordinate[];
  food: Coordinate;
  obstacles: Coordinate[];
  direction: Direction;
  nextDirection: Direction; // Prevent multiple turns in one tick
  score: number;
  highScore: number;
  status: GameStatus;
  speed: number;
  difficulty: Difficulty;
}

export interface AIComment {
  text: string;
  mood: 'neutral' | 'happy' | 'sarcastic' | 'encouraging';
}