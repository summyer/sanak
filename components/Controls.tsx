import React from 'react';
import { Direction } from '../types';

interface ControlsProps {
  onDirectionChange: (dir: Direction) => void;
}

const Controls: React.FC<ControlsProps> = ({ onDirectionChange }) => {
  const btnClass = "w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center text-2xl text-white active:bg-emerald-500 active:scale-95 transition-all shadow-lg border border-slate-600 backdrop-blur-sm select-none touch-manipulation";

  return (
    <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
      <div />
      <button 
        className={btnClass} 
        onPointerDown={(e) => { e.preventDefault(); onDirectionChange(Direction.UP); }}
        aria-label="Up"
      >
        ▲
      </button>
      <div />
      
      <button 
        className={btnClass} 
        onPointerDown={(e) => { e.preventDefault(); onDirectionChange(Direction.LEFT); }}
        aria-label="Left"
      >
        ◀
      </button>
      <button 
        className={btnClass} 
        onPointerDown={(e) => { e.preventDefault(); onDirectionChange(Direction.DOWN); }}
        aria-label="Down"
      >
        ▼
      </button>
      <button 
        className={btnClass} 
        onPointerDown={(e) => { e.preventDefault(); onDirectionChange(Direction.RIGHT); }}
        aria-label="Right"
      >
        ▶
      </button>
    </div>
  );
};

export default Controls;