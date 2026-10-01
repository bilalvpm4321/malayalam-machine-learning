import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { ExperimentConfigOption } from '../../types/api';
import { StatusBadge } from '../common/StatusBadge';

interface ExperimentCardProps {
  config: ExperimentConfigOption;
  isSelected?: boolean;
  onSelect?: (config: ExperimentConfigOption) => void;
  onRunTest?: (config: ExperimentConfigOption) => void;
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
  config,
  isSelected = false,
  onSelect,
  onRunTest,
}) => {
  const isAvailableOrExperimental = config.status === 'available' || config.status === 'experimental';

  return (
    <div
      onClick={() => onSelect && onSelect(config)}
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            {config.name}
          </h3>
          <StatusBadge status={config.status} />
        </div>

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px]">
          {config.description}
        </p>

        {/* Configuration Specs Matrix */}
        <div className="mt-4 space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Model:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title={config.model}>
              {config.model}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Fine-tuning:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title={config.finetuning}>
              {config.finetuning}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Retrieval:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title={config.retrieval}>
              {config.retrieval}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {isAvailableOrExperimental ? 'Ready for evaluation' : 'Under development'}
        </span>

        {onRunTest && isAvailableOrExperimental && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRunTest(config);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <span>Launch QA</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
