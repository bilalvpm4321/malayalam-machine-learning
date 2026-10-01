import React, { type ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: ReactNode;
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'purple' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  accentColor = 'indigo',
}) => {
  const getIconStyles = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60';
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60';
      case 'rose':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60';
      case 'indigo':
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60';
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${getIconStyles()}`}>
        {icon}
      </div>
      <div className="overflow-hidden">
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className="block mt-0.5 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
          {value}
        </span>
        {subtext && (
          <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
