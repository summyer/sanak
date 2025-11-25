import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinate, Direction, GameState, GameStatus, AIComment, Difficulty } from './types';
import { GRID_SIZE, INITIAL_SNAKE, INITIAL_DIRECTION, KEY_MAPPINGS, MIN_SPEED, DIFFICULTY_CONFIG } from './constants';
import GridCell from './components/GridCell';
import Controls from './components/Controls';
import CommentaryPanel from './components/CommentaryPanel';
import { generateGameOverCommentary } from './services/geminiService';

// Utility to generate random food not on snake or obstacles
const generateFood = (snake: Coordinate[], obstacles: Coordinate[]): Coordinate => {
  let newFood: Coordinate;
  let isOccupied = true;
  while (isOccupied) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // eslint-disable-next-line no-loop-func
    isOccupied = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
                 obstacles.some(obs => obs.x === newFood.x && obs.y === newFood.y);
  }
  return newFood!;
};

// Utility to generate obstacles
const generateObstacle = (snake: Coordinate[], food: Coordinate, obstacles: Coordinate[]): Coordinate | null => {
  let attempts = 0;
  while (attempts < 20) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    
    // Avoid snake head area (give some buffer)
    const head = snake[0];
    const distanceToHead = Math.abs(x - head.x) + Math.abs(y - head.y);
    
    const isOccupied = snake.some(s => s.x === x && s.y === y) ||
                       (food.x === x && food.y === y) ||
                       obstacles.some(o => o.x === x && o.y === y) ||
                       distanceToHead < 4; // Don't spawn too close to head

    if (!isOccupied) return { x, y };
    attempts++;
  }
  return null;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: { x: 15, y: 15 },
    obstacles: [],
    direction: INITIAL_DIRECTION,
    nextDirection: INITIAL_DIRECTION,
    score: 0,
    highScore: 0,
    status: GameStatus.IDLE,
    speed: DIFFICULTY_CONFIG[Difficulty.EASY].speed,
    difficulty: Difficulty.EASY,
  });

  const [aiComment, setAiComment] = useState<AIComment | null>(null);
  const [loadingComment, setLoadingComment] = useState(false);

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const saved = localStorage.getItem('neon-snake-highscore');
    if (saved) {
      setGameState(prev => ({ ...prev, highScore: parseInt(saved, 10) }));
    }
  }, []);

  const handleGameOver = async (cause: 'wall' | 'self' | 'obstacle') => {
    setGameState(prev => ({ ...prev, status: GameStatus.GAME_OVER }));
    
    if (gameStateRef.current.score > gameStateRef.current.highScore) {
      localStorage.setItem('neon-snake-highscore', gameStateRef.current.score.toString());
      setGameState(prev => ({ ...prev, highScore: prev.score }));
    }

    setLoadingComment(true);
    const comment = await generateGameOverCommentary(gameStateRef.current.score, cause);
    setAiComment(comment);
    setLoadingComment(false);
  };

  const startGame = (difficulty: Difficulty) => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const initialSnake = INITIAL_SNAKE;
    const initialFood = generateFood(initialSnake, []);
    
    setGameState({
      snake: initialSnake,
      food: initialFood,
      obstacles: [],
      direction: INITIAL_DIRECTION,
      nextDirection: INITIAL_DIRECTION,
      score: 0,
      highScore: gameStateRef.current.highScore,
      status: GameStatus.PLAYING,
      speed: config.speed,
      difficulty: difficulty,
    });
    setAiComment(null);
  };

  const resetToMenu = () => {
    setGameState(prev => ({ ...prev, status: GameStatus.IDLE }));
    setAiComment(null);
  };

  const restartSameDifficulty = () => {
    startGame(gameStateRef.current.difficulty);
  };

  const moveSnake = useCallback(() => {
    const { snake, direction, nextDirection, food, obstacles, score, speed, difficulty } = gameStateRef.current;
    
    const currentDirection = nextDirection; 
    const head = snake[0];
    const newHead = { ...head };

    switch (currentDirection) {
      case Direction.UP: newHead.y -= 1; break;
      case Direction.DOWN: newHead.y += 1; break;
      case Direction.LEFT: newHead.x -= 1; break;
      case Direction.RIGHT: newHead.x += 1; break;
    }

    // Check Wall Collision
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      handleGameOver('wall');
      return;
    }

    // Check Self Collision
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      handleGameOver('self');
      return;
    }

    // Check Obstacle Collision
    if (obstacles.some(obs => obs.x === newHead.x && obs.y === newHead.y)) {
      handleGameOver('obstacle');
      return;
    }

    const newSnake = [newHead, ...snake];
    let newFood = food;
    let newScore = score;
    let newSpeed = speed;
    let newObstacles = obstacles;

    // Check Food Collision
    if (newHead.x === food.x && newHead.y === food.y) {
      newScore += 1;
      const config = DIFFICULTY_CONFIG[difficulty];
      
      // Update Speed
      newSpeed = Math.max(MIN_SPEED, speed - config.speedDecrement);
      
      // Attempt Obstacle Spawn
      if (Math.random() < config.obstacleChance) {
        const obs = generateObstacle(newSnake, food, obstacles);
        if (obs) {
          newObstacles = [...obstacles, obs];
        }
      }

      newFood = generateFood(newSnake, newObstacles);
    } else {
      newSnake.pop(); 
    }

    setGameState(prev => ({
      ...prev,
      snake: newSnake,
      food: newFood,
      obstacles: newObstacles,
      score: newScore,
      direction: currentDirection, 
      speed: newSpeed
    }));
  }, []);

  // Game Loop
  useEffect(() => {
    if (gameState.status !== GameStatus.PLAYING) return;

    const timer = setInterval(moveSnake, gameState.speed);
    return () => clearInterval(timer);
  }, [gameState.status, gameState.speed, moveSnake]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current.status !== GameStatus.PLAYING) return;

      const newDir = KEY_MAPPINGS[e.key];
      if (!newDir) return;

      const currentDir = gameStateRef.current.direction;
      const nextDir = gameStateRef.current.nextDirection;
      
      const isOpposite = (d1: Direction, d2: Direction) => {
        return (d1 === Direction.UP && d2 === Direction.DOWN) ||
               (d1 === Direction.DOWN && d2 === Direction.UP) ||
               (d1 === Direction.LEFT && d2 === Direction.RIGHT) ||
               (d1 === Direction.RIGHT && d2 === Direction.LEFT);
      };

      if (!isOpposite(currentDir, newDir) && !isOpposite(nextDir, newDir)) {
         setGameState(prev => ({ ...prev, nextDirection: newDir }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMobileControl = (dir: Direction) => {
    if (gameState.status !== GameStatus.PLAYING) return;

    const currentDir = gameStateRef.current.direction;
    const isOpposite = (d1: Direction, d2: Direction) => {
        return (d1 === Direction.UP && d2 === Direction.DOWN) ||
               (d1 === Direction.DOWN && d2 === Direction.UP) ||
               (d1 === Direction.LEFT && d2 === Direction.RIGHT) ||
               (d1 === Direction.RIGHT && d2 === Direction.LEFT);
    };

    if (!isOpposite(currentDir, dir)) {
         setGameState(prev => ({ ...prev, nextDirection: dir }));
    }
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isHead = gameState.snake[0].x === x && gameState.snake[0].y === y;
        const isSnake = gameState.snake.some(s => s.x === x && s.y === y);
        const isFood = gameState.food.x === x && gameState.food.y === y;
        const isObstacle = gameState.obstacles.some(o => o.x === x && o.y === y);
        
        cells.push(
          <GridCell 
            key={`${x}-${y}`} 
            isSnake={isSnake} 
            isHead={isHead}
            isFood={isFood}
            isObstacle={isObstacle}
            isGameOver={gameState.status === GameStatus.GAME_OVER}
          />
        );
      }
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2 tracking-tighter pixel-font drop-shadow-lg">
          NEON SNAKE
        </h1>
        <div className="flex gap-8 justify-center text-slate-300 font-mono text-xl">
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Score</span>
            <span className="font-bold text-emerald-400">{gameState.score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-500 uppercase tracking-widest">High Score</span>
            <span className="font-bold text-cyan-400">{gameState.highScore}</span>
          </div>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative group">
        <div className={`absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${gameState.status === GameStatus.GAME_OVER ? 'from-red-600 to-orange-600 opacity-75' : ''}`}></div>
        
        {/* Board */}
        <div 
          className="relative bg-slate-900 p-2 rounded-lg border border-slate-700 shadow-2xl"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gap: '1px',
            width: 'min(90vw, 400px)',
            height: 'min(90vw, 400px)',
          }}
        >
          {renderGrid()}
          
          {/* IDLE / START MENU Overlay */}
          {gameState.status === GameStatus.IDLE && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md z-20 rounded-lg p-6">
              <p className="text-emerald-400 font-bold text-xl mb-6 pixel-font">SELECT DIFFICULTY</p>
              
              <div className="flex flex-col gap-3 w-full max-w-[200px]">
                {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => startGame(diff)}
                    className={`px-4 py-3 font-bold rounded shadow-lg transition-all transform hover:scale-105 active:scale-95 border border-slate-600
                      ${diff === Difficulty.EASY ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : ''}
                      ${diff === Difficulty.MEDIUM ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : ''}
                      ${diff === Difficulty.HARD ? 'bg-red-600 hover:bg-red-500 text-white' : ''}
                    `}
                  >
                    {DIFFICULTY_CONFIG[diff].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GAME OVER Overlay */}
          {gameState.status === GameStatus.GAME_OVER && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md z-20 rounded-lg p-6">
               <p className="text-red-500 font-bold text-3xl mb-2 pixel-font">GAME OVER</p>
               <p className="text-slate-400 mb-6">Score: {gameState.score}</p>
               
               <div className="flex flex-col gap-3 w-full max-w-[200px]">
                 <button 
                  onClick={restartSameDifficulty}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded border border-slate-500 transition-all hover:scale-105 active:scale-95"
                >
                  TRY AGAIN
                </button>
                <button 
                  onClick={resetToMenu}
                  className="px-6 py-3 bg-transparent hover:bg-slate-800 text-slate-300 font-bold rounded border border-slate-600 transition-all hover:text-white"
                >
                  MENU
                </button>
               </div>
             </div>
          )}
        </div>
      </div>

      <Controls onDirectionChange={handleMobileControl} />
      
      <CommentaryPanel comment={aiComment} loading={loadingComment} />

    </div>
  );
};

export default App;