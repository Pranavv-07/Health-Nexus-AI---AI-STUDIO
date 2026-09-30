import React from 'react';
import { RiskLevel } from '../../types.ts';
import { AlertTriangle, CheckCircle, Flame, Info, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  showIcon = true,
  size = 'md',
  pulse = false
}) => {
  const configs: Record<RiskLevel, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
    CRITICAL: {
      bg: 'bg-rose-950/80',
      text: 'text-rose-300',
      border: 'border-rose-500/50',
      icon: <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />,
      label: 'CRITICAL'
    },
    HIGH: {
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />,
      label: 'HIGH RISK'
    },
    MEDIUM: {
      bg: 'bg-orange-950/60',
      text: 'text-orange-300',
      border: 'border-orange-500/30',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />,
      label: 'MEDIUM'
    },
    LOW: {
      bg: 'bg-sky-950/60',
      text: 'text-sky-300',
      border: 'border-sky-500/30',
      icon: <Info className="w-3.5 h-3.5 text-sky-400" />,
      label: 'LOW RISK'
    },
    NORMAL: {
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      border: 'border-emerald-500/30',
      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
      label: 'NORMAL'
    }
  };

  const cfg = configs[level] || configs.NORMAL;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded-md border backdrop-blur-sm ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses} ${
        pulse && level === 'CRITICAL' ? 'ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/50' : ''
      }`}
    >
      {showIcon && cfg.icon}
      <span>{cfg.label}</span>
    </span>
  );
};
