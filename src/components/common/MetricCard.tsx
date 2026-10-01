import React, { type ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number | null | undefined;
  unit?: string;
  description?: string;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'indigo' | 'warning';
  subtext?: string;
  isNotAvailableText?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  description,
  icon,
  variant = 'default',
  subtext,
  isNotAvailableText = 'Not available',
}) => {
  const isAvailable = value !== null && value !== undefined && value !== '';

  const getBorderColor = () => {
    if (!isAvailable) return 'border-slate-200 dark:border-slate-800';
    switch (variant) {
      case 'success':
        return 'border-emerald-200 dark:border-emerald-800/60';
      case 'indigo':
        return 'border-indigo-200 dark:border-indigo-800/60';
      case 'warning':
        return 'border-amber-200 dark:border-amber-800/60';
      default:
        return 'border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div
      className={`relative rounded-xl border bg-white dark:bg-slate-900 p-4 shadow-sm transition-all hover:shadow-md ${getBorderColor()}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {icon && <div className="text-slate-400 dark:text-slate-500">{icon}</div>}
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        {isAvailable ? (
          <>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </>
        ) : (
          <span className="text-sm font-medium italic text-slate-400 dark:text-slate-500">
            {isNotAvailableText}
          </span>
        )}
      </div>

      {(description || subtext) && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
          {subtext || description}
        </div>
      )}
    </div>
  );
};
