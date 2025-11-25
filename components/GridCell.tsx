import React, { memo } from 'react';

interface GridCellProps {
  isSnake: boolean;
  isHead: boolean;
  isFood: boolean;
  isObstacle: boolean;
  isGameOver: boolean;
}

const GridCell: React.FC<GridCellProps> = ({ isSnake, isHead, isFood, isObstacle, isGameOver }) => {
  let className = "w-full h-full rounded-sm transition-all duration-150 border border-slate-900/10 ";

  if (isHead) {
    className += isGameOver ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-10 scale-110" : "bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] z-10 scale-110";
  } else if (isSnake) {
    className += isGameOver ? "bg-red-900/50" : "bg-emerald-600/80";
  } else if (isFood) {
    className += "bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)] animate-pulse rounded-full scale-75";
  } else if (isObstacle) {
    className += "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] scale-90 border-2 border-slate-900";
  } else {
    className += "bg-slate-800/50";
  }

  return <div className={className}></div>;
};

export default memo(GridCell);