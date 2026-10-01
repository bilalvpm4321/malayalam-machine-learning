import React from 'react';
import {
  Menu,
  Moon,
  Sun,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Research Dashboard',
    subtitle: 'Multilingual / Indic LLM Question Answering Evaluation Overview',
  },
  playground: {
    title: 'Question Answering Playground',
    subtitle: 'Extractive Malayalam QA Inference & Direct Model Evaluation',
  },
  dataset: {
    title: 'IndicQA Malayalam Test Evaluation',
    subtitle: 'Batch benchmark execution across the 13-example test split',
  },
  experiments: {
    title: 'Experiment Comparison',
    subtitle: 'Comparative matrix across Base LLM, QLoRA, RAG, and RAG+QLoRA',
  },
  metrics: {
    title: 'Evaluation Metrics & Methodology',
    subtitle: 'Comprehensive metric definitions, formulas, and experimental telemetry',
  },
  history: {
    title: 'Experiment History',
    subtitle: 'Audit trail of inference queries and benchmark evaluations',
  },
  settings: {
    title: 'Lab Settings & Connectivity',
    subtitle: 'Inference endpoints, mock mode, and default model configurations',
  },
};

export const Header: React.FC = () => {
  const {
    activePage,
    backendStatus,
    backendInfo,
    checkBackendHealth,
    isMockMode,
    isDarkMode,
    toggleDarkMode,
    setSidebarOpen,
    sidebarOpen,
  } = useApp();

  const currentInfo = PAGE_TITLES[activePage] || {
    title: 'Indic LLM Evaluation Lab',
    subtitle: 'M.Tech Research Platform',
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 md:px-6 backdrop-blur-md">
      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {currentInfo.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Backend Status Badge, Mock Mode, Theme Toggle */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mock Mode Indicator */}
        {isMockMode && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>MOCK MODE</span>
          </div>
        )}

        {/* Backend Connectivity Status */}
        <div className="flex items-center gap-1.5">
          {backendStatus === 'connected' ? (
            <div
              className="flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
              title={`Model: ${backendInfo?.model || 'Connected'}`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">Backend:</span>
              <span className="font-semibold">Connected</span>
            </div>
          ) : backendStatus === 'checking' ? (
            <div className="flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
              <RefreshCw className="h-3 w-3 animate-spin text-amber-600" />
              <span className="hidden sm:inline">Backend:</span>
              <span>Checking...</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 rounded-full border border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300"
              title="Backend unavailable. Start the inference server and try again."
            >
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="hidden sm:inline">Backend:</span>
              <span className="font-semibold">Disconnected</span>
            </div>
          )}

          {/* Quick Health Check Refresh */}
          <button
            type="button"
            onClick={() => checkBackendHealth()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Refresh backend status"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Theme Mode Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
