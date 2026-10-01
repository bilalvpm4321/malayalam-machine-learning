import React from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { Playground } from './pages/Playground';
import { DatasetEvaluation } from './pages/DatasetEvaluation';
import { Experiments } from './pages/Experiments';
import { Metrics } from './pages/Metrics';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  const { activePage, sidebarOpen } = useApp();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'playground':
        return <Playground />;
      case 'dataset':
        return <DatasetEvaluation />;
      case 'experiments':
        return <Experiments />;
      case 'metrics':
        return <Metrics />;
      case 'history':
        return <History />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Page Area (Offset based on sidebar width on md+ screens) */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-20'
        }`}
      >
        <Header />
        <div className="flex-1 pb-12">
          {renderPage()}
        </div>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>
              Indic LLM Evaluation Lab • M.Tech Research Project (Malayalam QA & IndicQA Benchmark)
            </span>
            <span className="font-mono text-[11px]">
              Qwen2.5-3B-Instruct • QLoRA (NF4) • Tesla T4
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
