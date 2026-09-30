import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string | number;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'default' | 'critical' | 'warning' | 'success' | 'cyan';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  onClick
}) => {
  const variantStyles = {
    default: 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700',
    critical: 'border-rose-500/40 bg-gradient-to-br from-rose-950/40 to-slate-900/80 hover:border-rose-500/60',
    warning: 'border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-slate-900/80 hover:border-amber-500/60',
    success: 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-900/80 hover:border-emerald-500/50',
    cyan: 'border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 to-slate-900/80 hover:border-cyan-500/50'
  }[variant];

  const iconColors = {
    default: 'text-slate-400 bg-slate-800/80',
    critical: 'text-rose-400 bg-rose-950/80 border border-rose-500/30',
    warning: 'text-amber-400 bg-amber-950/80 border border-amber-500/30',
    success: 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/30',
    cyan: 'text-cyan-400 bg-cyan-950/80 border border-cyan-500/30'
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border p-4.5 transition-all duration-200 shadow-lg ${variantStyles} ${
        onClick ? 'cursor-pointer transform hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-white">
              {value}
            </span>
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400 font-sans">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${iconColors}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center gap-2 text-xs">
          <span
            className={`font-semibold font-mono ${
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          {trend.label && <span className="text-slate-500">{trend.label}</span>}
        </div>
      )}
    </div>
  );
};
