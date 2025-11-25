import { Coordinate, Direction, Difficulty } from './types';

export const GRID_SIZE = 20; // 20x20 grid
export const MIN_SPEED = 50; // Fastest speed

export const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: {
    label: '简单',
    speed: 200,
    speedDecrement: 1,
    obstacleChance: 0,
  },
  [Difficulty.MEDIUM]: {
    label: '中等',
    speed: 150,
    speedDecrement: 2,
    obstacleChance: 0.3,
  },
  [Difficulty.HARD]: {
    label: '困难',
    speed: 100,
    speedDecrement: 4,
    obstacleChance: 0.6,
  }
};

export const INITIAL_SNAKE: Coordinate[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

export const INITIAL_DIRECTION = Direction.UP;

export const KEY_MAPPINGS: Record<string, Direction> = {
  ArrowUp: Direction.UP,
  w: Direction.UP,
  W: Direction.UP,
  ArrowDown: Direction.DOWN,
  s: Direction.DOWN,
  S: Direction.DOWN,
  ArrowLeft: Direction.LEFT,
  a: Direction.LEFT,
  A: Direction.LEFT,
  ArrowRight: Direction.RIGHT,
  d: Direction.RIGHT,
  D: Direction.RIGHT,
};