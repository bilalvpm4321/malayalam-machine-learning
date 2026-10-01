export type LanguageId = 'ml' | 'hi' | 'ta' | 'te' | 'en';

export type TaskId = 'qa' | 'summarization' | 'translation';

export type ExperimentConfigId = 'base' | 'qlora' | 'rag' | 'rag_qlora';

export type ConfigStatus = 'available' | 'experimental' | 'planned' | 'unavailable';

export interface LanguageOption {
  id: LanguageId;
  name: string;
  nativeName: string;
  enabled: boolean;
  script: string;
  notes?: string;
}

export interface ExperimentConfigOption {
  id: ExperimentConfigId;
  name: string;
  model: string;
  finetuning: string;
  retrieval: string;
  status: ConfigStatus;
  description: string;
  badgeVariant: 'success' | 'warning' | 'neutral' | 'indigo';
}

export interface TaskOption {
  id: TaskId;
  name: string;
  description: string;
  enabled: boolean;
}

export interface QARequest {
  language: string;
  task: string;
  configuration: string;
  context: string;
  question: string;
  expected_answer?: string;
}

export interface QAResponse {
  answer: string;
  expected_answer?: string;
  model?: string;
  configuration?: string;
  language?: string;
  exact_match?: number | null;
  f1?: number | null;
  similarity?: number | null;
  latency_ms?: number;
  raw_response?: Record<string, unknown>;
  is_mock?: boolean;
}

// Aliases for compatibility
export type PredictionRequest = QARequest;
export type PredictionResponse = QAResponse;

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error' | string;
  model?: string;
  supported_configurations?: string[];
  version?: string;
  gpu?: string;
  device?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: string;
  technical?: string;
}
