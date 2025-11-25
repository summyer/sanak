import React from 'react';
import { AIComment } from '../types';

interface CommentaryPanelProps {
  comment: AIComment | null;
  loading: boolean;
}

const CommentaryPanel: React.FC<CommentaryPanelProps> = ({ comment, loading }) => {
  if (!comment && !loading) return null;

  return (
    <div className="mt-6 w-full max-w-md p-4 bg-slate-800/80 border border-slate-700 rounded-lg shadow-xl backdrop-blur-md min-h-[100px] flex flex-col justify-center items-center text-center">
      <div className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        AI Commentary
      </div>
      
      {loading ? (
        <div className="flex gap-1 items-center h-6">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
        </div>
      ) : (
        <p className={`text-lg font-medium leading-tight ${
          comment?.mood === 'sarcastic' ? 'text-yellow-400' : 
          comment?.mood === 'happy' ? 'text-pink-400' : 'text-slate-200'
        }`}>
          "{comment?.text}"
        </p>
      )}
    </div>
  );
};

export default CommentaryPanel;