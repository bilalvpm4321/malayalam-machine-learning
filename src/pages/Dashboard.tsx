import React from 'react';
import {
  Globe,
  HelpCircle,
  Database,
  Cpu,
  Layers,
  FileCheck2,
  PlayCircle,
  BarChart3,
  Server,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EXPERIMENT_CONFIGS, RESEARCH_PROJECT_INFO } from '../config/constants';
import { StatCard } from '../components/dashboard/StatCard';
import { ExperimentCard } from '../components/dashboard/ExperimentCard';
import { PageContainer } from '../components/layout/PageContainer';
import type { ExperimentConfigOption } from '../types/api';

export const Dashboard: React.FC = () => {
  const {
    setActivePage,
    setCurrentConfig,
    currentConfig,
    backendStatus,
    isMockMode,
  } = useApp();

  const handleSelectConfig = (cfg: ExperimentConfigOption) => {
    setCurrentConfig(cfg.id);
  };

  const handleRunTest = (cfg: ExperimentConfigOption) => {
    setCurrentConfig(cfg.id);
    setActivePage('playground');
  };

  return (
    <PageContainer>
      {/* Hero Research Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 mb-3">
            <span>M.Tech Thesis Research Project</span>
            <span>•</span>
            <span>IndicQA Malayalam Extractive QA</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {RESEARCH_PROJECT_INFO.projectTitle}
          </h2>

          <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {RESEARCH_PROJECT_INFO.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCurrentConfig('qlora');
                setActivePage('playground');
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
            >
              <PlayCircle className="h-4 w-4" />
              <span>Launch QA Playground</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('dataset')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
            >
              <Database className="h-4 w-4 text-emerald-500" />
              <span>Evaluate 13-Test Set</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('experiments')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
            >
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              <span>Comparison Matrix</span>
            </button>
          </div>
        </div>

        {/* Backend Status Notice */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-slate-400" />
            <span>
              Inference Hardware: <strong className="text-slate-700 dark:text-slate-300">{RESEARCH_PROJECT_INFO.hardware}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-slate-400" />
            <span>
              Backend Server:{' '}
              {backendStatus === 'connected' ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
              ) : isMockMode ? (
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Development Mock Mode Active</span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Offline (Colab inference disconnected)</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Experiment Summary Cards (Section 1: Prompt Requirements) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Experiment Summary Metrics
          </h3>
          <span className="text-xs text-slate-400">Initial Setup Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1 */}
          <StatCard
            label="Current Language"
            value="Malayalam"
            subtext="മലയാളം (AI4Bharat IndicQA)"
            icon={<Globe className="h-6 w-6" />}
            accentColor="emerald"
          />

          {/* Card 2 */}
          <StatCard
            label="Task"
            value="Question Answering"
            subtext="Extractive / Context-based QA"
            icon={<HelpCircle className="h-6 w-6" />}
            accentColor="blue"
          />

          {/* Card 3 */}
          <StatCard
            label="Dataset"
            value="IndicQA"
            subtext="AI4Bharat Multilingual Benchmark"
            icon={<Database className="h-6 w-6" />}
            accentColor="purple"
          />

          {/* Card 4 */}
          <StatCard
            label="Current Model"
            value="Qwen2.5-3B-Instruct"
            subtext="Alibaba Cloud 3 Billion Parameter"
            icon={<Cpu className="h-6 w-6" />}
            accentColor="indigo"
          />

          {/* Card 5 */}
          <StatCard
            label="Training Examples"
            value="70"
            subtext="QLoRA Fine-tuning subset"
            icon={<Layers className="h-6 w-6" />}
            accentColor="amber"
          />

          {/* Card 6 */}
          <StatCard
            label="Test Examples"
            value="13"
            subtext="Held-out evaluation split"
            icon={<FileCheck2 className="h-6 w-6" />}
            accentColor="rose"
          />
        </div>
      </section>

      {/* Model Configuration Cards (Section 1 & 11: Base LLM, QLoRA, RAG, RAG+QLoRA) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Experiment Configurations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select or test specific evaluation methodologies
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXPERIMENT_CONFIGS.map(config => (
            <ExperimentCard
              key={config.id}
              config={config}
              isSelected={currentConfig === config.id}
              onSelect={handleSelectConfig}
              onRunTest={handleRunTest}
            />
          ))}
        </div>
      </section>

      {/* Research Methodology & Flow Overview */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Experimental Workflow & Architecture
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">1</span>
              Dataset Preparation
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Extractive Question Answering pairs derived from AI4Bharat IndicQA Malayalam. Context passages contain native Malayalam Wikipedia texts.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">2</span>
              QLoRA PEFT Adaptation
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              4-bit quantized Low-Rank Adaptation (r=16, alpha=32) trained on 70 Malayalam samples on a Colab T4 (15GB) GPU, updating only ~0.14% parameters.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">3</span>
              Rigorous Evaluation
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Quantifying Exact Match (EM), Token F1 Score, and Semantic Similarity against ground truth answers returned strictly by the backend model.
            </p>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};
