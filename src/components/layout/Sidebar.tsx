import React from 'react';
import {
  LayoutDashboard,
  PlayCircle,
  Database,
  BarChart3,
  BookOpen,
  History as HistoryIcon,
  Settings,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  Server,
  Layers,
  Globe,
} from 'lucide-react';
import { type ActivePage, useApp } from '../../context/AppContext';
import { RESEARCH_PROJECT_INFO } from '../../config/constants';

interface NavItem {
  id: ActivePage;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'playground', label: 'Playground', icon: PlayCircle, badge: 'Main' },
  { id: 'dataset', label: 'Dataset Evaluation', icon: Database, badge: '13 Ex' },
  { id: 'experiments', label: 'Experiments', icon: BarChart3 },
  { id: 'metrics', label: 'Metrics', icon: BookOpen },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    sidebarOpen,
    setSidebarOpen,
    isMockMode,
  } = useApp();

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <FlaskConical className="h-5 w-5" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  AI Evaluation Lab
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Indic LLM Research
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActivePage(item.id);
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}
                />
                {sidebarOpen && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* System & Model Information Footer (Matching Prompt Requirements) */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
          {sidebarOpen ? (
            <div className="space-y-2 rounded-xl bg-white dark:bg-slate-800/80 p-3 border border-slate-200 dark:border-slate-700/60 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Layers className="h-3.5 w-3.5 text-indigo-500" />
                  Model:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]" title={RESEARCH_PROJECT_INFO.currentModel}>
                  Qwen 2.5 3B
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                  Language:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Malayalam
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Server className="h-3.5 w-3.5 text-amber-500" />
                  Environment:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {isMockMode ? 'Development' : 'Development'}
                </span>
              </div>

              <div className="pt-1 text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span>IndicQA Malayalam</span>
                <span className="font-mono">70 train / 13 test</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1 text-slate-400">
              <div title="Model: Qwen 2.5 3B" className="p-1 rounded bg-indigo-50 dark:bg-slate-800 text-indigo-600">
                <Layers className="h-4 w-4" />
              </div>
              <div title="Language: Malayalam" className="p-1 rounded bg-emerald-50 dark:bg-slate-800 text-emerald-600">
                <Globe className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
