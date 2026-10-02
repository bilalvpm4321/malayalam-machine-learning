import type { HealthResponse, QARequest, QAResponse } from '../types/api';
import { mockHealthCheck, mockPredict } from './mockApi';

const STORAGE_KEY_API_URL = 'indic_qa_api_base_url';
const STORAGE_KEY_MOCK_MODE = 'indic_qa_use_mock_api';

/**
 * In development, always use the Vite local proxy (/api-proxy) to completely avoid browser CORS.
 * In production builds, use VITE_API_BASE_URL.
 */
export function getApiBaseUrl(): string {
  const saved = localStorage.getItem(STORAGE_KEY_API_URL);
  if (saved && saved.trim()) return saved.trim().replace(/\/+$/, '');
  return (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
}

export function setApiBaseUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY_API_URL, url.trim().replace(/\/+$/, ''));
}

export function getIsMockMode(): boolean {
  const saved = localStorage.getItem(STORAGE_KEY_MOCK_MODE);
  if (saved !== null) return saved === 'true';
  return import.meta.env.VITE_USE_MOCK_API === 'true';
}

export function setIsMockMode(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY_MOCK_MODE, String(enabled));
}

export class ApiService {
  /**
   * Health check for backend inference server (GET /health)
   */
  static async checkHealth(): Promise<HealthResponse> {
    if (getIsMockMode()) {
      return mockHealthCheck();
    }

    const baseUrl = getApiBaseUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Health check returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as HealthResponse;
      return data;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const message = err instanceof Error ? err.message : 'Unknown network error';
      throw new Error(`Unable to connect to backend at ${baseUrl}: ${message}`);
    }
  }

  /**
   * Main prediction API for Question Answering (POST /predict)
   */
  static async generateAnswer(request: QARequest): Promise<QAResponse> {
    if (getIsMockMode()) {
      return mockPredict(request);
    }

    const baseUrl = getApiBaseUrl();
    const startTime = performance.now();
    const controller = new AbortController();
    // 90-second timeout for Colab GPU generation
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const payload = {
        language: request.language,
        task: request.task,
        configuration: request.configuration,
        context: request.context,
        question: request.question,
        expected_answer: request.expected_answer || '',
        max_new_tokens: request.max_new_tokens || 128,
      };

      const response = await fetch(`${baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const clientLatency = Math.round(performance.now() - startTime);

      if (!response.ok) {
        let errorDetails = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errText = await response.text();
          if (errText) {
            try {
              const errJson = JSON.parse(errText);
              if (errJson.detail) {
                errorDetails = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
              } else if (errJson.message) {
                errorDetails = errJson.message;
              }
            } catch {
              errorDetails = `${errorDetails}: ${errText}`;
            }
          }
        } catch {
          // ignore text parse error
        }

        throw new Error(
          `Unable to connect to the model backend. Make sure Google Colab and the ngrok tunnel are running. (Server details: ${errorDetails})`
        );
      }

      const data = await response.json();

      return {
        answer: data.answer || '',
        expected_answer: data.expected_answer ?? request.expected_answer,
        model: data.model || 'Qwen/Qwen2.5-3B-Instruct',
        configuration: data.configuration || request.configuration,
        language: data.language || request.language,
        exact_match:
          typeof data.exact_match === 'number'
            ? data.exact_match
            : data.exact_match === true
            ? 1
            : data.exact_match === false
            ? 0
            : null,
        f1: typeof data.f1 === 'number' ? data.f1 : null,
        similarity: typeof data.similarity === 'number' ? data.similarity : null,
        latency_ms: typeof data.latency_ms === 'number' ? data.latency_ms : clientLatency,
        tokens_generated: typeof data.tokens_generated === 'number' ? data.tokens_generated : undefined,
        contains_replacement_char: typeof data.contains_replacement_char === 'boolean' ? data.contains_replacement_char : undefined,
        raw_response: data,
        is_mock: false,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(
          'Inference request timed out after 90 seconds. Please check if your Google Colab runtime is responsive.'
        );
      }
      throw err;
    }
  }

  // Alias predict to generateAnswer
  static async predict(request: QARequest): Promise<QAResponse> {
    return this.generateAnswer(request);
  }
}
