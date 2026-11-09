# AYUSHYA (RAG-Veda) — REST API Specification

> **Complete RESTful API reference for Authentication, Multi-Phase Prakriti Assessment, Weekly Vikriti Tracking, 2-Tier Diet Planner, Dinacharya, and Ritucharya.**

---

## 1. Global Conventions & Standards

* **Base URL:** `http://localhost:8000` (Local) or Production Gateway URL
* **Authentication:** Standard HTTP Bearer Token: `Authorization: Bearer <JWT_TOKEN>`
* **Content-Type:** `application/json` for all request and response bodies.
* **Standard Error Response Format:**
  ```json
  {
    "detail": "Descriptive error message string"
  }
  ```
* **HTTP Status Codes:**
  * `200 OK`: Successful synchronous execution.
  * `201 Created`: Resource successfully created.
  * `400 Bad Request`: Payload validation or business logic error.
  * `401 Unauthorized`: Missing, expired, or invalid JWT token.
  * `404 Not Found`: Resource does not exist.
  * `500 Internal Server Error`: Unhandled server exception.

---

## 2. Authentication Endpoints (`/auth`)

### 2.1 User Registration
* **Endpoint:** `POST /auth/register`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "pankaj@example.com",
    "password": "StrongPassword123!",
    "name": "Pankaj Sharma"
  }
  ```
* **Response (`201 Created`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "pankaj@example.com",
      "name": "Pankaj Sharma",
      "role": "user",
      "preferred_language": "en"
    }
  }
  ```

---

### 2.2 User Login
* **Endpoint:** `POST /auth/login`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "pankaj@example.com",
    "password": "StrongPassword123!"
  }
  ```
* **Response (`200 OK`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "pankaj@example.com",
      "name": "Pankaj Sharma",
      "role": "user"
    }
  }
  ```

---

