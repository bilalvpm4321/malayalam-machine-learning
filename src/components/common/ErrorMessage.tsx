import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw, Settings } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  onOpenSettings?: () => void;
  variant?: 'error' | 'warning';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Inference Error',
  message,
  details,
  onRetry,
  onOpenSettings,
  variant = 'error',
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const isWarning = variant === 'warning';
  const containerClasses = isWarning
    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200';

  const iconClasses = isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${containerClasses}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${iconClasses}`} />
        <div className="flex-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{message}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 dark:bg-rose-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Request
              </button>
            )}

            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                <Settings className="h-3.5 w-3.5" />
                Configure API URL / Mock Mode
              </button>
            )}

            {details && (
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:underline"
              >
                <span>{showDetails ? 'Hide Technical Details' : 'View Technical Details'}</span>
                {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>

          {showDetails && details && (
            <div className="mt-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-white/70 dark:bg-slate-900/80 p-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Technical Stack / Server Response:
              </span>
              <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all overflow-x-auto">
                {details}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
