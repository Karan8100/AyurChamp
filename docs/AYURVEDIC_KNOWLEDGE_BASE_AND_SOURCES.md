# 🌿 AYUSHYA: Classical Ayurvedic Knowledge Corpus & Treatise References
> **A Comprehensive Defense Guide & Evidence Document for SIH-2026 Jury & Technical Evaluators**  
> *Ministry of Ayush • Grounded Clinical RAG Architecture • Classical Treatises (Brihat-Trayi & Laghu-Trayi)*

---

## 🏛️ 1. Executive Overview for SIH Judges

AYUSHYA's AI engine (**AyurMitra**) is **not** a generic chatbot generating unverified web information. It operates under a **Deterministic-Grounded Retrieval-Augmented Generation (RAG)** pipeline backed by **47 high-fidelity canonical knowledge chunks** indexed in PostgreSQL (`pgvector`) with Google 1536-dimensional neural embeddings.

Every recommendation, diet modification, seasonal routine, and herbal suggestion is strictly anchored to:
1. **The Great Triad (बृहत्त्रयी - Brihat-Trayi)**:
   - **Charaka Samhita (चरक संहिता)** — Internal Medicine & Therapeutics (*Kayachikitsa*)
   - **Sushruta Samhita (सुश्रुत संहिता)** — Surgical Philosophy, Anatomy & Traumatology (*Shalyatantra*)
   - **Ashtanga Hridaya by Acharya Vagbhata (अष्टाङ्गहृदयम्)** — Master Synthesis of Classical Practice
2. **The Lesser Triad (लघुत्रयी - Laghu-Trayi)**:
   - **Bhavaprakasha Nighantu (भावाप्रकाश निघण्टु)** — Classical Pharmacopeia & Dravyaguna Shastra
   - **Madhava Nidana (माधव निदानम्)** — Etiology, Diagnostics & Symptomatology (*Nidana Panchaka*)
   - **Sharngadhara Samhita (शार्ङ्गधर संहिता)** — Pharmacology (*Bhaishajya Kalpana* & *Deepana-Pachana*)

---

## 📚 2. Master Corpus Classification & Exact Verse Index

