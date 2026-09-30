import React from 'react';
import { ConfidenceLevel } from '../../types.ts';

export const ConfidenceIndicator: React.FC<{ level: ConfidenceLevel; score?: number }> = ({
  level,
  score
}) => {
  const bars = level === 'HIGH' ? 3 : level === 'MEDIUM' ? 2 : 1;
  const color = level === 'HIGH' ? 'bg-emerald-400' : level === 'MEDIUM' ? 'bg-amber-400' : 'bg-rose-400';

  return (
    <div className="inline-flex items-center gap-1.5" title={`Confidence: ${level}`}>
      <div className="flex items-end gap-0.5 h-3">
        <div className={`w-1 rounded-sm ${bars >= 1 ? color : 'bg-slate-700'} h-1.5`} />
        <div className={`w-1 rounded-sm ${bars >= 2 ? color : 'bg-slate-700'} h-2.5`} />
        <div className={`w-1 rounded-sm ${bars >= 3 ? color : 'bg-slate-700'} h-3.5`} />
      </div>
      <span className="text-[11px] font-mono font-medium text-slate-300 uppercase">
        {level} {score ? `(${score}%)` : ''}
      </span>
    </div>
  );
};
