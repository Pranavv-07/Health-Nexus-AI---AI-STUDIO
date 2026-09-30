import React from 'react';
import { Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DataReliabilityBadgeProps {
  score: number;
  status: 'HIGH' | 'MEDIUM' | 'LOW';
  freshnessMinutes?: number;
  compact?: boolean;
}

export const DataReliabilityBadge: React.FC<DataReliabilityBadgeProps> = ({
  score,
  status,
  freshnessMinutes,
  compact = false
}) => {
  const isHigh = status === 'HIGH';
  const isMedium = status === 'MEDIUM';

  const badgeStyles = isHigh
    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
    : isMedium
    ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
    : 'bg-rose-950/70 text-rose-300 border-rose-500/40';

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${badgeStyles}`}>
        <Activity className="w-3 h-3" />
        <span>{score}% Reliability</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-mono ${badgeStyles}`}>
      {isHigh ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      )}
      <span className="font-semibold">{score}% Reliable</span>
      {freshnessMinutes !== undefined && (
        <span className="text-slate-400 font-sans border-l border-slate-700/60 pl-2">
          Sync: {freshnessMinutes}m ago
        </span>
      )}
    </div>
  );
};
