import React from 'react';
import type { ConfigStatus } from '../../types/api';

interface StatusBadgeProps {
  status: ConfigStatus | 'connected' | 'disconnected' | 'checking' | 'mock' | 'pass' | 'fail' | 'na';
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  pulse = false,
}) => {
  const getStyles = () => {
    switch (status) {
      case 'available':
      case 'connected':
      case 'pass':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300',
          dot: 'bg-emerald-500',
          text: label || (status === 'pass' ? 'PASS' : status === 'connected' ? 'Connected' : 'Available'),
        };
      case 'experimental':
      case 'mock':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300',
          dot: 'bg-indigo-500',
          text: label || (status === 'mock' ? 'MOCK MODE' : 'Experimental'),
        };
      case 'planned':
      case 'checking':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300',
          dot: 'bg-amber-500',
          text: label || (status === 'checking' ? 'Checking...' : 'Planned'),
        };
      case 'disconnected':
      case 'fail':
      case 'unavailable':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300',
          dot: 'bg-rose-500',
          text: label || (status === 'fail' ? 'FAIL' : status === 'disconnected' ? 'Disconnected' : 'Unavailable'),
        };
      case 'na':
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
          dot: 'bg-slate-400',
          text: label || 'Not available',
        };
    }
  };

  const current = getStyles();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${sizeClasses} tracking-wide`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${current.dot} ${pulse ? 'animate-ping' : ''}`}
      />
      {current.text}
    </span>
  );
};
