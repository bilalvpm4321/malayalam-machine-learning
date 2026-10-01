# Indic LLM Evaluation Lab

A research dashboard and experimentation interface for **Multilingual & Indic Large Language Model (LLM) Evaluation and Improvement**, built for M.Tech thesis research.

---

## 🎯 Research Focus

- **Current Language:** Malayalam (`ml` / മലയാളം)
- **Task:** Extractive / Context-based Question Answering
- **Dataset:** AI4Bharat IndicQA Malayalam (70 Training examples, 13 Test examples)
- **Base Model:** `Qwen/Qwen2.5-3B-Instruct`
- **Current Experiment:** 4-bit Quantized Low-Rank Adaptation (QLoRA, $r=16, \alpha=32$)
- **Compute:** Google Colab Tesla T4 (15GB VRAM)
- **Planned Experiments:** Dense RAG, Hybrid RAG + QLoRA
- **Extensible To:** Hindi (`hi`), Tamil (`ta`), Telugu (`te`), English (`en`)

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (Neutral slate & indigo research aesthetic, high-contrast dark/light mode)
- **Typography:** Inter, Noto Sans Malayalam (`font-family: 'Inter', 'Noto Sans Malayalam', sans-serif`), JetBrains Mono
- **Visualization:** Recharts
- **Icons:** Lucide React
- **Architecture:** Zero frontend hallucination; strict separation between ground-truth backend metrics and client UI.

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (optional):

```env
# URL where your FastAPI backend is running (localhost or Google Colab tunnel)
VITE_API_BASE_URL=http://localhost:8000

# Set to true to test the frontend with local simulated mock data when Colab is offline
VITE_USE_MOCK_API=false
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 Connecting Google Colab Backend

The frontend communicates with your model via REST API. In your Google Colab notebook, you can serve the model using FastAPI and expose it with `pyngrok` or `localtunnel`.

### Colab FastAPI Backend Script:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import time
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

app = FastAPI(title="Indic LLM Inference Server")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_ID = "Qwen/Qwen2.5-3B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
# Load your base model or peft QLoRA adapter onto CUDA...

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
        "supported_configurations": ["base", "qlora"],
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "version": "1.0.0"
    }

@app.post("/predict")
def predict(req: PredictionRequest):
    t0 = time.time()
    
    # Format prompt for Qwen2.5 chat template with Indic instructions
    prompt = (
        f"<|im_start|>system\n"
        f"You are a helpful Malayalam Question Answering assistant. "
        f"Extract the answer strictly from the context passage.<|im_end|>\n"
        f"<|im_start|>user\nContext: {req.context}\n\nQuestion: {req.question}<|im_end|>\n"
        f"<|im_start|>assistant\n"
    )
    
    # inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    # outputs = model.generate(**inputs, max_new_tokens=128, temperature=0.1)
    # answer = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True).strip()
    
    # Calculate latency
    latency = int((time.time() - t0) * 1000)
    
    # Exact Match & F1 calculation
    em = 1 if (req.expected_answer and answer == req.expected_answer) else 0
    
    return {
        "answer": answer,
        "expected_answer": req.expected_answer,
        "exact_match": em if req.expected_answer else None,
        "f1": 1.0 if em == 1 else None,
        "similarity": 1.0 if em == 1 else None,
        "latency_ms": latency,
        "model": MODEL_ID,
        "configuration": req.configuration,
        "language": req.language
    }

# Run with uvicorn
# !uvicorn server:app --host 0.0.0.0 --port 8000
```

---

## 📡 API Specification

### `GET /health`
Returns server availability and GPU model details.

**Response:**
```json
{
  "status": "ok",
  "model": "Qwen/Qwen2.5-3B-Instruct",
  "supported_configurations": ["base", "qlora"],
  "gpu": "Tesla T4",
  "version": "1.0.0"
}
```

### `POST /predict`
Executes model QA inference.

