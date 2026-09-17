import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SnakeViewProps {
  selectedIndex: number;
  onSimulateScoreChange?: (score: number) => void;
}

interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CANVAS_WIDTH = 540;
const CANVAS_HEIGHT = 330;
const COLS = Math.floor(CANVAS_WIDTH / GRID_SIZE);
const ROWS = Math.floor(CANVAS_HEIGHT / GRID_SIZE);

export const SnakeView: React.FC<SnakeViewProps> = ({ selectedIndex }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mrbd_snake_high');
      return saved ? parseInt(saved, 10) : 120;
    } catch {
      return 120;
    }
  });
  const [gameState, setGameState] = useState<'idle' | 'running' | 'gameover'>('idle');

  const snakeRef = useRef<Point[]>([
    { x: 10, y: 8 },
    { x: 9, y: 8 },
    { x: 8, y: 8 },
  ]);
  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 18, y: 8 });

  const spawnFood = useCallback(() => {
    const snake = snakeRef.current;
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
      const onSnake = snake.some((seg) => seg.x === newFood.x && seg.y === newFood.y);
      if (!onSnake) break;
    }
    foodRef.current = newFood;
  }, []);

  const startGame = useCallback(() => {
    snakeRef.current = [
      { x: 10, y: 8 },
      { x: 9, y: 8 },
      { x: 8, y: 8 },
    ];
    directionRef.current = { x: 1, y: 0 };
    setScore(0);
    spawnFood();
    setGameState('running');
  }, [spawnFood]);

  // Arrow key controls listener for game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'running') {
        if (e.key === 'Enter' || e.key === ' ') {
          startGame();
        }
        return;
      }

      const current = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (current.y === 0) directionRef.current = { x: 0, y: -1 };
          e.preventDefault();
          break;
        case 'ArrowDown':
          if (current.y === 0) directionRef.current = { x: 0, y: 1 };
          e.preventDefault();
          break;
        case 'ArrowLeft':
          if (current.x === 0) directionRef.current = { x: -1, y: 0 };
          e.preventDefault();
          break;
        case 'ArrowRight':
          if (current.x === 0) directionRef.current = { x: 1, y: 0 };
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startGame]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'running') return;

    const interval = setInterval(() => {
      const snake = [...snakeRef.current];
      const dir = directionRef.current;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      // Wall collision or self collision
      if (
        head.x < 0 ||
        head.x >= COLS ||
        head.y < 0 ||
        head.y >= ROWS ||
        snake.some((seg) => seg.x === head.x && seg.y === head.y)
      ) {
        setGameState('gameover');
        setHighScore((prev) => {
          const nextHigh = Math.max(prev, score);
          try {
            localStorage.setItem('mrbd_snake_high', nextHigh.toString());
          } catch {}
          return nextHigh;
        });
        return;
      }

      snake.unshift(head);

      // Check food
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore((prev) => prev + 10);
        spawnFood();
      } else {
        snake.pop();
      }

      snakeRef.current = snake;
    }, 110);

    return () => clearInterval(interval);
  }, [gameState, score, spawnFood]);

  // Canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with additive display background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle grid dots
    ctx.fillStyle = 'rgba(0, 212, 255, 0.05)';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.fillRect(c * GRID_SIZE + 9, r * GRID_SIZE + 9, 2, 2);
      }
    }

    // Draw Food (additive emerald pulse)
    const food = foodRef.current;
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2 - 3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    const snake = snakeRef.current;
    snake.forEach((seg, idx) => {
      if (idx === 0) {
        // Head (Cyan glow)
        ctx.fillStyle = '#00d4ff';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = '#0088cc';
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(
        seg.x * GRID_SIZE + 2,
        seg.y * GRID_SIZE + 2,
        GRID_SIZE - 4,
        GRID_SIZE - 4,
      );
    });
    ctx.shadowBlur = 0;
  }, [gameState, score]);

  return (
    <div className="w-full h-full flex flex-col justify-between px-5 py-3 overflow-hidden">
      {/* Top Game Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            META ARCADE: SNAKE
          </span>
          <div className="text-[10px] font-mono text-zinc-400">
            D-PAD TEMPLE SWIPES CONTROL VECTOR
          </div>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-emerald-300 font-bold">SCORE: {score}</span>
          <span className="text-zinc-500">|</span>
          <span className="text-amber-400">BEST: {highScore}</span>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative rounded-lg border border-zinc-800 bg-[#0a0a0f] overflow-hidden flex items-center justify-center my-2 shadow-inner">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />

        {/* Overlay when idle or game over */}
        {gameState !== 'running' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center font-mono">
            <div className="text-xl font-bold text-white glow-cyan mb-1">
              {gameState === 'gameover' ? 'GAME OVER' : 'READY TO PLAY'}
            </div>
            <div className="text-xs text-zinc-400 mb-3">
              {gameState === 'gameover'
                ? `FINAL SCORE: ${score} PTS`
                : 'Control snake with Temple D-Pad Swipes'}
            </div>
            <button
              type="button"
              onClick={startGame}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all focusable ${
                selectedIndex === 0
                  ? 'bg-cyan-400 text-black shadow-[0_0_12px_#00d4ff] hud-focus-active'
                  : 'bg-[#1a1a2e] text-cyan-300 border border-cyan-500/50'
              }`}
            >
              PRESS [ENTER] TO START
            </button>
          </div>
        )}
      </div>

      {/* Footer Instructions / Action */}
      <div className="space-y-1.5 mt-auto">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">
          Controls: [Arrow Keys] = Steer • [ENTER] = Start/Restart
        </div>
        <button
          type="button"
          onClick={startGame}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 0 && gameState === 'running'
              ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500">[🎮]</span>
            <span>{gameState === 'running' ? 'Restart Snake' : 'Start New Game'}</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">ENTER</span>
        </button>
      </div>
    </div>
  );
};
