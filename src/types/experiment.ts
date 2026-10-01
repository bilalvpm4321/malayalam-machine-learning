import type { ExperimentConfigId, LanguageId, TaskId } from './api';

export interface DatasetItem {
  id: string;
  context: string;
  question: string;
  expected_answer: string;
  topic?: string;
}

export interface DatasetEvaluationResultItem {
  id: string;
  question: string;
  context: string;
  expected_answer: string;
  prediction: string;
  exact_match: number | null;
  f1: number | null;
  similarity: number | null;
  latency_ms: number;
  status: 'success' | 'error';
  error_message?: string;
}

export interface DatasetEvaluationSummary {
  datasetName: string;
  split: string;
  configuration: ExperimentConfigId;
  language: LanguageId;
  totalQuestions: number;
  completedQuestions: number;
  correctCount: number; // exact match count
  exactMatchPercent: number | null;
  averageF1Percent: number | null;
  averageSimilarity: number | null;
  averageLatencyMs: number | null;
  timestamp: string;
  results: DatasetEvaluationResultItem[];
  isMock?: boolean;
}

export interface ExperimentRecord {
  id: string;
  timestamp: string;
  language: string;
  languageCode: LanguageId;
  task: TaskId;
  model: string;
  configuration: ExperimentConfigId;
  dataset: string;
  exact_match: number | null;
  f1: number | null;
  similarity: number | null;
  latency_ms: number;
  status: 'Completed' | 'Failed' | 'In Progress';
  contextSnippet?: string;
  question?: string;
  predictedAnswer?: string;
  expectedAnswer?: string;
  isDatasetRun?: boolean;
  notes?: string;
  isMock?: boolean;
}

export interface ExperimentComparisonRow {
  configId: ExperimentConfigId;
  configuration: string;
  language: string;
  dataset: string;
  exactMatch: number | null;
  f1: number | null;
  faithfulness: number | null;
  latencyMs: number | null;
  gpuMemory: string;
  trainableParams: string;
  trainingTime: string;
  status: 'Evaluated' | 'Experimental' | 'Planned' | 'Not evaluated';
}
