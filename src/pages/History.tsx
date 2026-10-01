import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Trash2,
  Download,
  Filter,
  Eye,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ExperimentRecord } from '../types/experiment';
import { PageContainer } from '../components/layout/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const History: React.FC = () => {
  const { history, clearHistory, deleteHistoryRecord, setActivePage } = useApp();

  const [selectedRecord, setSelectedRecord] = useState<ExperimentRecord | null>(null);
  const [filterConfig, setFilterConfig] = useState<string>('all');

  const filteredHistory = history.filter(item => {
    if (filterConfig === 'all') return true;
    return item.configuration === filterConfig;
  });

  const exportHistoryJson = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `indic_llm_experiment_history_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer maxWidth="full">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 mb-2">
              <HistoryIcon className="h-3.5 w-3.5" />
              <span>Experiment Audit Trail</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Experiment History
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Complete audit log of single-query inference runs and full-dataset benchmarks executed in this session.
            </p>
          </div>

          {history.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportHistoryJson}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={clearHistory}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        {history.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Filter by Configuration:
            </span>
            <select
              value={filterConfig}
              onChange={e => setFilterConfig(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Configurations ({history.length})</option>
              <option value="base">Base LLM</option>
              <option value="qlora">QLoRA</option>
              <option value="rag">RAG</option>
              <option value="rag_qlora">RAG + QLoRA</option>
            </select>
          </div>
        )}
      </div>

      {/* History Table or Empty State */}
      {filteredHistory.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Experiment ID</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">Configuration</th>
                  <th className="py-3 px-4">Dataset</th>
                  <th className="py-3 px-3 text-center">EM</th>
                  <th className="py-3 px-3 text-center">F1</th>
                  <th className="py-3 px-4 text-right">Latency</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHistory.map(record => (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {record.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(record.timestamp).toLocaleDateString()} {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {record.language}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-slate-500 font-mono text-[11px]">
                      {record.task}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                      {record.model}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 uppercase">
                      {record.configuration}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {record.dataset}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      {record.exact_match !== null ? (
                        <span className={record.exact_match === 1 ? 'text-emerald-600 font-bold' : 'text-slate-600'}>
                          {record.exact_match === 1 ? '1.0' : typeof record.exact_match === 'number' ? record.exact_match.toFixed(2) : '0.0'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      {record.f1 !== null ? (
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {record.f1.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      {record.latency_ms} ms
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge
                        status={record.status === 'Completed' ? 'available' : 'unavailable'}
                        label={record.status}
                        size="sm"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(record);
                        }}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<HistoryIcon className="h-8 w-8 text-indigo-500" />}
          title="No experiments recorded yet."
          description="Inference queries from the Playground and test runs from Dataset Evaluation will be recorded here automatically."
          action={
            <button
              type="button"
              onClick={() => setActivePage('playground')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition"
            >
              <span>Go to QA Playground</span>
            </button>
          }
        />
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {selectedRecord.id}
                  </span>
                  <StatusBadge status="available" label={selectedRecord.status} size="sm" />
                  {selectedRecord.isMock && (
                    <StatusBadge status="mock" label="MOCK MODE" size="sm" />
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(selectedRecord.timestamp).toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Exact Match</span>
                <div className="mt-1 font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                  {selectedRecord.exact_match !== null ? (selectedRecord.exact_match === 1 ? 'PASS (1.0)' : selectedRecord.exact_match.toFixed(2)) : 'N/A'}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">F1 Score</span>
                <div className="mt-1 font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  {selectedRecord.f1 !== null ? selectedRecord.f1.toFixed(2) : 'N/A'}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Similarity</span>
                <div className="mt-1 font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                  {selectedRecord.similarity !== null ? selectedRecord.similarity.toFixed(2) : 'N/A'}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Latency</span>
                <div className="mt-1 font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                  {selectedRecord.latency_ms} ms
                </div>
              </div>
            </div>

            {/* Content Details */}
            {selectedRecord.contextSnippet && (
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Context Snippet
                </span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-malayalam leading-relaxed">
                  {selectedRecord.contextSnippet}
                </div>
              </div>
            )}

            {selectedRecord.question && (
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Question
                </span>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-malayalam font-medium">
                  {selectedRecord.question}
                </div>
              </div>
            )}

            {selectedRecord.predictedAnswer && (
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Predicted Answer
                </span>
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-malayalam font-bold text-slate-900 dark:text-slate-100">
                  {selectedRecord.predictedAnswer}
                </div>
              </div>
            )}

            {selectedRecord.expectedAnswer && (
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Expected Ground Truth
                </span>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-malayalam">
                  {selectedRecord.expectedAnswer}
                </div>
              </div>
            )}

            {selectedRecord.notes && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <strong>Notes:</strong> {selectedRecord.notes}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  deleteHistoryRecord(selectedRecord.id);
                  setSelectedRecord(null);
                }}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                Delete this record
              </button>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl bg-slate-200 dark:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