The AYUSHYA knowledge repository is organized into **6 clinical modules** located in [`backend/app/data/knowledge_base/`](file:///d:/projects/SIH-2026/backend/app/data/knowledge_base/):

| Module File | Domain Area | Chunks | Primary Classical Treatises | Key Focus |
| :--- | :--- | :---: | :--- | :--- |
| [`diet_annapanavidhi.json`](file:///d:/projects/SIH-2026/backend/app/data/knowledge_base/diet_annapanavidhi.json) | Classical Dietetics | 11 | Charaka Samhita Sutra 27, Ashtanga Hridaya Sutra 6 | Curd prohibitions, incompatible foods (*Viruddha Ahara*), aged grains, ghee, CCF tea |
| [`lifestyle_dinacharya.json`](file:///d:/projects/SIH-2026/backend/app/data/knowledge_base/lifestyle_dinacharya.json) | Chronobiology & Routines | 8 | Ashtanga Hridaya Sutra 2, Charaka Sutra 5 & 21 | Brahma Muhurta, tongue scraping, oil pulling (*Gandusha*), Abhyanga, half-capacity exercise (*Ardha-Shakti*) |
| [`seasons_ritucharya.json`](file:///d:/projects/SIH-2026/backend/app/data/knowledge_base/seasons_ritucharya.json) | Seasonal Regimen | 7 | Charaka Samhita Sutra 6, Ashtanga Hridaya Sutra 3 | Dual solstices (*Adana/Visarga Kala*), 6 Shad Ritus, 14-day detox junction (*Ritu Sandhi*) |
| [`pathology_dosha_agni.json`](file:///d:/projects/SIH-2026/backend/app/data/knowledge_base/pathology_dosha_agni.json) | Pathology & Physiology | 4 | Charaka Sutra 1 & Vimana 6, Sharngadhara Ch. 4 | Opposites principle (*Samanya-Vishesha*), 4 Agni states, *Ama* metabolic endotoxins, *Deepana-Pachana* |
| [`herbs_dravyaguna_master.json`](file:///d:/projects/SIH-2026/backend/app/data/knowledge_base/herbs_dravyaguna_master.json) | Botanical Pharmacopeia | 10 | Bhavaprakasha Nighantu, Charaka Sutra 4 & 25 | Ashwagandha, Triphala, Giloy, Turmeric, Tulsi, Brahmi, Shatavari, Trikatu, Amla, Castor Oil |
| [`clinical_faq_remedies.json`](file:///d:/projects/SIH-2026/backend/app/data/knowledge_base/clinical_faq_remedies.json) | Clinical Interventions | 7 | Charaka Chikitsa 15 & 28, Madhava Nidanam | Hyperacidity (*Amlapitta*), constipation (*Udavarta*), bloating (*Anaha*), insomnia (*Anidra*), Pratimarsha Nasya |
| **TOTAL VERIFIED** | **Unified System** | **47** | **6 Classical Ayurvedic Treatises** | **Grounded RAG Clinical Knowledge Base** |

---

## 🔍 3. Granular Module Breakdown & Shloka References

### Module A: Classical Dietetics (*Annapanavidhi*)
**Treatise Reference:** *Charaka Samhita, Sutrasthana Chapter 27 (Annapanavidhi Adhyaya)* & *Ashtanga Hridaya, Sutrasthana Chapter 6*

1. **Nighttime Curd Prohibition (*Nishi Dadhi Nishiddha*)**
   - *Reference:* Charaka Samhita Sutrasthana Ch. 27, Verse 225–228.
   - *Classical Rule:* Curd possesses *Ushna Virya* (heating potency) and *Abhishyandi* (obstructive to bodily channels/micro-capillaries *Srotas*). Night is dominated by Kapha; consuming curd at night induces channel blockage, skin disorders (*Kushtha*), and metabolic endotoxins (*Ama*).
2. **Aged Rice (*Shashtika Shali*)**
   - *Reference:* Charaka Samhita Sutrasthana Ch. 27, Verse 8–12.
   - *Properties:* Aged rice (>1 year old) is *Laghu* (light to digest) and tridoshic balancer. Fresh harvest rice is heavy and Kapha-aggravating.
3. **Green Gram (*Mudga / Moong Dal*)**
   - *Reference:* Charaka Samhita Sutrasthana Ch. 27, Verse 23.
   - *Properties:* Declared *Pathya Shreshtha* (foremost healing pulse). Astringent-sweet (*Kashaya-Madhura*), cold potency (*Sheeta Virya*), does not cause flatulence.
4. **Cow's Ghee (*Go-Ghrita*)**
   - *Reference:* Charaka Samhita Sutrasthana Ch. 13, Verse 14.
   - *Properties:* The supreme unctuous substance (*Sneha Shreshtha*). Rekindles digestive fire without increasing bile; pacifies Pitta and Vata, augments *Ojas* (immunity) and *Medha* (intellect).
5. **Sesame Oil (*Tila Taila*)**
   - *Reference:* Charaka Samhita Sutrasthana Ch. 25, Verse 40.
   - *Properties:* Foremost Vata-pacifying unctuous liquid (*Vata-hara Shreshtha*). Highly penetrating (*Sukshma*).
6. **Incompatible Food Combinations (*Viruddha Ahara*)**
   - *Reference:* Charaka Samhita Sutrasthana Ch. 26, Verse 82–106.
   - *Combinations:* Milk + Sour Fruits, Honey + Equal quantity Ghee, Heated Honey, Fish + Milk, Night Curds.
7. **Classical CCF Tea (Cumin, Coriander, Fennel)**
   - *Reference:* Bhavaprakasha Nighantu, Haritakyadi Varga.
   - *Properties:* Balanced tridoshic carminative, soothes gastrointestinal spasms and dissolves *Ama*.
8. **Bitter Gourd (*Karavellaka*)**
   - *Reference:* Bhavaprakasha Nighantu, Shakavarga.
   - *Properties:* Supreme Tikta Rasa (bitter) vegetable; cleanses blood (*Rakta-Shodhaka*) and stimulates sluggish liver.
9. **Pomegranate (*Dadima*)**
   - *Reference:* Charaka Samhita Sutrasthana Ch. 27, Verse 141.
   - *Properties:* Foremost tridoshic fruit; astringent-sweet, cardiac tonic (*Hridya*), and natural antacid.
10. **Dry Ginger (*Shunthi*) vs. Fresh Ginger (*Ardraka*)**
    - *Reference:* Bhavaprakasha Nighantu, Haritakyadi Varga.
    - *Properties:* Shunthi is *Snigdha* (unctuous) and has *Madhura Vipaka* (sweet post-digestive effect), pacifying Vata without aggravating Pitta.
11. **Bottle Gourd (*Alabu*)**
    - *Reference:* Bhavaprakasha Nighantu, Shakavarga.
    - *Properties:* Cooling (*Sheeta*), alkaline, Pitta-soothing, diuretic.

---

### Module B: Chronobiology & Daily Routines (*Dinacharya*)
**Treatise Reference:** *Ashtanga Hridaya, Sutrasthana Chapter 2 (Dinacharya Adhyaya)* & *Charaka Samhita, Sutrasthana Chapter 5 (Matrashitiya Adhyaya)*

1. **Pre-Dawn Awakening (*Brahma Muhurta*)**
   - *Verse:* *“ब्राह्मे मुहूर्ते उत्तिष्ठेत् स्वस्थो रक्षार्थमायुषः”* (Ashtanga Hridaya Sutrasthana 2.1)
   - *Significance:* Waking 48–96 minutes before sunrise when environmental Vata is light, pure, and dominated by Sattva guna.
2. **Tongue Scraping (*Jihwa Nirlekhana*)**
   - *Reference:* Charaka Samhita Sutrasthana Ch. 5, Verse 74–75.
   - *Benefits:* Removes overnight bacterial/Ama coating from taste buds; cures bad breath (*Daurgandhya*), awakens appetite (*Aruchi-nashana*).
3. **Oral Oil Holding (*Gandusha*) vs. Swishing (*Kavala*)**
   - *Reference:* Charaka Samhita Sutrasthana Ch. 5, Verse 78–83.
   - *Clinical Distinction:* *Gandusha* = filling oral cavity completely without moving liquid (strengthens jaw, teeth, voice). *Kavala* = swishing comfortable volume (cleanses pharynx and tongue).
4. **Daily Warm Oil Abhyanga**
   - *Verse:* *“अभ्यङ्गमाचरेन्नित्यं स जराश्रमवातहा”* (Ashtanga Hridaya Sutrasthana 2.8)
   - *Benefits:* Slows down physical aging (*Jara-hara*), relieves fatigue (*Shrama-hara*), eliminates Vata turbulence, fortifies vision (*Drishti-prasada*).
5. **Foot Massage (*Pada Abhyanga*)**
   - *Reference:* Charaka Samhita Sutrasthana Ch. 5, Verse 90–92.
   - *Benefits:* Massaging the soles relieves roughness and stiffness, improves sleep quality (*Nidralabha*), and stimulates *Kurchapara Marma* connected to vision.
6. **Half-Capacity Workout Rule (*Ardha-Shakti Vyayama*)**
   - *Reference:* Sushruta Samhita Chikitsasthana Ch. 24, Verse 48 & Charaka Sutra 7.
   - *Clinical Limit:* Stop exercise when sweat appears on forehead, nose, and axilla (*Hridi Sthana-sthitah*), preventing structural depletion (*Kshaya*).
7. **Pillars of Restorative Sleep (*Nidra Niyama*)**
   - *Reference:* Charaka Samhita Sutrasthana Ch. 21, Verse 35–40.
   - *Principle:* Sleep is one of the Three Pillars of Life (*Traya Upastambha*). Daytime sleeping (*Diva-svapna*) aggravates Kapha-Pitta; night insomnia aggravates Vata.
8. **Temperature Protocol for Bathing (*Snana Vidhi*)**
   - *Reference:* Ashtanga Hridaya Sutrasthana Ch. 2, Verse 16–17.
   - *Rule:* Warm water below neck (*Dehe Ushnena Balavaham*); cool/room temperature water for head (*Shiro-abhyangam Ahetukam* to protect optic nerves and hair follicles).

---

### Module C: Seasonal Chronobiology (*Ritucharya*)
**Treatise Reference:** *Charaka Samhita, Sutrasthana Chapter 6 (Tasyashitiya Adhyaya)* & *Ashtanga Hridaya, Sutrasthana Chapter 3*

1. **Dual Solstices (*Adana Kala* vs. *Visarga Kala*)**
   - *Adana Kala (Northern / Uttarayana):* Shishira, Vasanta, Grishma. Solar strength increases; bodily stamina depletes.
   - *Visarga Kala (Southern / Dakshinayana):* Varsha, Sharad, Hemanta. Lunar/cooling strength returns; bodily stamina rises.
2. **Monsoon (*Varsha Ritu* - July to Sept)**
   - *Doshic Dynamic:* Vata Aggravation (*Prakopa*), Pitta Accumulation (*Chaya*), Agni Weakening.
   - *Protocols:* Warm ginger, honey with old grain porridge, avoidance of river water and daytime sleep.
3. **Autumn (*Sharad Ritu* - Sept to Nov)**
   - *Doshic Dynamic:* Sudden intense sun provoked Pitta Aggravation (*Prakopa*).
   - *Protocols:* Cow's ghee, coriander water, Amla, Tikta (bitter) and Madhura (sweet) foods; strict curd ban.
4. **Winter (*Hemanta & Shishira Ritu* - Nov to March)**
   - *Doshic Dynamic:* Trapped internal heat inflames Agni into *Tikshnagni* (sharp hunger).
   - *Protocols:* Heavy, unctuous nourishing meals, sesame preparations, Abhyanga with mustard/sesame oil.
5. **Spring (*Vasanta Ritu* - March to May)**
   - *Doshic Dynamic:* Solar heat melts accumulated Kapha dosha, causing seasonal allergies and sluggishness.
   - *Protocols:* Honey, dry ginger, barley, dry friction massage (*Garshana*), avoidance of sweet/cold/oily foods.
6. **Summer (*Grishma Ritu* - May to July)**
   - *Doshic Dynamic:* Extreme heat depletes Kapha and bodily juices, leading to Vata accumulation.
   - *Protocols:* Cooling coconut water, milk with cardamom, sweet seasonal fruits, avoidance of intense workouts.
7. **14-Day Transition Detox (*Ritu Sandhi*)**
   - *Reference:* Ashtanga Hridaya Sutrasthana Ch. 3, Verse 58–59.
   - *Method:* Gradually tapering previous season's habits (*Pada-Krama*) while gently introducing new seasonal habits over 14 days to prevent seasonal morbidity.

---

### Module D: Pathology & Fundamental Axioms (*Dosha-Agni-Ama*)
**Treatise Reference:** *Charaka Samhita, Sutrasthana Chapter 1 (Ayushkamiya Adhyaya)*, *Vimanasthana Chapter 6*, & *Sharngadhara Samhita*

1. **The Principle of Opposites (*Samanya-Vishesha Siddhanta*)**
   - *Verse:* *“सर्वदा सर्वभावानां सामान्यं वृद्धिकारणम्। ह्रासहेतुर्विशेषश्च प्रवृत्तिरुभयस्य तु॥”* (Charaka Sutrasthana 1.44)
   - *Application in AYUSHYA:* Explains to user **why** foods balance them: "Like qualities increase like dosha (e.g. spicy food increases fiery Pitta), while opposite qualities pacify the excess (e.g. cooling ghee pacifies hot Pitta)."
2. **The Four Functional States of Agni (*Jatharagni*)**
   - *Samagni:* Balanced doshas = clean, optimal digestion.
   - *Vishamagni:* Vata dominance = erratic digestion, gas, bloating, irregular appetite.
   - *Tikshnagni:* Pitta dominance = hyperacidity, burning, intense thirst, gastritis.
   - *Mandagni:* Kapha dominance = sluggish digestion, heavy stomach, lethargy, coated tongue.
3. **Metabolic Endotoxins (*Ama*) Mechanics**
   - *Reference:* Ashtanga Hridaya Sutrasthana Ch. 13, Verse 23–25.
   - *Pathology:* Incomplete digestion fermentation yields toxic, sticky mucus (*Ama*) that occludes micro-channels (*Srotas*), triggering systemic auto-inflammatory conditions.
4. **Digestive Stimulants (*Deepana*) vs. Toxin Digestion (*Pachana*)**
   - *Reference:* Sharngadhara Samhita, Purva Khanda Ch. 4, Verse 1–4.
   - *Clinical Difference:* *Deepana* kindles digestive fire without digesting toxins (e.g. Chitraka). *Pachana* cooks and dissolves toxins without directly kindling Agni (e.g. Nagarmotha). Shunthi performs both (*Deepana-Pachana*).

---

### Module E: Master Botanical Pharmacopeia (*Dravyaguna Shastra*)
**Treatise Reference:** *Bhavaprakasha Nighantu* & *Charaka Samhita, Sutrasthana Chapter 4 & 25*

Each herb is recorded with complete Ayurvedic pharmacological profiles:

| Herb (Sanskrit & Botanical) | Rasa (Taste) | Guna (Attributes) | Virya (Potency) | Vipaka (Post-Digestive) | Primary Actions & Clinical Treatise Reference |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ashwagandha** (*Withania somnifera*) | Tikta, Kashaya, Madhura | Laghu, Snigdha | **Ushna (Hot)** | Madhura | Balya, Rasayana, Medhya, Calms Vata nervous exhaustion (*Charaka Sutra 4*) |
| **Triphala** (Haritaki, Bibhitaki, Amalaki) | Pancha Rasa (All except salt) | Laghu, Ruksha | **Anushna (Temperate)** | Madhura | Chakshushya (vision), Deepana, gentle colon detox (*Charaka Chikitsa 1*) |
| **Guduchi / Giloy** (*Tinospora cordifolia*) | Tikta, Kashaya | Guru, Snigdha | **Ushna (Hot)** | Madhura | *Amrita*, destroys fever (*Jwara-hara*), balances all 3 doshas (*Bhavaprakasha*) |
| **Haridra / Turmeric** (*Curcuma longa*) | Tikta, Katu | Ruksha, Laghu | **Ushna (Hot)** | Katu | Varnya, Prameha-hara (metabolic health), Lekhana (clearing fat/mucus) |
| **Tulsi** (*Ocimum sanctum*) | Katu, Tikta | Laghu, Ruksha, Tikshna | **Ushna (Hot)** | Katu | Hridya, Kasahara, Shvasahara, respiratory prana revitalizer (*Dhanvantari Nighantu*) |
| **Brahmi** (*Bacopa monnieri*) | Tikta, Kashaya, Madhura | Laghu, Sara | **Sheeta (Cooling)** | Madhura | Foremost *Medhya Rasayana*, promotes memory, sleep, cognitive calm (*Charaka Sutra 4*) |
| **Shatavari** (*Asparagus racemosus*) | Madhura, Tikta | Guru, Snigdha | **Sheeta (Cooling)** | Madhura | Balya, Rasayana, Stanya-janana, cooling soothing tonic for mucosal membranes |
| **Trikatu** (Shunthi, Maricha, Pippali) | Katu | Laghu, Ruksha, Tikshna | **Ushna (Hot)** | Katu | Foremost *Deepana-Pachana*, destroys stubborn respiratory and digestive Kapha |
| **Amalaki / Amla** (*Phyllanthus emblica*) | Amla, Madhura, Kashaya, Tikta, Katu | Guru, Ruksha | **Sheeta (Cooling)** | **Madhura** | *Vayasthapana Shreshtha* (Supreme anti-aging), natural antacid despite sour taste |
| **Eranda Taila** (*Ricinus communis*) | Madhura, Tikta, Kashaya | Guru, Snigdha, Sukshma | **Ushna (Hot)** | Madhura | *Vata-hara Shreshtha*, lubricates joints, clears severe obstinate constipation |

---

### Module F: Clinical Emergency Guardrails & Evidence FAQs
**Treatise Reference:** *Charaka Samhita, Chikitsasthana Chapter 15 & 28*, *Madhava Nidanam (Amlapitta & Udavarta Nidanam)*

1. **Hyperacidity / Acid Reflux (*Amlapitta Protocol*)**
   - *Classical Pathology:* Pachaka Pitta aggravation with excess *Amlata* (sourness) and *Ushnata* (heat).
   - *Protocol:* Dhaniya-Saunf hima, cold milk with cow's ghee, Amalaki powder; avoidance of chilies and late night food.
2. **Obstinate Constipation (*Udavarta Protocol*)**
   - *Classical Pathology:* Apana Vata reverse movement and intestinal dryness (*Rukshata*).
   - *Protocol:* Munakka (soaked black raisins), warm water with 1 tsp castor oil, Triphala decoction; avoidance of dry crackers/salads.
3. **Gastrointestinal Bloating (*Anaha / Adhmana Protocol*)**
   - *Classical Pathology:* Trapped Samana Vata combined with cold sluggish Agni.
   - *Protocol:* Warm water infused with pinch of Hing (Asafoetida) and Saindhava Lavana (rock salt); warm castor oil abdominal pack.
4. **Chronic Sleep Disruption (*Anidra Protocol*)**
   - *Classical Pathology:* Tarpaka Kapha depletion and elevated Prana Vata restlessness.
   - *Protocol:* Warm nutmeg-infused milk, nightly foot massage (*Pada Abhyanga*) with sesame oil; digital screen blackout 1 hour before sleep.
5. **Daily Preventive Nasal Inunction (*Pratimarsha Nasya Protocol*)**
   - *Reference:* Ashtanga Hridaya Sutrasthana Ch. 20, Verse 15–18.
   - *Method:* Instilling 2 drops of Anu Taila or warm sesame oil in each nostril daily morning and evening; strengthens sensory acuity and prevents premature graying.
6. **Cold Sluggish Digestion (*Mandagni Protocol*)**
   - *Protocol:* Chewing small slice of fresh ginger with rock salt 10 minutes before meals (*Nagara-Lavana Yoga*).
7. **Joint Pain & Stiffness (*Sandhigata Vata Protocol*)**
   - *Protocol:* Mahanarayana Taila local warm application, Dashamula kwatha, warm fomentation (*Nadi Sveda*); avoiding direct cold AC breeze.

---

## 🛡️ 4. AI Guardrails & Clinical Safety Matrix

To ensure patient safety and pass regulatory scrutiny (NABH / Ayush Ministry standards), AYUSHYA implements a **Two-Tier Guardrail System**:

```
                              [USER INCOMING QUERY]
                                       │
                                       ▼
                     ┌──────────────────────────────────┐
                     │   TIER 1: Deterministic Safety   │
                     │         Regex Evaluation         │
                     └──────────────────────────────────┘
                         │                          │
           [Matches Red-Flag Emergency]    [Matches Out-of-Domain]
                         │                          │
                         ▼                          ▼
               🚨 Redirection to 112/108      🌿 Re-anchor to Ayurvedic
             Emergency Medical Triage             Lifestyle Scope
                         │
                  [Passes Tier 1]
                         │
                         ▼
        ┌────────────────────────────────────────────────────────┐
        │        TIER 2: Grounded Clinical RAG Pipeline          │
        │  1. Ingest User Prakriti & Vikriti Delta (Postgres DB) │
        │  2. Ingest Active Season (Classical Chronobiology)     │
        │  3. Retrieve Top-3 Canonical Chunks (pgvector 1536-dim)│
        │  4. Synthesize Empathetic Vaidya Response with Citations│
        └────────────────────────────────────────────────────────┘
```

### Safety Features Implemented:
1. **Acute Medical Emergency Interception**:
   - Red-flag keywords (`chest pain`, `stroke`, `heavy bleeding`, `unconscious`, `suicide`, `convulsions`) trigger an instant **Red Advisory** directing the patient to nearest emergency hospital (112/108) with zero delay.
2. **Out-of-Domain Filter**:
   - Non-health queries (e.g. coding, crypto, politics, sports) are politely redirected back to Ayurvedic lifestyle, diet, and seasonal balance.
3. **Mandatory Classical Disclaimer**:
   - Every message reinforces: *"AYUSHYA educational guidance grounded in classical Samhitas. Consult a registered BAMS/MD Ayurvedic physician for acute diagnosis and clinical prescription."*
4. **Anti-Hallucination Grounding**:
   - The LLM's system prompt strictly confines herbal dosages, contraindications, and dietary rules to the retrieved canonical treatise chunks.

---

## 🎯 5. How to Pitch This to SIH Judges

When presenting AyurMitra to the hackathon jury:

1. **State the Problem with Generic AI**:
   > *"If you ask ChatGPT or Gemini an Ayurvedic question, it often hallucinates modern popular myths—like recommending curd at night with pepper or suggesting heated honey. Classical Ayurveda forbids both."*
2. **Present AYUSHYA’s Solution**:
   > *"AYUSHYA solves this through a dual-vector RAG architecture grounded in the Brihat-Trayi (Charaka, Sushruta, Vagbhata) and Laghu-Trayi. Our system retrieves exact verse-level classical authority (Shastriya Pramana) and personalizes recommendations to the patient's biological Prakriti phenotype and active Vikriti delta."*
3. **Showcase the Explainable AI (XAI) Feature**:
   > *"Notice the 'Classical Authority' badge under every AyurMitra message. Judges can click and inspect the exact treatise, chapter, and verse cited. This bridges 3,000-year-old Vedic science with modern AI transparency."*

---
*Created and maintained by the AYUSHYA Development Team for SIH-2026.*
