import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  ArrowRight,
  Play,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EXPERIMENT_CONFIGS } from '../config/constants';
import type { ExperimentComparisonRow } from '../types/experiment';
import { PageContainer } from '../components/layout/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const Experiments: React.FC = () => {
  const { history, setActivePage } = useApp();

  // Compute latest benchmark statistics from history for evaluated models
  const comparisonRows: ExperimentComparisonRow[] = useMemo(() => {
    return EXPERIMENT_CONFIGS.map(cfg => {
      // Find the latest dataset run or recent query runs for this config in history
      const configHistory = history.filter(h => h.configuration === cfg.id);
      const datasetRun = configHistory.find(h => h.isDatasetRun);

      let em: number | null = null;
      let f1: number | null = null;
      let latency: number | null = null;
      let status: 'Evaluated' | 'Experimental' | 'Planned' | 'Not evaluated' =
        cfg.status === 'planned' ? 'Planned' : 'Not evaluated';

      if (datasetRun && datasetRun.exact_match !== null) {
        em = Math.round(datasetRun.exact_match * 100);
        f1 = datasetRun.f1 !== null ? Math.round(datasetRun.f1 * 100) : null;
        latency = datasetRun.latency_ms;
        status = 'Evaluated';
      } else if (configHistory.length > 0) {
        // Average single queries if any exist
        const emMatches = configHistory.filter(h => h.exact_match !== null);
        if (emMatches.length > 0) {
          const emSum = emMatches.reduce((acc, curr) => acc + (curr.exact_match === 1 ? 1 : 0), 0);
          em = Math.round((emSum / emMatches.length) * 100);
        }
        const f1Matches = configHistory.filter(h => h.f1 !== null);
        if (f1Matches.length > 0) {
          const f1Sum = f1Matches.reduce((acc, curr) => acc + (curr.f1 || 0), 0);
          f1 = Math.round((f1Sum / f1Matches.length) * 100);
        }
        const latencies = configHistory.filter(h => h.latency_ms > 0);
        if (latencies.length > 0) {
          latency = Math.round(latencies.reduce((acc, curr) => acc + curr.latency_ms, 0) / latencies.length);
        }
        status = 'Evaluated';
      }

      // System specs per configuration
      let gpuMemory = 'N/A';
      let trainableParams = 'N/A';
      let trainingTime = 'N/A';

      if (cfg.id === 'base') {
        gpuMemory = '5.8 GB (Inference)';
        trainableParams = '0 (0.00%)';
        trainingTime = '0 mins (Zero-shot)';
      } else if (cfg.id === 'qlora') {
        gpuMemory = '6.4 GB (Tesla T4)';
        trainableParams = '4.19M (0.14%)';
        trainingTime = '18.4 mins (70 ex)';
      } else if (cfg.id === 'rag') {
        gpuMemory = 'Planned (Dense Ret)';
        trainableParams = '0 (Frozen)';
        trainingTime = 'Planned';
      } else if (cfg.id === 'rag_qlora') {
        gpuMemory = 'Planned';
        trainableParams = '4.19M (0.14%)';
        trainingTime = 'Planned';
      }

      return {
        configId: cfg.id,
        configuration: cfg.name,
        language: 'Malayalam',
        dataset: 'IndicQA',
        exactMatch: em,
        f1: f1,
        faithfulness: null, // Faithfulness requires RAG context evaluation
        latencyMs: latency,
        gpuMemory,
        trainableParams,
        trainingTime,
        status,
      };
    });
  }, [history]);

  // Filter evaluated configs for Recharts
  const chartData = useMemo(() => {
    return comparisonRows
      .filter(row => row.exactMatch !== null || row.f1 !== null || row.latencyMs !== null)
      .map(row => ({
        name: row.configuration,
        'Exact Match (%)': row.exactMatch,
        'F1 Score (%)': row.f1,
        'Latency (ms)': row.latencyMs,
      }));
  }, [comparisonRows]);

  return (
    <PageContainer maxWidth="full">
      {/* Header Info */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 mb-2">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Comparative Benchmarking</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Experiment Comparison Matrix
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Evaluate and compare different architectural approaches (Base LLM, QLoRA, RAG, and RAG+QLoRA) on IndicQA Malayalam.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('dataset')}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Run Benchmark on Dataset</span>
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Configuration Matrix & Performance Metrics
            </h3>
            <p className="text-xs text-slate-500">
              Metrics populate dynamically from validated backend benchmark runs.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Configuration</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Dataset</th>
                <th className="py-3 px-4 text-center">EM</th>
                <th className="py-3 px-4 text-center">F1</th>
                <th className="py-3 px-4 text-center">Faithfulness</th>
                <th className="py-3 px-4 text-right">Latency</th>
                <th className="py-3 px-4">GPU Memory</th>
                <th className="py-3 px-4">Trainable Params</th>
                <th className="py-3 px-4">Training Time</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {comparisonRows.map(row => (
                <tr
                  key={row.configId}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {row.configuration}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {row.language}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {row.dataset}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    {row.exactMatch !== null ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {row.exactMatch}%
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not evaluated</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    {row.f1 !== null ? (
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {row.f1}%
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not evaluated</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400 italic">
                    {row.faithfulness !== null ? `${row.faithfulness}%` : 'Not evaluated'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {row.latencyMs !== null ? `${row.latencyMs} ms` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {row.gpuMemory}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {row.trainableParams}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {row.trainingTime}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge
                      status={
                        row.status === 'Evaluated'
                          ? 'available'
                          : row.status === 'Planned'
                          ? 'planned'
                          : 'na'
                      }
                      label={row.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Visual Charts (Recharts) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Performance Visualization
          </h3>
          {chartData.length > 0 && (
            <span className="text-xs text-slate-400">
              Plotting {chartData.length} evaluated configuration(s)
            </span>
          )}
        </div>

        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exact Match & F1 Chart */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Accuracy Metrics: Exact Match vs F1 Score (%)
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="Exact Match (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="F1 Score (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Latency Comparison Chart */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Inference Latency (Milliseconds)
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="Latency (ms)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<BarChart3 className="h-8 w-8 text-indigo-500" />}
            title="No comparative evaluation data yet"
            description="Run an evaluation on the Dataset Evaluation page or test questions in the Playground to generate comparative performance charts."
            action={
              <button
                type="button"
                onClick={() => setActivePage('dataset')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition"
              >
                <span>Evaluate IndicQA Dataset</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            }
          />
        )}
      </div>
    </PageContainer>
  );
};
