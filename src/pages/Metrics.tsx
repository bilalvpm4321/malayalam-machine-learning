import React from 'react';
import {
  BookOpen,
  HelpCircle,
  Cpu,
  Database,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';

interface MetricDetail {
  name: string;
  category: 'qa' | 'system' | 'rag';
  formula: string;
  description: string;
  status: 'Implemented' | 'Planned' | 'Not available in current experiment';
  currentValue?: string;
  notes: string;
}

const METRICS_LIST: MetricDetail[] = [
  // 1. Question Answering Metrics
  {
    name: 'Exact Match (EM)',
    category: 'qa',
    formula: 'EM = 1 if normalize(pred) == normalize(ground_truth) else 0',
    description: 'Strict binary evaluation indicating whether the predicted character sequence exactly matches the ground truth answer after unicode normalization.',
    status: 'Implemented',
    currentValue: 'Calculated via backend /predict endpoint',
    notes: 'Primary metric for extractive QA. Particularly strict in morphologically rich agglutinative languages like Malayalam.',
  },
  {
    name: 'Token F1 Score',
    category: 'qa',
    formula: 'F1 = (2 * Precision * Recall) / (Precision + Recall)',
    description: 'Measures word/token-level overlap between predicted answer and expected answer tokens, giving credit to partially correct spans.',
    status: 'Implemented',
    currentValue: 'Calculated via backend /predict endpoint',
    notes: 'Handles minor morphological suffixes and whitespace variations in Indic scripts.',
  },
  {
    name: 'Semantic Similarity',
    category: 'qa',
    formula: 'CosineSimilarity(Embedding(pred), Embedding(ground_truth))',
    description: 'Measures high-dimensional semantic embedding alignment using Indic sentence encoders (e.g. IndicBERT / MuRIL).',
    status: 'Implemented',
    currentValue: 'Calculated via backend /predict endpoint',
    notes: 'Captures synonymy and paraphrasing where exact string match fails.',
  },

  // 2. System Metrics
  {
    name: 'Inference Latency',
    category: 'system',
    formula: 'Latency = t_response_received - t_request_sent (milliseconds)',
    description: 'End-to-end inference time per query from prompt tokenization to final token generation on the GPU backend.',
    status: 'Implemented',
    currentValue: '~1.8s - 2.5s (Google Colab Tesla T4)',
    notes: 'Crucial for real-time multilingual QA assistant usability.',
  },
  {
    name: 'GPU Memory Footprint',
    category: 'system',
    formula: 'VRAM_Peak = torch.cuda.max_memory_allocated()',
    description: 'Peak VRAM allocated during 4-bit NF4 quantized model loading and forward pass generation.',
    status: 'Implemented',
    currentValue: '6.4 GB / 15 GB Tesla T4',
    notes: 'Enables fine-tuning and inference of 3B parameter models on single free-tier Colab GPUs.',
  },
  {
    name: 'Trainable Parameters',
    category: 'system',
    formula: '% Trainable = (N_lora_params / N_total_params) * 100',
    description: 'Number and percentage of model weights updated during QLoRA fine-tuning.',
    status: 'Implemented',
    currentValue: '4,194,304 / 3,086,000,000 (0.14%)',
    notes: 'LoRA rank r=16, alpha=32 applied to q_proj, k_proj, v_proj, o_proj attention projection matrices.',
  },
  {
    name: 'Training Time',
    category: 'system',
    formula: 't_train = sum(step_times)',
    description: 'Wall-clock time for QLoRA adaptation over 70 IndicQA Malayalam training examples.',
    status: 'Implemented',
    currentValue: '18.4 minutes (3 epochs, lr=2e-4)',
    notes: 'Trained using HuggingFace SFTTrainer + BitsAndBytes 4-bit quantization.',
  },

  // 3. RAG Metrics (Planned)
  {
    name: 'Context Precision',
    category: 'rag',
    formula: 'Precision@k = (Relevant chunks retrieved in top-k) / k',
    description: 'Evaluates if all ground-truth relevant context passages are ranked higher than irrelevant ones.',
    status: 'Not available in current experiment',
    notes: 'Planned for Phase 2 when dense retriever (IndicBERT / BGE-M3) vector store is integrated.',
  },
  {
    name: 'Context Recall',
    category: 'rag',
    formula: 'Recall = (Retrieved ground-truth facts) / (Total ground-truth facts)',
    description: 'Measures if all necessary context information required to answer the question was successfully retrieved.',
    status: 'Not available in current experiment',
    notes: 'Planned for Phase 2 RAG pipeline evaluation.',
  },
  {
    name: 'Faithfulness',
    category: 'rag',
    formula: 'Faithfulness = (Claims supported by context) / (Total generated claims)',
    description: 'Quantifies hallucination by checking whether every claim in the generated answer is directly grounded in the retrieved passage.',
    status: 'Not available in current experiment',
    notes: 'Planned for Phase 2 evaluation using LLM-as-a-judge / NLI model.',
  },
  {
    name: 'Retrieval Accuracy',
    category: 'rag',
    formula: 'HitRate@k = 1 if gold_passage in top_k else 0',
    description: 'Binary indicator of whether the true passage containing the answer was in the top-k retrieved list.',
    status: 'Not available in current experiment',
    notes: 'Planned for dense/sparse hybrid retrieval evaluation.',
  },
];

export const Metrics: React.FC = () => {
  const qaMetrics = METRICS_LIST.filter(m => m.category === 'qa');
  const systemMetrics = METRICS_LIST.filter(m => m.category === 'system');
  const ragMetrics = METRICS_LIST.filter(m => m.category === 'rag');

  return (
    <PageContainer maxWidth="full">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 mb-2">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Research Methodology & Metrics</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Evaluation Metrics Reference
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Mathematical definitions, implementation status, and telemetry benchmarks for the Indic LLM evaluation pipeline.
          </p>
        </div>
      </div>

      {/* Section 1: Question Answering Metrics */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-indigo-500" />
            Question Answering Quality Metrics
          </h3>
          <span className="text-xs text-slate-400">Extractive IndicQA Metrics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {qaMetrics.map(metric => (
            <div
              key={metric.name}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {metric.name}
                </h4>
                <StatusBadge
                  status={metric.status === 'Implemented' ? 'available' : 'na'}
                  label={metric.status}
                />
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {metric.description}
              </p>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 font-mono text-[11px] text-indigo-700 dark:text-indigo-300 overflow-x-auto">
                {metric.formula}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <strong>Research Note:</strong> {metric.notes}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: System Metrics */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-500" />
            System & Compute Telemetry
          </h3>
          <span className="text-xs text-slate-400">Colab Tesla T4 15GB Setup</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemMetrics.map(metric => (
            <div
              key={metric.name}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {metric.name}
                </h4>
                <StatusBadge status="available" label="Live" />
              </div>

              {metric.currentValue && (
                <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {metric.currentValue}
                </div>
              )}

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {metric.description}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                {metric.notes}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: RAG Metrics */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Database className="h-4 w-4 text-amber-500" />
              Retrieval-Augmented Generation (RAG) Metrics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Metrics planned for the upcoming RAG pipeline evaluation phase.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ragMetrics.map(metric => (
            <div
              key={metric.name}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3 opacity-90"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {metric.name}
                </h4>
                <StatusBadge status="planned" label="Planned" />
              </div>

              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 italic font-medium">
                Not available in current experiment
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {metric.description}
              </p>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                {metric.formula}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
};
