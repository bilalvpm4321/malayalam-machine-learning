import React, { useState } from 'react';
import {
  Send,
  Trash2,
  BookOpen,
  Copy,
  Check,
  Clock,
  Sparkles,
  Code2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EXPERIMENT_CONFIGS, LANGUAGES, TASKS } from '../config/constants';
import { LANGUAGE_EXAMPLES, PRIMARY_MALAYALAM_EXAMPLE } from '../data/indicqaMalayalam';
import { ApiService } from '../services/api';
import type { PredictionResponse } from '../types/api';
import { PageContainer } from '../components/layout/PageContainer';
import { MetricCard } from '../components/common/MetricCard';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Playground: React.FC = () => {
  const {
    currentLanguage,
    setCurrentLanguage,
    currentConfig,
    setCurrentConfig,
    currentTask,
    setCurrentTask,
    backendStatus,
    backendInfo,
    isMockMode,
    addHistoryRecord,
    setActivePage,
  } = useApp();

  // Form State
  const [context, setContext] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [expectedAnswer, setExpectedAnswer] = useState<string>('');

  // Execution State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const [copiedAnswer, setCopiedAnswer] = useState<boolean>(false);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  // Load language-specific sample example
  const handleLoadExample = () => {
    const example = LANGUAGE_EXAMPLES[currentLanguage] || PRIMARY_MALAYALAM_EXAMPLE;
    setContext(example.context);
    setQuestion(example.question);
    setExpectedAnswer(example.expected_answer);
    setError(null);
  };

  const handleClear = () => {
    setContext('');
    setQuestion('');
    setExpectedAnswer('');
    setResponse(null);
    setError(null);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!context.trim()) {
      setError({ message: 'Context passage is required to evaluate extractive QA.' });
      return;
    }
    if (!question.trim()) {
      setError({ message: 'Please enter a question to ask the model.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await ApiService.predict({
        language: currentLanguage,
        task: currentTask,
        configuration: currentConfig,
        context: context.trim(),
        question: question.trim(),
        expected_answer: expectedAnswer.trim() || undefined,
      });

      setResponse(result);

      // Record this run into persistent experiment history
      const langObj = LANGUAGES.find(l => l.id === currentLanguage);
      addHistoryRecord({
        language: langObj ? langObj.name : currentLanguage,
        languageCode: currentLanguage,
        task: currentTask,
        model: result.model || 'Qwen/Qwen2.5-3B-Instruct',
        configuration: currentConfig,
        dataset: 'IndicQA (Custom/Sample)',
        exact_match: result.exact_match ?? null,
        f1: result.f1 ?? null,
        similarity: result.similarity ?? null,
        latency_ms: result.latency_ms || 0,
        status: 'Completed',
        contextSnippet: context.slice(0, 150) + (context.length > 150 ? '...' : ''),
        question: question,
        predictedAnswer: result.answer,
        expectedAnswer: expectedAnswer || undefined,
        isDatasetRun: false,
        isMock: result.is_mock,
      });
    } catch (err: unknown) {
      const errObj = err as Error;
      let detailedMsg = errObj?.message || 'An unknown network error occurred.';
      let techInfo: string | undefined = undefined;

      if (
        detailedMsg.includes('Failed to fetch') ||
        detailedMsg.includes('NetworkError') ||
        detailedMsg.includes('unavailable') ||
        detailedMsg.includes('fetch')
      ) {
        detailedMsg =
          'Unable to connect to the model backend. Make sure Google Colab and the ngrok tunnel are running.';
        techInfo = `Endpoint: /predict\nError: ${errObj.toString()}\nHint: Ensure your Google Colab ngrok tunnel is active and FastAPI CORS is allowed.`;
      } else {
        techInfo = errObj.stack || errObj.message;
      }

      setError({
        message: detailedMsg,
        details: techInfo,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const selectedConfigObj = EXPERIMENT_CONFIGS.find(c => c.id === currentConfig);

  return (
    <PageContainer maxWidth="full">
      {/* Top Banner Notice if backend is offline and not in mock mode */}
      {backendStatus === 'disconnected' && !isMockMode && (
        <ErrorMessage
          variant="warning"
          title="Backend Disconnected"
          message="The inference server at your configured API base URL is currently unreachable. You can connect your Google Colab backend or enable Mock Mode for interface testing."
          onOpenSettings={() => setActivePage('settings')}
        />
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT INPUT PANEL (lg:col-span-7)                          */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Question Answering Playground
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure prompt parameters and execute extractive Indic QA
              </p>
            </div>

            <button
              type="button"
              onClick={handleLoadExample}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
              title="Load standard IndicQA Malayalam Bangalore Demographics example"
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Load Example</span>
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Language & Task Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Language Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Language
                </label>
                <select
                  value={currentLanguage}
                  onChange={e => setCurrentLanguage(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {LANGUAGES.map(lang => (
                    <option
                      key={lang.id}
                      value={lang.id}
                      disabled={!lang.enabled}
                    >
                      {lang.name} ({lang.nativeName}) {!lang.enabled ? '— Coming Soon' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Task
                </label>
                <select
                  value={currentTask}
                  onChange={e => setCurrentTask(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {TASKS.map(task => (
                    <option
                      key={task.id}
                      value={task.id}
                      disabled={!task.enabled}
                    >
                      {task.name} {!task.enabled ? '— Coming Soon' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experiment / Model Configuration Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Experiment Configuration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EXPERIMENT_CONFIGS.map(cfg => {
                  const isSelected = currentConfig === cfg.id;
                  const isSupported = cfg.status === 'available' || cfg.status === 'experimental';

                  return (
                    <button
                      key={cfg.id}
                      type="button"
                      disabled={!isSupported}
                      onClick={() => setCurrentConfig(cfg.id)}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500'
                          : isSupported
                          ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                          : 'opacity-50 cursor-not-allowed border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-bold truncate w-full">{cfg.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
                        {cfg.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Context Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Context Passage <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {context.length} characters
                </span>
              </div>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                rows={6}
                placeholder="Enter the Malayalam context passage..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-malayalam leading-relaxed transition"
              />
            </div>

            {/* Question Textarea */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Question <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                rows={2}
                placeholder="Enter your Malayalam question..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-malayalam leading-relaxed transition"
              />
            </div>

            {/* Expected Answer (Ground Truth) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Expected Answer <span className="text-slate-400 font-normal lowercase">(optional reference for EM/F1 evaluation)</span>
              </label>
              <input
                type="text"
                value={expectedAnswer}
                onChange={e => setExpectedAnswer(e.target.value)}
                placeholder="e.g. തമിഴ്, തെലുങ്ക്, ഹിന്ദി"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-malayalam transition"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isLoading || !context.trim() || !question.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner inline size="sm" label="" />
                      <span>Generating answer...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Generate Answer</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isLoading || (!context && !question && !expectedAnswer)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition"
                >
                  <Trash2 className="h-4 w-4 text-slate-400" />
                  <span>Clear</span>
                </button>
              </div>

              {isMockMode && (
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  ⚡ Running in Mock Mode
                </span>
              )}
            </div>
          </form>
        </div>

        {/* ========================================================= */}
        {/* RIGHT RESPONSE PANEL (lg:col-span-5)                         */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-5">
          {/* Error Display */}
          {error && (
            <ErrorMessage
              title="Inference Notice"
              message={error.message}
              details={error.details}
              onRetry={handleGenerate}
              onOpenSettings={() => setActivePage('settings')}
            />
          )}

          {/* Response Container */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
            <div>
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Model Response
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {selectedConfigObj?.name || 'QLoRA'}
                    </span>
                    <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                      {response?.model || backendInfo?.model || selectedConfigObj?.model || 'Qwen/Qwen2.5-3B-Instruct'}
                    </span>
                  </div>
                </div>

                {response?.latency_ms !== undefined && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-700 dark:text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{(response.latency_ms / 1000).toFixed(2)} sec</span>
                  </div>
                )}
              </div>

              {/* Main Answer Area */}
              <div className="mt-4">
                {isLoading ? (
                  <div className="py-16 text-center">
                    <LoadingSpinner label="Running QLoRA Inference on Tesla T4..." />
                    <p className="mt-2 text-xs text-slate-400">
                      Processing Malayalam tokens and evaluating context
                    </p>
                  </div>
                ) : response ? (
                  <div className="space-y-4">
                    {/* Prominent Generated Answer */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Generated Answer
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(response.answer)}
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                          title="Copy answer"
                        >
                          {copiedAnswer ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-emerald-500 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-base font-semibold text-slate-900 dark:text-slate-100 font-malayalam leading-relaxed">
                        {response.answer || <span className="text-slate-400 italic">Empty output returned</span>}
                      </div>

                      {response.is_mock && (
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">MOCK MODE OUTPUT</span>
                          <span className="text-slate-400">Enable live Colab backend in Settings</span>
                        </div>
                      )}
                    </div>

                    {/* Expected Answer Comparison */}
                    {expectedAnswer && (
                      <div className="rounded-xl bg-slate-50/60 dark:bg-slate-800/40 p-3.5 border border-slate-200 dark:border-slate-700/60 text-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                          Ground Truth / Expected Answer
                        </span>
                        <div className="font-medium text-slate-700 dark:text-slate-300 font-malayalam">
                          {expectedAnswer}
                        </div>
                      </div>
                    )}

                    {/* Evaluation Metrics Cards (Section 2: Prompt Requirements) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Automated Evaluation
                        </span>
                        {!expectedAnswer && (
                          <span className="text-[11px] text-slate-400 italic">
                            (Enter expected answer for metrics)
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        {/* Exact Match */}
                        <MetricCard
                          title="Exact Match"
                          value={
                            response.exact_match !== null && response.exact_match !== undefined
                              ? response.exact_match === 1
                                ? 'PASS'
                                : 'FAIL'
                              : null
                          }
                          variant={response.exact_match === 1 ? 'success' : 'default'}
                          isNotAvailableText="Not available"
                          subtext="Binary string match"
                        />

                        {/* F1 Score */}
                        <MetricCard
                          title="F1 Score"
                          value={
                            response.f1 !== null && response.f1 !== undefined
                              ? response.f1.toFixed(2)
                              : null
                          }
                          variant={response.f1 && response.f1 >= 0.7 ? 'success' : 'default'}
                          isNotAvailableText="Not available"
                          subtext="Token harmonic mean"
                        />

                        {/* Similarity */}
                        <MetricCard
                          title="Similarity"
                          value={
                            response.similarity !== null && response.similarity !== undefined
                              ? response.similarity.toFixed(2)
                              : null
                          }
                          variant={response.similarity && response.similarity >= 0.7 ? 'success' : 'default'}
                          isNotAvailableText="Not available"
                          subtext="Semantic similarity"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 dark:text-slate-500">
                    <Sparkles className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No response yet
                    </h4>
                    <p className="text-xs max-w-xs mx-auto mt-1">
                      Enter Malayalam context and question on the left panel, or click <strong>Load Example</strong> to test the model.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions: Raw JSON inspection */}
            {response && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>{showRawJson ? 'Hide Raw API JSON' : 'Inspect Raw API JSON'}</span>
                </button>

                {showRawJson && (
                  <pre className="mt-2 rounded-xl bg-slate-950 p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
                    {JSON.stringify(response.raw_response || response, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
