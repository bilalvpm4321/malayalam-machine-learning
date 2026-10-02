"""
Indic LLM Evaluation Server - Multi-Lingual QA Server (FastAPI + Qwen2.5-3B-Instruct)
Supports: Malayalam (ml), English (en), Tamil (ta), Kannada (kn), Hindi (hi), Telugu (te), Auto-Detect
"""

import time
from typing import Optional
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 1. Model Configuration
MODEL_ID = "Qwen/Qwen2.5-3B-Instruct"
MAX_LENGTH = 1536
MAX_NEW_TOKENS = 64

# 2. Multi-Lingual System Prompts
LANGUAGE_SYSTEM_PROMPTS = {
    "ml": (
        "You are a helpful Malayalam Question Answering assistant. "
        "Please answer the question strictly in Malayalam using only the provided context. Give only the concise answer."
    ),
    "en": (
        "You are a helpful Question Answering assistant. "
        "Please answer the question clearly and accurately in English using only the provided context. Give only the concise answer."
    ),
    "ta": (
        "You are a helpful Tamil Question Answering assistant. "
        "Please answer the question strictly in Tamil using only the provided context. Give only the concise answer."
    ),
    "kn": (
        "You are a helpful Kannada Question Answering assistant. "
        "Please answer the question strictly in Kannada using only the provided context. Give only the concise answer."
    ),
    "hi": (
        "You are a helpful Hindi Question Answering assistant. "
        "Please answer the question strictly in Hindi using only the provided context. Give only the concise answer."
    ),
    "te": (
        "You are a helpful Telugu Question Answering assistant. "
        "Please answer the question strictly in Telugu using only the provided context. Give only the concise answer."
    ),
    "auto": (
        "You are a helpful multilingual Question Answering assistant. "
        "Detect the input language and answer the question in that exact same language using only the provided context. Give only the concise answer."
    )
}

def get_system_prompt_for_language(lang: str = "ml") -> str:
    normalized = (lang or "auto").lower().strip()
    return LANGUAGE_SYSTEM_PROMPTS.get(normalized, LANGUAGE_SYSTEM_PROMPTS["auto"])

def format_qwen_chat_prompt(context: str, question: str, language: str = "ml") -> list:
    sys_prompt = get_system_prompt_for_language(language)
    return [
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion:\n{question}"}
    ]

# 3. Model & Tokenizer Loader
print(f"Loading Tokenizer & Model: {MODEL_ID}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

device = "cuda" if torch.cuda.is_available() else "cpu"
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto" if torch.cuda.is_available() else None,
    trust_remote_code=True
)
if not torch.cuda.is_available():
    model = model.to(device)

print(f"Model loaded on {device} successfully!")

# 4. FastAPI Application Setup
app = FastAPI(title="Indic Multi-Lingual QA Server", version="2.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    language: str = "ml"             # "ml", "en", "ta", "kn", "hi", "te", "auto"
    task: str = "qa"
    configuration: str = "base"      # "base" | "qlora"
    context: str
    question: str
    expected_answer: Optional[str] = ""

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model": MODEL_ID,
        "supported_languages": list(LANGUAGE_SYSTEM_PROMPTS.keys()),
        "supported_configurations": ["base"],
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "version": "2.5.0"
    }

@app.post("/predict")
def predict(req: PredictionRequest):
    t0 = time.time()
    
    # Format chat prompt using the requested language
    messages = format_qwen_chat_prompt(
        context=req.context,
        question=req.question,
        language=req.language
    )
    
    prompt_text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    
    inputs = tokenizer(prompt_text, return_tensors="pt").to(device)
    
    with torch.inference_mode():
        outputs = model.generate(
            **inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            do_sample=False,
            pad_token_id=tokenizer.eos_token_id
        )
    
    response_tokens = outputs[0][inputs.input_ids.shape[1]:]
    generated_answer = tokenizer.decode(response_tokens, skip_special_tokens=True).strip()
    latency_ms = int((time.time() - t0) * 1000)
    
    # Calculate exact match if ground truth provided
    expected = (req.expected_answer or "").strip()
    exact_match = 1 if expected and generated_answer == expected else 0 if expected else None
    
    return {
        "answer": generated_answer,
        "expected_answer": req.expected_answer or None,
        "exact_match": exact_match,
        "f1": 1.0 if exact_match == 1 else None,
        "similarity": 1.0 if exact_match == 1 else None,
        "latency_ms": latency_ms,
        "model": MODEL_ID,
        "configuration": req.configuration or "base",
        "language": req.language
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
