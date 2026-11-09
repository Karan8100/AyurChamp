"""Vikriti (current-state) weekly check-in questions.

Unlike Prakriti (PHASE1_QUESTIONS in prakriti_questions.py), which asks about
lifelong/stable traits, every question here is framed around "currently /
this past week" — same life domains, different timeframe.

Classical basis: Charaka Samhita Vimana Sthana's ten-fold examination
(dashavidha pariksha) explicitly treats prakriti (baseline constitution) and
current dosha vitiation (vikriti) as two separate examination parameters —
this file operationalizes the second one as a short, repeatable self-check.
(https://www.carakasamhitaonline.com/index.php/Vimana_Sthana)

Intentionally short (10 items, single-choice, ~2 minutes) since it's meant
to be retaken weekly. No adaptive branching — reuses compute_scores(),
ranked(), and gap() from the Prakriti scoring engine as-is.
"""

VIKRITI_QUESTION_BANK_VERSION = "v1"

VIKRITI_QUESTIONS = [
    {"id": "VIK_1", "domain": "physiological", "trait": "digestion_this_week",
     "text": "How has your digestion been over the past week?",
     "options": [
         {"dosha": "vata", "text": "Irregular — bloating or gas some days, fine on others."},
         {"dosha": "pitta", "text": "Sharp, but occasionally over-acidic or slightly loose."},
         {"dosha": "kapha", "text": "Slow and heavy — food sits for a long time after eating."},
     ]},
    {"id": "VIK_2", "domain": "physiological", "trait": "sleep_this_week",
     "text": "How has your sleep been lately?",
     "options": [
         {"dosha": "vata", "text": "Restless and light — waking up multiple times a night."},
         {"dosha": "pitta", "text": "Fine, but I've been waking up feeling warm or thirsty."},
         {"dosha": "kapha", "text": "Long, but I still feel groggy even after 8+ hours."},
     ]},
    {"id": "VIK_3", "domain": "physiological", "trait": "energy_this_week",
     "text": "How would you describe your energy levels this week?",
     "options": [
         {"dosha": "vata", "text": "Scattered — bursts of energy followed by sudden crashes."},
         {"dosha": "pitta", "text": "High, but a bit forced — pushing through some fatigue."},
         {"dosha": "kapha", "text": "Low and sluggish — unmotivated to move."},
     ]},
    {"id": "VIK_4", "domain": "physical", "trait": "skin_hair_this_week",
     "text": "Have you noticed any changes in your skin or hair lately?",
     "options": [
         {"dosha": "vata", "text": "Drier than usual, flaky, or rough patches."},
         {"dosha": "pitta", "text": "Breakouts, redness, or unusual sensitivity."},
         {"dosha": "kapha", "text": "Oilier than usual, or feeling heavy/congested."},
     ]},
    {"id": "VIK_5", "domain": "psychological", "trait": "mood_this_week",
     "text": "Which best describes your mood over the past week?",
     "options": [
         {"dosha": "vata", "text": "Anxious, worried, or mentally scattered."},
         {"dosha": "pitta", "text": "Irritable, impatient, or quick to snap."},
         {"dosha": "kapha", "text": "Low motivation, withdrawn, or emotionally heavy."},
     ]},
    {"id": "VIK_6", "domain": "physiological", "trait": "appetite_this_week",
     "text": "How has your appetite been this week?",
     "options": [
         {"dosha": "vata", "text": "Unpredictable — no hunger some days, sudden hunger others."},
         {"dosha": "pitta", "text": "Excessive — I get irritable if a meal is delayed."},
         {"dosha": "kapha", "text": "Reduced — I could skip meals comfortably, food feels heavy."},
     ]},
    {"id": "VIK_7", "domain": "physiological", "trait": "bowel_this_week",
     "text": "How have your bowel movements been this week?",
     "options": [
         {"dosha": "vata", "text": "Irregular, dry, or harder than usual."},
         {"dosha": "pitta", "text": "Loose, frequent, or with a slight burning sensation."},
         {"dosha": "kapha", "text": "Sluggish, heavy, or feeling incomplete."},
     ]},
    {"id": "VIK_8", "domain": "physical", "trait": "discomfort_this_week",
     "text": "Which physical discomfort, if any, matches how you've felt lately?",
     "options": [
         {"dosha": "vata", "text": "Joint stiffness, cracking, or dryness-related aches."},
         {"dosha": "pitta", "text": "Inflammation, heat, burning, or acidity-type discomfort."},
         {"dosha": "kapha", "text": "Heaviness, congestion, or water retention."},
     ]},
    {"id": "VIK_9", "domain": "physiological", "trait": "temperature_this_week",
     "text": "Has your sensitivity to temperature changed recently?",
     "options": [
         {"dosha": "vata", "text": "Feeling colder than usual, especially hands and feet."},
         {"dosha": "pitta", "text": "Feeling warmer than usual, or overheating easily."},
         {"dosha": "kapha", "text": "No real change, but sluggish in cold or damp weather."},
     ]},
    {"id": "VIK_10", "domain": "psychological", "trait": "focus_this_week",
     "text": "How has your mental focus been this week?",
     "options": [
         {"dosha": "vata", "text": "Distracted, scattered thoughts, hard to concentrate."},
         {"dosha": "pitta", "text": "Sharp, but a bit impatient or overly critical."},
         {"dosha": "kapha", "text": "Foggy and slow to start, but steady once focused."},
     ]},
]


def compute_aggravation(prakriti_scores: dict, vikriti_scores: dict) -> dict:
    """This is the actual product insight, not the Vikriti score alone.

    A positive delta means that dosha is currently more elevated than the
    user's own natural baseline — i.e. currently aggravated. This is what
    should drive the "your Kapha is elevated this week" headline on the
    dashboard, not the raw Vikriti percentage in isolation.
    """
    return {
        d: round(vikriti_scores.get(d, 0) - prakriti_scores.get(d, 0), 2)
        for d in ("vata", "pitta", "kapha")
    }


def most_aggravated(aggravation: dict) -> str:
    return max(aggravation, key=aggravation.get)