**Request:**
```json
{
  "language": "ml",
  "task": "qa",
  "configuration": "qlora",
  "context": "2007ലെ കണക്കുകളനുസരിച്ച് ബാംഗ്ലൂരിലെ ജനസംഖ്യ 5,281,927 ആണ്. ... ഇംഗ്ലീഷും കന്നഡയും കഴിഞ്ഞാൽ ബാംഗ്ലൂരിൽ ഏറ്റവും കൂടുതൽ സംസാരിക്കപ്പെടുന്ന ഭാഷകൾ തമിഴ്, തെലുങ്ക്, ഹിന്ദി എന്നിവയാണ്.",
  "question": "ഇംഗ്ലീഷും കന്നഡയും കഴിഞ്ഞാൽ, ബാംഗ്ലൂരിൽ ഏറ്റവും കൂടുതൽ സംസാരിക്കുന്ന ഭാഷകൾ ഏതെല്ലാമാണ് ?",
  "expected_answer": "തമിഴ്, തെലുങ്ക്, ഹിന്ദി"
}
```

**Response:**
```json
{
  "answer": "തമിഴ്, തെലുങ്ക്, ഹിന്ദി",
  "expected_answer": "തമിഴ്, തെലുങ്ക്, ഹിന്ദി",
  "exact_match": 1,
  "f1": 1.0,
  "similarity": 1.0,
  "latency_ms": 2310,
  "model": "Qwen/Qwen2.5-3B-Instruct",
  "configuration": "qlora",
  "language": "ml"
}
```

---

## ⚡ Mock Mode for Offline UI Testing

When running without an active Google Colab GPU instance:
1. Open **Settings** in the sidebar.
2. Toggle **Development Mock Mode** to `ON` (or set `VITE_USE_MOCK_API=true`).
3. The interface will immediately activate mock inference with realistic latencies and token overlap calculations. All results are explicitly tagged with `MOCK MODE` badges.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── common/             # StatusBadge, MetricCard, ErrorMessage, LoadingSpinner, EmptyState
│   ├── dashboard/          # StatCard, ExperimentCard
│   └── layout/             # Sidebar, Header, PageContainer
├── config/
│   └── constants.ts        # Centralized languages, tasks, models & system constants
├── context/
│   └── AppContext.tsx      # State management (page, backend health, theme, history)
├── data/
│   └── indicqaMalayalam.ts # IndicQA Malayalam 13-item test split
├── pages/
│   ├── Dashboard.tsx       # Research overview & summary cards
│   ├── Playground.tsx      # Main 2-column Malayalam QA playground
│   ├── DatasetEvaluation.tsx # 13-example test set batch evaluation
│   ├── Experiments.tsx     # Comparative matrix & Recharts visualizations
│   ├── Metrics.tsx         # Mathematical formulas & telemetry reference
│   ├── History.tsx         # Experiment run audit log & JSON export
│   └── Settings.tsx        # Backend URL, Mock Mode, Colab template
├── services/
│   ├── api.ts              # Fetch client with timeout & error classification
│   └── mockApi.ts          # Simulated offline responses
└── types/
    ├── api.ts              # API TypeScript interfaces
    └── experiment.ts       # Benchmark & history interfaces
```

---

## 🌐 How to Add Another Language

To enable Hindi, Tamil, Telugu, or any other Indic language:

1. Open `src/config/constants.ts`.
2. Locate the `LANGUAGES` array and update the target entry:
```typescript
{
  id: 'hi',
  name: 'Hindi',
  nativeName: 'हिन्दी',
  enabled: true, // change from false to true
  script: 'Devanagari (Unicode block U+0900..U+097F)',
  notes: 'IndicQA Hindi extractive QA evaluation',
}
```
3. The language dropdown across the entire application will immediately activate Hindi without altering any component code.

---

## ⚙️ How to Add Another Model Configuration

1. Open `src/config/constants.ts`.
2. Locate the `EXPERIMENT_CONFIGS` array and update or add an experiment:
```typescript
{
  id: 'rag',
  name: 'RAG',
  model: 'Qwen/Qwen2.5-3B-Instruct',
  finetuning: 'None',
  retrieval: 'BGE-M3 Dense Vector',
  status: 'available', // change from 'planned' to 'available'
  description: 'Dense retrieval + generative answer synthesis.',
  badgeVariant: 'indigo',
}
```
3. The Dashboard, Playground, Dataset Evaluation, and Comparison Matrix will automatically enable the new configuration.

---

## 📜 License & Citation

Built for M.Tech Thesis Research on *Multilingual / Indic LLM Evaluation and Improvement*.
Dataset: AI4Bharat IndicQA Benchmark.
Base Model: Qwen 2.5 (Alibaba Cloud).
