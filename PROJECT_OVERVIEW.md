# 🌿 AYUSHYA (RAG-Veda) — Project Overview

> **"Know your Prakriti. Adapt to your Vikriti. Live in natural balance."**  
> *Smart India Hackathon (SIH 2026) | Ministry of Ayush*

---

## 📌 1. Ye Project Kya Hai? (30-Second Elevator Pitch)

**AYUSHYA** ek **Bio-Individual Circadian Health & Preventive Wellness Platform** hai, jo classical Ayurveda aur modern computer science ko combine karta hai.

Aasan shabdon me:
* Ye user ka congenital (by-birth) body type (**Prakriti**) accurately calculate karta hai.
* Har hafte user ki current lifestyle, stress aur weather ki wajah se body me aaye temporary imbalances (**Vikriti**) ko track karta hai.
* In dono ko combine karke user ko **dynamic diet, 24-ghante ka biological routine (Dinacharya), aur authentic classical recommendations** deta hai — wo bhi bina kisi AI hallucination ke.

---

## 🛑 2. Problem Statement (Kyu Banaya Gaya?)

Aaj market me do sabse badi problems hain:

1. **Static & Fake Online Quizzes:**  
   Internet par 99% Ayurvedic dosha quizzes ek baar 5-10 sawal puchte hain aur static result de dete hain. Agar kisi ko kal se sardi ya acidity hai, to quiz use permanently "Kapha" ya "Pitta" declare kar deta hai. Wo **by-birth genetic constitution (Prakriti)** aur **temporary bimari (Vikriti)** me farak nahi samajhte.

2. **One-Size-Fits-All Fitness & Generic ChatGPT:**  
   65% log gym ya diet 90 din me quit kar dete hain kyunki har body type ki muscle capacity, metabolic fire (Agni) aur recovery rate alag hota hai. Wahi doosri taraf, ChatGPT jaise generic LLMs bina medical context ke fabricated/hallucinated nuske de dete hain.

---

## 🧬 3. Core Science in Simple Words (Prakriti vs. Vikriti)

Kisi ko bhi project samjhane ke liye ye analogy sabse best hai:

| Concept | Kya Hota Hai? | Real-World Analogy | Validity |
| :--- | :--- | :--- | :--- |
| **Prakriti (प्रकृति)** | By-birth genetic constitution jo kabhi change nahi hota. | Aapke phone ka **Hardware / OS** (e.g., iPhone ya Android). | **Lifelong (Fixed)** |
| **Vikriti (विकृति)** | Current lifestyle, stress, ya mausam se aaya temporary imbalance. | Phone me aane wala **Temporary Bug / Battery Drain**. | **Dynamic (Week-to-Week)** |

### The 3 Biological Energies (Tridosha):
* **Vata (वात - Air + Space):** Movement, nervous system, aur agility. *(Imbalance par: Anxiety, joint pain, dry skin, insomnia)*.
* **Pitta (पित्त - Fire + Water):** Digestion (Agni), metabolism, aur body heat. *(Imbalance par: Acidity, anger, skin rashes, burning sensation)*.
* **Kapha (कफ - Earth + Water):** Physical structure, immunity (Ojas), aur stability. *(Imbalance par: Lethargy, weight gain, mucus congestion)*.

---

## 🚀 4. Platform Kya Karta Hai? (Key Features & Modules)

### 1. Deterministic Prakriti Assessment (Genetic Profiling)
* 24 scientific physical, physiological, aur psychological questions.
* **Special Innovation:** Agar top-2 doshas ke score me bohot kam gap ho (tie situation), to system automatically **Phase 2 Tie-Breaker Bank** trigger karta hai.
* Zero-lag, 0ms optimistic transitions ke sath visual illustrations.

### 2. Weekly Vikriti Pulse (Dynamic 2-Minute Check-in)
* User har hafte ek 2-minute ka micro-check-in karta hai (sleep quality, digestion, mood, energy levels).
* System current deviation calculate karta hai:  
  $$\text{Vikriti Deviation } (\Delta) = \text{Current Score} - \text{Baseline Prakriti}$$
* Isse platform ko pata chalta hai ki is hafte kaunsa dosha aggravated hai.

### 3. Adaptive 2-Tier Diet & Nutrition Matrix
* Diet static PDF nahi hoti! Ye teen cheezon ko mila kar dynamically adapt hoti hai:
  1. User ki base **Prakriti** (Long-term nourishment).
  2. Is hafte ki **Vikriti** (Immediate corrective spices/food).
  3. Current **Season (Ritucharya)** (Weather-based adaptation).
* Agar user ka Pitta is hafte high hai, to system automatically cooling spices (Dhania, Saunf) add kar dega aur garam/spicy food restrict kar dega.

### 4. Living Chronobiology (24-Hour Dinacharya Clock)
* User ke local device time ke sath live sync hota hai.
* Pura din 3 biological phases me divide hota hai:
  * **Kapha Phase (Morning):** Heavy workouts aur physical endurance ke liye best.
  * **Pitta Phase (Midday):** Digestive fire peak par hoti hai — heaviest meal lene ka time.
  * **Vata Phase (Evening):** Creativity, winding down, aur grounding routines ke liye best.

### 5. 6-Season Astronomical Ritucharya Engine
* Bharat ke 6 authentic seasons (*Shishira, Vasanta, Grishma, Varsha, Sharad, Hemanta*) aur Solstices (*Adana & Visarga Kala*) ko live track karta hai.
* Mausam badalne par 14-day transition period (*Ritu Sandhi*) ka bio-protocol provide karta hai taaki seasonal flu se bacha ja sake.

