import React, { useState } from 'react';
import {
  Play,
  Download,
  ChevronDown,
  ChevronUp,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EXPERIMENT_CONFIGS } from '../config/constants';
import { INDICQA_MALAYALAM_TEST_SET } from '../data/indicqaMalayalam';
import { ApiService } from '../services/api';
import type { DatasetEvaluationResultItem, DatasetEvaluationSummary } from '../types/experiment';
import { PageContainer } from '../components/layout/PageContainer';
import { MetricCard } from '../components/common/MetricCard';

export const DatasetEvaluation: React.FC = () => {
  const {
    currentConfig,
    setCurrentConfig,
    currentLanguage,
    isMockMode,
    addHistoryRecord,
  } = useApp();

  const [selectedDataset] = useState<string>('IndicQA Malayalam');
  const [selectedSplit] = useState<string>('Test');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [totalItems] = useState<number>(INDICQA_MALAYALAM_TEST_SET.length); // 13 items
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [evaluationSummary, setEvaluationSummary] = useState<DatasetEvaluationSummary | null>(null);

  const runEvaluation = async () => {
    setIsRunning(true);
    setProgressIndex(0);
    setCurrentStep('Preparing dataset and initializing tokenizer...');

    const results: DatasetEvaluationResultItem[] = [];
    let correctCount = 0;
    let totalF1 = 0;
    let totalSimilarity = 0;
    let totalLatency = 0;

    await new Promise(resolve => setTimeout(resolve, 400));
    setCurrentStep('Evaluating questions with model...');

    for (let i = 0; i < INDICQA_MALAYALAM_TEST_SET.length; i++) {
      const item = INDICQA_MALAYALAM_TEST_SET[i];
      setProgressIndex(i + 1);

      try {
        const response = await ApiService.predict({
          language: currentLanguage,
          task: 'qa',
          configuration: currentConfig,
          context: item.context,
          question: item.question,
          expected_answer: item.expected_answer,
        });

        const emValue = response.exact_match ?? (response.answer.trim() === item.expected_answer.trim() ? 1 : 0);
        const f1Value = response.f1 ?? (emValue === 1 ? 1.0 : 0.0);
        const simValue = response.similarity ?? (emValue === 1 ? 1.0 : f1Value);
        const latVal = response.latency_ms || 0;

        if (emValue === 1) correctCount++;
        totalF1 += f1Value;
        totalSimilarity += simValue;
        totalLatency += latVal;

        results.push({
          id: item.id,
          question: item.question,
          context: item.context,
          expected_answer: item.expected_answer,
          prediction: response.answer,
          exact_match: emValue,
          f1: f1Value,
          similarity: simValue,
          latency_ms: latVal,
          status: 'success',
        });
      } catch (err: unknown) {
        const errObj = err as Error;
        results.push({
          id: item.id,
          question: item.question,
          context: item.context,
          expected_answer: item.expected_answer,
          prediction: 'Error: Inference failed',
          exact_match: 0,
          f1: 0,
          similarity: 0,
          latency_ms: 0,
          status: 'error',
          error_message: errObj.message,
        });
      }
    }

    setCurrentStep('Calculating aggregated metrics...');
    await new Promise(resolve => setTimeout(resolve, 300));

    const evaluatedCount = results.length;
    const emPct = evaluatedCount > 0 ? parseFloat(((correctCount / evaluatedCount) * 100).toFixed(2)) : 0;
    const avgF1Pct = evaluatedCount > 0 ? parseFloat(((totalF1 / evaluatedCount) * 100).toFixed(2)) : 0;
    const avgSim = evaluatedCount > 0 ? parseFloat((totalSimilarity / evaluatedCount).toFixed(2)) : 0;
    const avgLat = evaluatedCount > 0 ? Math.round(totalLatency / evaluatedCount) : 0;

    const summary: DatasetEvaluationSummary = {
      datasetName: selectedDataset,
      split: selectedSplit,
      configuration: currentConfig,
      language: currentLanguage,
      totalQuestions: totalItems,
      completedQuestions: evaluatedCount,
      correctCount,
      exactMatchPercent: emPct,
      averageF1Percent: avgF1Pct,
      averageSimilarity: avgSim,
      averageLatencyMs: avgLat,
      timestamp: new Date().toISOString(),
      results,
      isMock: isMockMode,
    };

    setEvaluationSummary(summary);
    setCurrentStep('Completed');
    setIsRunning(false);

    // Save summary record to history
    addHistoryRecord({
      language: 'Malayalam',
      languageCode: currentLanguage,
      task: 'qa',
      model: EXPERIMENT_CONFIGS.find(c => c.id === currentConfig)?.model || 'Qwen2.5-3B',
      configuration: currentConfig,
      dataset: `${selectedDataset} (${selectedSplit})`,
      exact_match: emPct / 100,
      f1: avgF1Pct / 100,
      similarity: avgSim,
      latency_ms: avgLat,
      status: 'Completed',
      notes: `Batch evaluation on ${totalItems} test examples. EM: ${emPct}%, Avg F1: ${avgF1Pct}%`,
      isDatasetRun: true,
      isMock: isMockMode,
    });
  };

  const toggleRow = (id: string) => {
    setExpandedRowId(prev => (prev === id ? null : id));
  };

  const exportCSV = () => {
    if (!evaluationSummary) return;

    const headers = ['ID', 'Question', 'Expected Answer', 'Prediction', 'Exact Match', 'F1 Score', 'Latency (ms)'];
    const rows = evaluationSummary.results.map(r => [
      r.id,
      `"${r.question.replace(/"/g, '""')}"`,
      `"${r.expected_answer.replace(/"/g, '""')}"`,
      `"${r.prediction.replace(/"/g, '""')}"`,
      r.exact_match ?? 'N/A',
      r.f1 !== null ? r.f1.toFixed(2) : 'N/A',
      r.latency_ms,
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `indicqa_ml_eval_${currentConfig}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer maxWidth="full">
      {/* Header Info */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 mb-2">
            <Database className="h-3.5 w-3.5" />
            <span>IndicQA Malayalam Test Split</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Dataset Evaluation
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Run the selected model configuration across the IndicQA Malayalam test set.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Dataset Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Dataset
            </label>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-200">
              {selectedDataset}
            </div>
          </div>

          {/* Split */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Split / Examples
            </label>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 flex justify-between">
              <span>{selectedSplit} Split</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">13 Examples</span>
            </div>
          </div>

          {/* Configuration Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Configuration
            </label>
            <select
              value={currentConfig}
              onChange={e => setCurrentConfig(e.target.value as any)}
              disabled={isRunning}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              {EXPERIMENT_CONFIGS.map(cfg => (
                <option
                  key={cfg.id}
                  value={cfg.id}
                  disabled={cfg.status === 'planned' || cfg.status === 'unavailable'}
                >
                  {cfg.name} ({cfg.status})
                </option>
              ))}
            </select>
          </div>

          {/* Run Action */}
          <div>
            <button
              type="button"
              onClick={runEvaluation}
              disabled={isRunning}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Evaluating ({progressIndex}/{totalItems})...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Run Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Progress Indicator */}
      {isRunning && (
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/40 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-900 dark:text-indigo-200">
              {currentStep}
            </span>
            <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
              Evaluating {progressIndex} / {totalItems}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900">
            <div
              className="h-full bg-indigo-600 transition-all duration-300 ease-out"
              style={{ width: `${(progressIndex / totalItems) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Summary Metrics Section (Displayed after evaluation runs) */}
      {evaluationSummary && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Evaluation Benchmark Results ({evaluationSummary.configuration.toUpperCase()})
              </h3>
              <p className="text-xs text-slate-500">
                Executed on {new Date(evaluationSummary.timestamp).toLocaleTimeString()} • IndicQA Malayalam Test Set
              </p>
            </div>

            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <MetricCard
              title="Total Questions"
              value={evaluationSummary.totalQuestions}
              subtext="IndicQA Test Split"
            />
            <MetricCard
              title="Correct"
              value={evaluationSummary.correctCount}
              unit={`/ ${evaluationSummary.totalQuestions}`}
              variant="success"
              subtext="Exact match hits"
            />
            <MetricCard
              title="Exact Match"
              value={evaluationSummary.exactMatchPercent !== null ? `${evaluationSummary.exactMatchPercent}%` : null}
              variant={evaluationSummary.exactMatchPercent && evaluationSummary.exactMatchPercent > 60 ? 'success' : 'default'}
              subtext="Strict string match"
            />
            <MetricCard
              title="Average F1"
              value={evaluationSummary.averageF1Percent !== null ? `${evaluationSummary.averageF1Percent}%` : null}
              variant="indigo"
              subtext="Token harmonic mean"
            />
            <MetricCard
              title="Average Latency"
              value={evaluationSummary.averageLatencyMs}
              unit="ms"
              subtext="Per-query inference"
            />
          </div>

          {/* Results Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 min-w-[220px]">Question (Malayalam)</th>
                    <th className="py-3 px-4 min-w-[160px]">Expected Answer</th>
                    <th className="py-3 px-4 min-w-[160px]">Model Prediction</th>
                    <th className="py-3 px-3 text-center">EM</th>
                    <th className="py-3 px-3 text-center">F1</th>
                    <th className="py-3 px-3 text-right">Latency</th>
                    <th className="py-3 px-3 text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                  {evaluationSummary.results.map((res, idx) => {
                    const isExpanded = expandedRowId === res.id;
                    const isExactMatch = res.exact_match === 1;

                    return (
                      <React.Fragment key={res.id}>
                        <tr
                          onClick={() => toggleRow(res.id)}
                          className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                        >
                          <td className="py-3 px-4 text-center font-mono text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 font-malayalam font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                            {res.question}
                          </td>
                          <td className="py-3 px-4 font-malayalam text-slate-600 dark:text-slate-300 max-w-xs truncate">
                            {res.expected_answer}
                          </td>
                          <td className="py-3 px-4 font-malayalam font-semibold max-w-xs truncate">
                            <span className={isExactMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}>
                              {res.prediction}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {isExactMatch ? (
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                                1
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-[10px]">
                                0
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            {res.f1 !== null ? res.f1.toFixed(2) : 'N/A'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                            {res.latency_ms} ms
                          </td>
                          <td className="py-3 px-3 text-center text-slate-400">
                            {isExpanded ? <ChevronUp className="h-4 w-4 inline" /> : <ChevronDown className="h-4 w-4 inline" />}
                          </td>
                        </tr>

                        {/* Expandable Row Drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
                            <td colSpan={8} className="p-4 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Context Passage
                                  </span>
                                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-malayalam leading-relaxed text-slate-800 dark:text-slate-200 max-h-48 overflow-y-auto">
                                    {res.context}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                      Full Malayalam Question
                                    </span>
                                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-malayalam text-slate-900 dark:text-slate-100 font-medium">
                                      {res.question}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Expected Ground Truth
                                      </span>
                                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-malayalam text-slate-700 dark:text-slate-300">
                                        {res.expected_answer}
                                      </div>
                                    </div>

                                    <div>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                        Model Output
                                      </span>
                                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-malayalam font-bold text-slate-900 dark:text-slate-100">
                                        {res.prediction}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-xs font-mono">
                                    <span>EM: <strong>{res.exact_match === 1 ? 'PASS (1.0)' : 'FAIL (0.0)'}</strong></span>
                                    <span>F1: <strong>{res.f1 !== null ? res.f1.toFixed(3) : 'N/A'}</strong></span>
                                    <span>Similarity: <strong>{res.similarity !== null ? res.similarity.toFixed(3) : 'N/A'}</strong></span>
                                    <span>Latency: <strong>{res.latency_ms} ms</strong></span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
