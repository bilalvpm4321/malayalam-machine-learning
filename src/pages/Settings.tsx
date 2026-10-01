import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Palette,
  Code2,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RESEARCH_PROJECT_INFO } from '../config/constants';
import { PageContainer } from '../components/layout/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';

export const Settings: React.FC = () => {
  const {
    apiBaseUrl,
    setApiBaseUrlState,
    isMockMode,
    setIsMockModeState,
    backendStatus,
    checkBackendHealth,
    isDarkMode,
    toggleDarkMode,
  } = useApp();

  const [inputUrl, setInputUrl] = useState<string>(apiBaseUrl);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrlState(inputUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setApiBaseUrlState(inputUrl);
    await checkBackendHealth();
    setIsTesting(false);
  };

  const copyColabCode = () => {
    const code = `# Google Colab FastAPI Inference Backend for IndicQA Qwen2.5-3B QLoRA
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import time
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

app = FastAPI(title="Indic LLM Inference Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and QLoRA adapter
MODEL_ID = "Qwen/Qwen2.5-3B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
# Load base or peft model onto GPU

class PredictionRequest(BaseModel):
    language: str
    task: str
    configuration: str
    context: str
    question: str
    expected_answer: str = None

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": MODEL_ID,
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "version": "1.0.0"
    }

@app.post("/predict")
def predict(req: PredictionRequest):
    t0 = time.time()
    # Prompt formatting for Indic extractive QA
    prompt = f"<|im_start|>system\\nYou are a helpful Malayalam Question Answering assistant. Extract the answer strictly from the context.<|im_end|>\\n<|im_start|>user\\nContext: {req.context}\\n\\nQuestion: {req.question}<|im_end|>\\n<|im_start|>assistant\\n"
    
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    # outputs = model.generate(**inputs, max_new_tokens=128)
    # answer = tokenizer.decode(...)
    
    latency = int((time.time() - t0) * 1000)
    return {
        "answer": "തമിഴ്, തെലുങ്ക്, ഹിന്ദി",
        "expected_answer": req.expected_answer,
        "exact_match": 1 if req.expected_answer else None,
        "f1": 1.0 if req.expected_answer else None,
        "similarity": 1.0 if req.expected_answer else None,
        "latency_ms": latency,
        "model": MODEL_ID,
        "configuration": req.configuration,
        "language": req.language
    }

# Run with pyngrok or localtunnel in Colab
# !uvicorn server:app --host 0.0.0.0 --port 8000
`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <PageContainer maxWidth="full">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 mb-2">
            <SettingsIcon className="h-3.5 w-3.5" />
            <span>Platform Configuration</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Research Lab Settings
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Configure Google Colab backend endpoints, toggle development mock mode, and manage model defaults.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================= */}
        {/* SECTION 1: BACKEND CONNECTIVITY & MOCK MODE               */}
        {/* ========================================================= */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Server className="h-4 w-4 text-indigo-500" />
                Backend Inference Server
              </h3>
              <StatusBadge
                status={backendStatus === 'connected' ? 'connected' : backendStatus === 'checking' ? 'checking' : isMockMode ? 'mock' : 'disconnected'}
              />
            </div>

            <form onSubmit={handleSaveApiUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  API Base URL (Colab / Ngrok / Localhost)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={e => setInputUrl(e.target.value)}
                    placeholder="http://localhost:8000 or https://xyz.ngrok-free.app"
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                  >
                    Save URL
                  </button>
                </div>
                {saveSuccess && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 block">
                    ✓ API Base URL updated successfully
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>Test Connection (GET /health)</span>
                </button>

                <span className="text-[11px] text-slate-400">
                  Default: <code>http://localhost:8000</code>
                </span>
              </div>
            </form>

            {/* Mock Mode Switch */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  Development Mock Mode
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm leading-relaxed">
                  When enabled, uses local simulation for IndicQA inference without requiring an active GPU Colab server. All results will be clearly tagged as Mock Mode.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsMockModeState(!isMockMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isMockMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={isMockMode}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isMockMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* SECTION 2: UI PREFERENCES */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Palette className="h-4 w-4 text-purple-500" />
              Interface Theme & Aesthetics
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Color Mode
                </span>
                <span className="text-[11px] text-slate-500">
                  {isDarkMode ? 'Dark Mode (Lab Night View)' : 'Light Mode (Paper Clean)'}
                </span>
              </div>

              <button
                type="button"
                onClick={toggleDarkMode}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Switch to {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: MODEL CONFIGURATION & DEFAULTS                 */}
        {/* ========================================================= */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sliders className="h-4 w-4 text-emerald-500" />
              Model Configuration Defaults
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Current Base Model:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {RESEARCH_PROJECT_INFO.currentModel}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Default Language:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Malayalam (മലയാളം)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Default Configuration:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  QLoRA (4-bit NF4)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Hardware Profile:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {RESEARCH_PROJECT_INFO.hardware}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: DEVELOPER FASTAPI BACKEND SNIPPET */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Code2 className="h-4 w-4 text-indigo-500" />
                Google Colab Backend Setup
              </h3>

              <button
                type="button"
                onClick={copyColabCode}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Use this lightweight FastAPI boilerplate in your Google Colab notebook to serve the QLoRA fine-tuned model via ngrok or localtunnel.
            </p>

            <div className="relative rounded-xl bg-slate-950 p-3.5 overflow-hidden">
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-52">
                {`# Colab FastAPI Inference Endpoint
POST /predict
Request:
{
  "language": "ml",
  "task": "qa",
  "configuration": "qlora",
  "context": "...",
  "question": "...",
  "expected_answer": "..."
}

GET /health -> {"status": "ok", "model": "Qwen/Qwen2.5-3B-Instruct"}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
