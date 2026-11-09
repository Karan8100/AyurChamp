# 🌿 AYUSHYA (RAG-Veda)

> **"Know your Prakriti. Adapt to your Vikriti. Live in natural balance."**
> 
> *An Explainable Hybrid-AI Platform for Adaptive Prakriti Assessment, Dynamic Vikriti Tracking, and Samhita-Grounded Preventive Care.*  
> **Smart India Hackathon (SIH 2026)** | Ministry of Ayush

---

## 📖 Comprehensive Documentation Suite

We have prepared four comprehensive architectural and technical specifications in the [`docs/`](./docs) directory:

| Document | Purpose | Key Contents |
| :--- | :--- | :--- |
| **[High-Level Architecture](./docs/ARCHITECTURE_HIGH_LEVEL.md)** | Product Vision & System Design | 2-Tier Dynamic Health Loop, System Context Diagram, User Journeys, Classical Philosophy (*Prakriti vs. Vikriti*). |
| **[Low-Level Technical Architecture](./docs/ARCHITECTURE_LOW_LEVEL.md)** | Engineering Deep-Dive | React 19 0ms optimistic UI transitions, FastAPI async pipelines, scoring algorithms, dynamic tie-breaker bank, and glossary-safe i18n context. |
| **[Database Schema & Data Models](./docs/DATABASE_SCHEMA.md)** | Data Layer & PII Isolation | Entity-Relationship (ER) Diagram, PostgreSQL 16 table specifications, DPDP Act 2023 compliance, and `pgvector` classical chunk indexing. |
| **[Dosha Scoring Engine & Defense](./docs/DOSHA_SCORING_ENGINE.md)** | Algorithms & Viva Defense | Mathematical matrix, Phase 2 tie-breakers, Vikriti $\Delta$ formula, Real Vaidya clinic comparison, and 5 Jury Q&A defense scripts. |
| **[Product USP & RAG Knowledge Base](./docs/USP_AND_KNOWLEDGE_BASE_RAG.md)** | Uniqueness & AI Corpus | Core market differentiators, complete library of canonical Ayurvedic texts (Brihat/Laghu Trayi), chunking schema, and LLM system guardrails. |
| **[REST API Specification](./docs/API_DOCUMENTATION.md)** | Complete API Reference | All endpoints (`/auth`, `/assessment`, `/vikriti`, `/diet`, `/recommendations`, `/ritucharya`), request/response JSON payloads, and error codes. |

---

## ⚡ Key Highlights & Innovations

1. **Hybrid AI Engine (Zero Hallucinations):**
   * **100% Deterministic Rule Scoring:** Clinical Prakriti assessment is computed via a transparent mathematical matrix (not an unpredictable black-box LLM).
   * **Classical RAG Grounding:** Lifestyle, diet, and herbal protocols are retrieved directly from authentic treatises (*Charaka Samhita & Ashtanga Hridaya*) via `pgvector`.
2. **The 2-Tier Dynamic Health Loop:**
   * **Tier 1 (Prakriti Baseline):** Lifelong congenital constitution.
   * **Tier 2 (Weekly Vikriti Pulse):** 2-minute weekly check-in that dynamically tunes meals, spices, sleep windows, and workouts based on real-time stress and weather shifts.
3. **Optimistic 0ms Transitions:**
   * Client-side predictive asset preloading eliminates user assessment fatigue and drop-off.
4. **Glossary-Constrained Multilingual Architecture:**
   * Seamless English and हिन्दी toggle with strict safeguarding of classical Sanskrit medical terms (*Vata, Pitta, Kapha, Agni, Ama, Dinacharya, Ritucharya*).
5. **6-Season Astronomical Ritucharya Engine:**
   * Full coverage of India's 6 seasons, Northern/Southern Solstices (*Adana & Visarga Kala*), and the 14-day *Ritu Sandhi* junction protocol.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Framer Motion, Lucide Icons.
* **Backend:** FastAPI (Async), Python 3.11+, Uvicorn, SQLModel / SQLAlchemy, Asyncpg, PyJWT, Passlib (Bcrypt).
* **Database & Vector Engine:** PostgreSQL 16, `pgvector` (Vector Similarity Search via Cosine Distance `<=>`).
* **DevOps & Standards:** Docker, RESTful JSON APIs, PWA-ready architecture.

---

## 🚀 Quick Start Guide

### Prerequisites
* Python 3.11+ (with `uv` recommended)
* Node.js 18+ & npm
* PostgreSQL 15+ with `pgvector` extension enabled

### 1. Backend Setup
```bash
cd backend

# Create virtual environment and install dependencies
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies using uv or pip
pip install -e .

# Run database migrations / seed knowledge base
python scripts/test_ritucharya.py

# Start FastAPI dev server on port 8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server on port 5173
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🛡️ Clinical Disclaimer & Ethics

AYUSHYA is engineered as an **educational and preventive lifestyle companion** based on classical Ayurvedic principles. It does not provide allopathic clinical diagnosis, pharmacotherapy prescriptions, or emergency triage. For medical diagnosis or treatment of clinical conditions, users are directed to consult certified Ayurvedic physicians or registered medical practitioners.
