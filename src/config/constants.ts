import type { ExperimentConfigOption, LanguageOption, TaskOption } from '../types/api';

export const LANGUAGES: LanguageOption[] = [
  {
    id: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    enabled: true,
    script: 'Malayalam (Unicode block U+0D00..U+0D7F)',
    notes: 'Primary focus of current M.Tech research testing IndicQA dataset.',
  },
  {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    enabled: false,
    script: 'Devanagari (Unicode block U+0900..U+097F)',
    notes: 'Planned for future multilingual generalization phase.',
  },
  {
    id: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    enabled: false,
    script: 'Tamil (Unicode block U+0B80..U+0BFF)',
    notes: 'Planned for future Dravidian family comparative experiments.',
  },
  {
    id: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    enabled: false,
    script: 'Telugu (Unicode block U+0C00..U+0C7F)',
    notes: 'Planned for future Dravidian family comparative experiments.',
  },
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    enabled: false,
    script: 'Latin',
    notes: 'Base baseline comparison language.',
  },
];

export const TASKS: TaskOption[] = [
  {
    id: 'qa',
    name: 'Extractive Question Answering',
    description: 'Extracting precise answers from context passages in native Indic script.',
    enabled: true,
  },
  {
    id: 'summarization',
    name: 'Context Summarization',
    description: 'Abstractive summarization of long native context passages.',
    enabled: false,
  },
  {
    id: 'translation',
    name: 'Cross-lingual QA Transfer',
    description: 'Zero-shot cross-lingual extractive QA across Indic languages.',
    enabled: false,
  },
];

export const EXPERIMENT_CONFIGS: ExperimentConfigOption[] = [
  {
    id: 'base',
    name: 'Base LLM',
    model: 'Qwen/Qwen2.5-3B-Instruct',
    finetuning: 'None',
    retrieval: 'None',
    status: 'available',
    description: 'Direct zero-shot / few-shot extractive QA prompt to vanilla Qwen 2.5 3B.',
    badgeVariant: 'neutral',
  },
  {
    id: 'qlora',
    name: 'QLoRA',
    model: 'Qwen/Qwen2.5-3B-Instruct',
    finetuning: 'QLoRA (4-bit NF4, r=16, alpha=32)',
    retrieval: 'None',
    status: 'experimental',
    description: 'Parameter-efficient fine-tuning on IndicQA Malayalam (70 train examples) on Colab T4 GPU.',
    badgeVariant: 'indigo',
  },
  {
    id: 'rag',
    name: 'RAG',
    model: 'Qwen/Qwen2.5-3B-Instruct',
    finetuning: 'None',
    retrieval: 'Dense Retrieval (e.g. IndicBERT / BGE-M3)',
    status: 'planned',
    description: 'Retrieval-Augmented Generation retrieving top-k passages from Indic knowledge corpus.',
    badgeVariant: 'warning',
  },
  {
    id: 'rag_qlora',
    name: 'RAG + QLoRA',
    model: 'Qwen/Qwen2.5-3B-Instruct',
    finetuning: 'QLoRA (4-bit NF4)',
    retrieval: 'Dense Retrieval (Hybrid vector + BM25)',
    status: 'planned',
    description: 'Combined RAG pipeline with domain/language specialized QLoRA fine-tuned generator.',
    badgeVariant: 'warning',
  },
];

export const RESEARCH_PROJECT_INFO = {
  projectTitle: 'Indic LLM Evaluation Lab',
  subtitle: 'Evaluate and compare multilingual language models for low-resource question answering.',
  degree: 'M.Tech Research Project',
  focus: 'Multilingual / Indic LLM Evaluation and Improvement',
  currentLanguage: 'Malayalam (മലയാളം)',
  currentTask: 'Question Answering (IndicQA)',
  currentDataset: 'IndicQA Malayalam',
  currentModel: 'Qwen/Qwen2.5-3B-Instruct',
  trainExamplesCount: 70,
  testExamplesCount: 13,
  hardware: 'Google Colab Tesla T4 (15GB VRAM)',
  framework: 'PyTorch + HuggingFace Transformers + PEFT (QLoRA) + BitsAndBytes',
  defaultApiBaseUrl: 'http://localhost:8000',
};