### 6. AyurMitra RAG AI Co-Pilot (Samhita Grounded)
* Classical Ayurvedic treatises (*Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya*) par trained RAG system.
* Jab bhi koi advice deta hai, Shloka aur authentic reference cite karta hai.
* **Emergency Triage Guardrail:** Agar koi user critical emergency symptoms type kare (e.g. *"chest pain and left arm numbness"*), to AI gharelu nuske block karke turant **112/108 Emergency Ambulance Alert** trigger karta hai.

### 7. Clinical Health Dossier (SHA-256 Verifiable)
* 1-page A4 print-ready medical report generate hoti hai.
* Har report me ek tamper-evident **SHA-256 cryptographic hash** hota hai jisse doctor verify kar sakta hai ki report authentic hai aur tamper nahi hui hai.

---

## ⚙️ 5. Kaise Kaam Karta Hai? (High-Level Architecture)

Deep code me jaye bina, system ka flow 3 simple layers me divided hai:

```
┌─────────────────────────────────────────────────────────────┐
│                       1. FRONTEND LAYER                     │
│    React 19 + TypeScript + Tailwind CSS + Framer Motion    │
│  - 0ms Optimistic UI Transitions (Bina loading drop-off ke) │
│  - 1-Click Guest Mode (Judges ke live review ke liye)       │
│  - English & हिन्दी Glossary-safe Toggle                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ (REST API / Async JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    2. INTELLIGENCE BACKEND                  │
│                   FastAPI (Async Python 3.11)               │
│                                                             │
│  [A] Deterministic Math Engine (Zero-Hallucination)         │
│      - Prakriti & Vikriti scoring pure algorithm se hoti    │
│        hai (LLM ko scores guess karne nahi diya jata).      │
│                                                             │
│  [B] Dynamic Recommendation & Chronobiology Engine          │
│      - Dinacharya live clock & 6-Season Ritucharya math.    │
│                                                             │
│  [C] AyurMitra RAG Pipeline                                 │
│      - Clinical texts retrieval & Emergency Guardrail.      │
└──────────────────────────────┬──────────────────────────────┘
                               │ (pgvector similarity search)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     3. DATA & KNOWLEDGE                     │
│                 PostgreSQL 16 + pgvector                    │
│  - Classical Ayurvedic Samhitas (Brihat Trayi chunks)       │
│  - DPDP Act 2023 compliant secure user data store           │
└─────────────────────────────────────────────────────────────┘
```

### 🧠 The "Hybrid-AI" Strategy (Key Innovation):
* **Diagnosis me NO Generative AI:** Prakriti/Vikriti calculate karne ke liye mathematical rule-matrix use hoti hai taaki zero hallucinations hon aur 100% medical consistency rahe.
* **Conversational Layer me RAG AI:** Sirf user ke sawalon ke classical answers explain karne ke liye semantic vector retrieval (RAG) use hota hai.

---

## 🏆 6. Key USPs (Ye Baki Sab Se Alag Kyu Hai?)

| Feature | Regular Apps / Generic Quizzes | AYUSHYA Platform |
| :--- | :--- | :--- |
| **Prakriti vs Vikriti** | Dono ko mix karke galat result dete hain. | Dono ko alag track karta hai (Fixed Baseline + Dynamic Pulse). |
| **Scoring Integrity** | Black-box LLM guessing ya random quiz. | 100% Deterministic Mathematical Matrix. |
| **Diet Plans** | Static generic PDF chart. | Dynamic 3-Way Matrix (Prakriti + Vikriti + Season). |
| **AI Reliability** | Hallucinations aur unsafe nuske. | Classical RAG citations + Medical Emergency Triage. |
| **Biological Clock** | Normal reminder notifications. | Live 24-hr Circadian Clock + 6-Season Ritucharya Engine. |
| **Doctor Interoperability** | Normal screenshot | Verifiable 1-Page A4 Dossier with SHA-256 Hash. |

---

## 🎤 7. Kisi Ko 2 Minute Me Demo Kaise Dikhayein? (Speaking Script)

Jab aap kisi ko ya jury ko platform live dikha rahe hon, to ye sequence follow karein:

1. **Home Screen (`/`):**
   * *"Humne instant 1-Click Guest Mode banaya hai taaki bina signup friction ke koi bhi evaluator turant check kar sake."*
2. **Assessment (`/assessment`):**
   * *"Hamara diagnostic test 24 biological markers cover karta hai. Agar score close ho, to smart tie-breaker automatically on hota hai."*
3. **Interactive Dashboard (`/dashboard`):**
   * *"Ye Tridosha breakdown chart hai, aur ye live 24-Hour Dinacharya clock hai jo current bio-phase dikhata hai."*
4. **Weekly Vikriti Pulse (`/vikriti-assessment`):**
   * *"Ye hamara killer feature hai — 2-minute weekly check-in. Jab user is hafte ka stress ya acidity log karta hai, to dashboard turant alert karta hai ki unka Pitta badha hua hai."*
5. **Adaptive Diet (`/diet-planner`):**
   * *"Aap dekh sakte hain ki diet static nahi hai — isne user ke base type + elevated dosha + current season teeno ko adjust karke corrective spices add kar diye."*
6. **AyurMitra Chatbot (Bottom-right badge):**
   * *"Ye hamara classical RAG assistant hai. Ye Charaka Samhita cite karta hai. Aur agar koi chest pain jaisi emergency dale, to ye nuska dene ke bajaye 112 emergency trigger kar deta hai."*

---

## 📋 Summary

**AYUSHYA** koi normal quiz ya generic ChatGPT wrapper nahi hai. Ye ek **complete preventive healthcare ecosystem** hai jo classical Vedic science ko modern deterministic algorithms, real-time chronobiology, aur safety-first RAG AI ke sath ek seamless application me convert karta hai.
