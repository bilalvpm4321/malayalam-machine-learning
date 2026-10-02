import type { HealthResponse, PredictionRequest, PredictionResponse } from '../types/api';
import { INDICQA_MALAYALAM_TEST_SET, LANGUAGE_EXAMPLES } from '../data/indicqaMalayalam';

/**
 * Normalizes text for basic word-level overlap in mock mode
 */
function normalizeIndicText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'–—]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Calculates Token F1 score for mock demonstration
 */
function calculateMockF1(predicted: string, expected: string): number {
  const predTokens = normalizeIndicText(predicted);
  const expTokens = normalizeIndicText(expected);

  if (predTokens.length === 0 || expTokens.length === 0) return 0;

  const common = predTokens.filter(token => expTokens.includes(token));
  if (common.length === 0) return 0.0;

  const precision = common.length / predTokens.length;
  const recall = common.length / expTokens.length;

  return parseFloat(((2 * precision * recall) / (precision + recall)).toFixed(2));
}

/**
 * Generates clearly labelled mock inference responses
 */
export async function mockPredict(request: PredictionRequest): Promise<PredictionResponse> {
  // Simulate realistic Colab GPU inference latency (1.5 - 2.8s)
  const simulatedLatency = Math.floor(Math.random() * 800) + 1600;
  await new Promise(resolve => setTimeout(resolve, simulatedLatency));

  // Find matching test set item or language example
  const languageExampleValues = Object.values(LANGUAGE_EXAMPLES);
  const matchedItem =
    INDICQA_MALAYALAM_TEST_SET.find(
      item => item.question.trim() === request.question.trim() || item.context.includes(request.context.slice(0, 30))
    ) ||
    languageExampleValues.find(
      item => item.question.trim() === request.question.trim() || item.context.includes(request.context.slice(0, 30))
    );

  let predictedAnswer = '';

  if (matchedItem) {
    if (request.configuration === 'qlora') {
      // QLoRA has high precision extractive answer
      predictedAnswer = matchedItem.expected_answer;
    } else if (request.configuration === 'base') {
      // Base LLM without fine-tuning
      predictedAnswer = `${matchedItem.expected_answer}`;
    } else {
      predictedAnswer = matchedItem.expected_answer;
    }
  } else {
    // If user typed custom question, fallback to first sentence or expected answer
    if (request.expected_answer) {
      predictedAnswer = request.expected_answer;
    } else {
      const sentences = request.context.split(/[.?!।|]/).filter(s => s.trim().length > 0);
      predictedAnswer = sentences[0]?.trim() || (request.language === 'en' ? 'Answer not found' : 'ഉത്തരം കണ്ടെത്താനായില്ല (Mock Output)');
    }
  }

  const expected = request.expected_answer?.trim() || '';
  const isMatch = expected && predictedAnswer.trim() === expected ? 1 : 0;
  const f1 = expected ? calculateMockF1(predictedAnswer, expected) : null;
  const similarity = expected ? (isMatch ? 1.0 : f1 !== null ? Math.min(1.0, f1 + 0.08) : null) : null;

  return {
    answer: predictedAnswer,
    expected_answer: request.expected_answer,
    exact_match: expected ? isMatch : null,
    f1: expected ? f1 : null,
    similarity: expected ? (similarity ? parseFloat(similarity.toFixed(2)) : null) : null,
    latency_ms: simulatedLatency,
    model: 'Qwen/Qwen2.5-3B-Instruct (Mock)',
    configuration: request.configuration,
    language: request.language,
    is_mock: true,
  };
}

export async function mockHealthCheck(): Promise<HealthResponse> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    status: 'ok',
    model: 'Qwen/Qwen2.5-3B-Instruct (MOCK)',
    supported_configurations: ['base', 'qlora'],
    version: '1.0.0-mock',
    gpu: 'Simulated Colab T4 15GB',
  };
}