### 2.3 Current Authenticated User Profile
* **Endpoint:** `GET /auth/me`
* **Access:** Protected (Bearer JWT)
* **Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "email": "pankaj@example.com",
    "name": "Pankaj Sharma",
    "phone": null,
    "preferred_language": "hi",
    "role": "user",
    "is_active": true
  }
  ```

---

## 3. Prakriti Assessment Endpoints (`/assessment`)

### 3.1 Start or Resume Assessment
* **Endpoint:** `POST /assessment/start`
* **Access:** Protected (Bearer JWT)
* **Response (`200 OK`):**
  ```json
  {
    "session_id": 42,
    "status": "in_progress",
    "phase_reached": 1,
    "total_questions": 24,
    "questions": [
      {
        "id": "p1_q01",
        "phase": 1,
        "domain": "physical",
        "text": "How would you describe your natural physical body frame?",
        "options": [
          {"dosha": "vata", "label": "Slender, lean, difficulty gaining weight", "image_url": "/assets/prakriti/q1_vata.svg"},
          {"dosha": "pitta", "label": "Medium build, athletic, easily maintains weight", "image_url": "/assets/prakriti/q1_pitta.svg"},
          {"dosha": "kapha", "label": "Broad, heavy frame, gains weight easily", "image_url": "/assets/prakriti/q1_kapha.svg"}
        ]
      }
    ]
  }
  ```

---

### 3.2 Submit Question Answer (Idempotent Upsert)
* **Endpoint:** `POST /assessment/answer`
* **Access:** Protected (Bearer JWT)
* **Request Body:**
  ```json
  {
    "session_id": 42,
    "question_id": "p1_q01",
    "phase": 1,
    "domain": "physical",
    "selected_dosha": "vata"
  }
  ```
* **Response (`200 OK`):**
  ```json
  {
    "status": "recorded",
    "answered_count": 1,
    "total_phase1": 24
  }
  ```

---

### 3.3 Complete Assessment & Calculate Scores
* **Endpoint:** `POST /assessment/complete`
* **Access:** Protected (Bearer JWT)
* **Request Body:**
  ```json
  {
    "session_id": 42
  }
  ```
* **Response Case A (Tie-Breaker Triggered — `200 OK`):**
  ```json
  {
    "status": "tie_breaker_required",
    "phase_reached": 2,
    "tie_break_pair": "vata_pitta",
    "additional_questions": [
      {
        "id": "tb_vp_01",
        "phase": 2,
        "domain": "physiological",
        "text": "Under extreme mental pressure, what is your initial involuntary reaction?",
        "options": [
          {"dosha": "vata", "label": "Anxiety, restlessness, insomnia"},
          {"dosha": "pitta", "label": "Irritation, anger, critical outbursts"}
        ]
      }
    ]
  }
  ```
* **Response Case B (Final Result Computed — `200 OK`):**
  ```json
  {
    "status": "completed",
    "result": {
      "vata_score": 48.5,
      "pitta_score": 32.0,
      "kapha_score": 19.5,
      "result_type": "vata_dominant",
      "dominant_dosha": "vata",
      "summary": "Vata dominant phenotype with moderate Pitta influence."
    }
  }
  ```

---

### 3.4 Get User Assessment Status
* **Endpoint:** `GET /assessment/status`
* **Access:** Protected (Bearer JWT)
* **Response (`200 OK`):**
  ```json
  {
    "status": "completed",
    "result": {
      "vata_score": 48.5,
      "pitta_score": 32.0,
      "kapha_score": 19.5,
      "result_type": "vata_dominant"
    }
  }
  ```

---

## 4. Weekly Vikriti Tracking Endpoints (`/vikriti`)

### 4.1 Start Weekly Check-in
* **Endpoint:** `POST /vikriti/start`
* **Access:** Protected (Bearer JWT)
* **Response (`200 OK`):**
  ```json
  {
    "checkin_id": 108,
    "status": "in_progress",
    "questions": [
      {
        "id": "v_q01",
        "text": "How has your digestion and appetite felt over the past 3 to 7 days?",
        "options": [
          {"dosha": "vata", "label": "Irregular, gassy, bloated, variable appetite"},
          {"dosha": "pitta", "label": "Excessive heat, acid reflux, intense hunger"},
          {"dosha": "kapha", "label": "Heavy, sluggish, low appetite, slow transit"}
        ]
      }
    ]
  }
  ```

---

### 4.2 Complete Weekly Check-in & Compute Aggravation
* **Endpoint:** `POST /vikriti/complete`
* **Access:** Protected (Bearer JWT)
* **Request Body:**
  ```json
  {
    "checkin_id": 108
  }
  ```
* **Response (`200 OK`):**
  ```json
  {
    "status": "completed",
    "vata_score": 50.0,
    "pitta_score": 30.0,
    "kapha_score": 20.0,
    "vata_delta": 21.43,
    "pitta_delta": 0.0,
    "kapha_delta": 0.0,
    "most_aggravated": "vata",
    "tip": "Grounding warm diet with cow's ghee and sesame oil massage recommended."
  }
  ```

---

### 4.3 Get Latest Vikriti Status
* **Endpoint:** `GET /vikriti/latest`
* **Access:** Protected (Bearer JWT)
* **Response (`200 OK`):**
  ```json
  {
    "id": 108,
    "vata_score": 50.0,
    "pitta_score": 30.0,
    "kapha_score": 20.0,
    "vata_delta": 21.43,
    "pitta_delta": 0.0,
    "kapha_delta": 0.0,
    "most_aggravated": "vata",
    "days_ago": 0,
    "is_stale": false,
    "created_at": "2026-09-07T12:00:00Z"
  }
  ```

---

## 5. 2-Tier Diet Planner Endpoints (`/diet`)

### 5.1 Get Synthesized Dynamic Diet Plan
* **Endpoint:** `GET /diet/plan`
* **Access:** Protected (Bearer JWT)
* **Response (`200 OK`):**
  ```json
  {
    "dosha": "Vata",
    "dosha_principle": "Favor warm, nourishing, easily digestible unctuous foods to pacify cool dry Vata.",
    "has_vikriti": true,
    "vikriti_stale": false,
    "meals": [
      {
        "meal": "Breakfast",
        "name": "Warm Spiced Stewed Apple & Oat Porridge",
        "description": "Slow-cooked rolled oats in spiced almond milk with cinnamon and cardamom.",
        "weekly_adjustment": "Add a teaspoon of organic cow's ghee and soaked raisins to ground active Vata.",
        "adapted_for": "vata"
      },
      {
        "meal": "Lunch",
        "name": "Warm Yellow Moong Khichdi with Ghee",
        "description": "Split yellow lentils and aged basmati rice tempered with cumin and ginger.",
        "weekly_adjustment": "Double the cumin and ginger tempering to kindle sluggish digestive Agni.",
        "adapted_for": "vata"
      },
      {
        "meal": "Dinner",
        "name": "Spiced Butternut Squash Soup",
        "description": "Pureed roasted squash seasoned with nutmeg, rock salt, and coconut cream.",
        "weekly_adjustment": "Serve strictly warm before 7:30 PM to avoid evening gas formation.",
        "adapted_for": "vata"
      }
    ],
    "favor_foods": ["Warm cooked grains", "Cow's ghee", "Root vegetables", "Sweet juicy fruits"],
    "reduce_foods": ["Raw salads", "Cold drinks", "Dry crackers", "Excessive beans"],
    "ritu": {
      "ritu": "varsha",
      "sanskrit_name": "Varsha Ritu (वर्षा ऋतु)",
      "english_name": "Monsoon",
      "months": "Mid July – Mid September",
      "aggravates": "vata",
      "pacifies": "pitta"
    },
    "seasonal": {
      "note": "Monsoon humidity impairs internal Agni while aggravating ambient Vata dosha.",
      "tips": ["Drink warm boiled water (Ushnodaka)", "Use aged grains rather than newly harvested crops"],
      "favor": ["Ginger", "Rock salt (Saindhava)", "Garlic", "Lemon"],
      "reduce": ["Raw sprouts", "Leafy green salads", "Cold dairy"]
    }
  }
  ```

---

## 6. Dinacharya & Lifestyle Recommendations (`/recommendations`)

### 6.1 Get Circadian Lifestyle Guidance
* **Endpoint:** `GET /recommendations/lifestyle`
* **Access:** Protected (Bearer JWT)
* **Response (`200 OK`):**
  ```json
  {
    "sleep": {
      "duration_hours": "7.5 – 8.5 Hours",
      "recommended_window": "10:00 PM – 6:00 AM",
      "temperament": "Light, prone to midnight awakening when overstimulated.",
      "bedtime_ritual": ["Foot massage with warm sesame oil (Pada Abhyanga)", "Warm nutmeg milk"],
      "weekly_adaptation": "Shift bedtime 30 minutes earlier to pacify active Vata nervous tension."
    },
    "exercise": {
      "intensity_level": "Mild to Moderate (Ardha-Shakti Rule)",
      "intensity_meaning": "Exercise until light perspiration appears on forehead and armpits (50% capacity).",
      "recommended_modalities": ["Hatha Yoga", "Brisk walking in nature", "Gentle swimming"],
      "optimal_time": "Early morning (6:00 AM – 10:00 AM)",
      "weekly_adaptation": "Substitute high-intensity interval workouts with restorative grounding yoga."
    },
    "pranayama": {
      "technique_name": "Alternate Nostril Breathing",
      "technique_sanskrit": "Nadi Shodhana Pranayama",
      "description": "Balances Ida and Pingala nadis, instantly settling erratic mental prana.",
      "steps": [
        "Sit comfortably with spine erect",
        "Close right nostril with right thumb, inhale slowly through left nostril for 4 counts",
        "Close both nostrils, hold gently for 2 counts",
        "Exhale through right nostril for 4 counts"
      ],
      "duration": "5 to 10 minutes before sunrise or before bedtime",
      "contraindication": "Do not practice breath retention (Kumbhaka) if experiencing high blood pressure or pregnancy."
    },
    "circadian_phases": {
      "morning": {
        "title": "Awakening, Cleanse & Movement",
        "focus": "Clearing metabolic waste (Ama) and awakening digestive fire (Agni).",
        "active_dosha": "Kapha Period (6:00 AM – 10:00 AM)",
        "actions": ["Tongue scraping (Jihwa Nirlekhana)", "Holding sesame oil in mouth (Gandusha)"]
      },
      "midday": {
        "title": "Peak Digestion & Mental Output",
        "focus": "Solar and internal Agni peak; primary meal window.",
        "active_dosha": "Pitta Period (10:00 AM – 2:00 PM)",
        "actions": ["Consume main meal of the day", "Engage in demanding analytical work"]
      },
      "afternoon": {
        "title": "Creative Flow & Mindful Transition",
        "focus": "Mental agility is high; avoid physical exhaustion.",
        "active_dosha": "Vata Period (2:00 PM – 6:00 PM)",
        "actions": ["Sip warm herbal tea", "Creative collaboration and writing"]
      },
      "evening": {
        "title": "Nourishing Dinner & Rest Preparation",
        "focus": "Wind down biological systems for cellular repair.",
        "active_dosha": "Kapha Period (6:00 PM – 10:00 PM)",
        "actions": ["Light dinner before 7:30 PM", "Turn off digital blue-light screens by 9:30 PM"]
      }
    }
  }
  ```

---

## 7. Ritucharya Seasonal Endpoints (`/ritucharya`)

### 7.1 Get Current Season Dossier
* **Endpoint:** `GET /ritucharya/current`
* **Access:** Public / Protected
* **Response (`200 OK`):**
  ```json
  {
    "ritu": "varsha",
    "sanskrit_name": "Varsha Ritu (वर्षा ऋतु)",
    "english_name": "Monsoon",
    "solstice": "Visarga Kala (Southern Solstice / Strengthening)",
    "months": "Shravana – Bhadrapada (Mid July – Mid September)",
    "dosha_dynamics": {
      "aggravates": "Vata",
      "accumulates": "Pitta",
      "pacifies": "Kapha"
    },
    "digestive_agni": "Manda (Weakened by moisture and cloud cover)",
    "predominant_rasa": "Amla (Sour)",
    "dietary_guidelines": "Warm, freshly prepared meals with aged wheat, barley, and cow's ghee.",
    "lifestyle_guidelines": "Gentle dry silk brushing (Garshana) to stimulate lymphatic flow; avoid day naps."
  }
  ```
