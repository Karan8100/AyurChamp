"""Pure, deterministic scoring logic for the Prakriti assessment.
Kept free of DB/FastAPI imports so it can be reused to recompute
historical results if the algorithm changes later.
"""

from typing import Optional

from app.data.prakriti_questions import PHASE1_QUESTIONS, TIE_BREAKER_BANKS

CONFIDENT_GAP = 25
TIEBREAK_STOP_GAP = 20
MAX_QUESTIONS = 36  # 24 Phase 1 (v3 question bank) + 12 Phase 2 tie-breakers
MIN_TIEBREAK_BEFORE_CHECK = 2
TRIDOSHIC_SPREAD = 12

DOSHAS = ("vata", "pitta", "kapha")


def compute_scores(dosha_counts: dict) -> dict:
    total = sum(dosha_counts.values())
    if total == 0:
        return {d: 0.0 for d in DOSHAS}
    return {d: round(dosha_counts.get(d, 0) / total * 100, 2) for d in DOSHAS}


def ranked(scores: dict) -> list:
    return sorted(scores.items(), key=lambda kv: kv[1], reverse=True)


def gap(scores: dict) -> float:
    top = ranked(scores)
    return round(top[0][1] - top[1][1], 2)


def next_phase1_question(answered_ids: set) -> Optional[dict]:
    for q in PHASE1_QUESTIONS:
        if q["id"] not in answered_ids:
            return q
    return None


CANONICAL_PAIRS = {
    frozenset(["vata", "pitta"]): "vata_pitta",
    frozenset(["pitta", "kapha"]): "pitta_kapha",
    frozenset(["vata", "kapha"]): "vata_kapha",
}


def pair_from_top_two(scores: dict) -> str:
    top = ranked(scores)
    pair_set = frozenset([top[0][0], top[1][0]])
    return CANONICAL_PAIRS.get(pair_set, f"{top[0][0]}_{top[1][0]}")


def next_tiebreak_question(pair: Optional[str], answered_ids: set) -> Optional[dict]:
    if not pair or pair not in TIE_BREAKER_BANKS:
        return None
    for q in TIE_BREAKER_BANKS[pair]:
        if q["id"] not in answered_ids:
            return q
    return None


def classify(scores: dict) -> str:
    top = ranked(scores)
    if gap(scores) >= TIEBREAK_STOP_GAP:
        return top[0][0]
    values = sorted(scores.values(), reverse=True)
    if values[0] - values[2] <= TRIDOSHIC_SPREAD:
        return "tridoshic"
    pair_set = frozenset([top[0][0], top[1][0]])
    return CANONICAL_PAIRS.get(pair_set, f"{top[0][0]}_{top[1][0]}")


def decide_next_step(
    phase_reached: int,
    tie_break_pair: Optional[str],
    dosha_counts: dict,
    answered_phase1_ids: set,
    answered_phase2_ids: set,
) -> dict:
    """Returns {"action": "ask", "phase", "question", "tie_break_pair"}
    or {"action": "finish", "scores", "result_type"}.
    """
    total_answered = len(answered_phase1_ids) + len(answered_phase2_ids)
    scores = compute_scores(dosha_counts)

    if phase_reached == 1:
        next_q = next_phase1_question(answered_phase1_ids)
        if next_q is not None:
            return {"action": "ask", "phase": 1, "question": next_q, "tie_break_pair": None}

        if gap(scores) >= CONFIDENT_GAP:
            return {"action": "finish", "scores": scores, "result_type": classify(scores)}

        pair = pair_from_top_two(scores)
        return {
            "action": "ask",
            "phase": 2,
            "question": next_tiebreak_question(pair, set()),
            "tie_break_pair": pair,
        }

    enough_asked = len(answered_phase2_ids) >= MIN_TIEBREAK_BEFORE_CHECK
    hit_gap = enough_asked and gap(scores) >= TIEBREAK_STOP_GAP
    hit_cap = total_answered >= MAX_QUESTIONS
    bank_exhausted = next_tiebreak_question(tie_break_pair, answered_phase2_ids) is None

    if hit_gap or hit_cap or bank_exhausted:
        return {"action": "finish", "scores": scores, "result_type": classify(scores)}

    return {
        "action": "ask",
        "phase": 2,
        "question": next_tiebreak_question(tie_break_pair, answered_phase2_ids),
        "tie_break_pair": tie_break_pair,
    }
