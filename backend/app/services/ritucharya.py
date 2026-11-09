"""Classical six-season Ayurvedic calendar (Ritu) detection.

Pure function — no DB, no FastAPI imports — so it can be reused by
Ritucharya (Step 3) and unit-tested trivially.

Season boundaries use mid-month approximations based on the traditional
Indian Panchanga. A future pass with an Ayurveda reviewer can refine
these to region-specific almanac dates.
"""

from datetime import date
from typing import Optional


# Each entry: (start_month, start_day, end_month, end_day)
# Ranges are inclusive on both ends.
_RITU_CALENDAR = [
    {
        "ritu": "shishir",
        "sanskrit_name": "Shishir Ritu",
        "english_name": "Late Winter",
        "months": "January – March",
        "aggravates": "kapha",
        "pacifies": None,
        "start": (1, 14),
        "end": (3, 13),
    },
    {
        "ritu": "vasant",
        "sanskrit_name": "Vasant Ritu",
        "english_name": "Spring",
        "months": "March – May",
        "aggravates": "kapha",
        "pacifies": None,
        "start": (3, 14),
        "end": (5, 14),
    },
    {
        "ritu": "grishma",
        "sanskrit_name": "Grishma Ritu",
        "english_name": "Summer",
        "months": "May – July",
        "aggravates": "pitta",
        "pacifies": "kapha",
        "start": (5, 15),
        "end": (7, 14),
    },
    {
        "ritu": "varsha",
        "sanskrit_name": "Varsha Ritu",
        "english_name": "Monsoon",
        "months": "July – September",
        "aggravates": "vata",
        "pacifies": None,
        "start": (7, 15),
        "end": (9, 14),
    },
    {
        "ritu": "sharad",
        "sanskrit_name": "Sharad Ritu",
        "english_name": "Autumn",
        "months": "September – November",
        "aggravates": "pitta",
        "pacifies": None,
        "start": (9, 15),
        "end": (11, 14),
    },
    {
        "ritu": "hemant",
        "sanskrit_name": "Hemant Ritu",
        "english_name": "Early Winter",
        "months": "November – January",
        "aggravates": None,
        "pacifies": "vata",
        "start": (11, 15),
        "end": (1, 13),  # wraps across year boundary
    },
]


def get_current_ritu(today: Optional[date] = None) -> dict:
    """Return the current Ritu (Ayurvedic season) for the given date.

    Returns a dict with keys: ritu, sanskrit_name, english_name, months,
    aggravates (nullable), pacifies (nullable).
    """
    if today is None:
        today = date.today()

    month, day = today.month, today.day

    for entry in _RITU_CALENDAR:
        s_month, s_day = entry["start"]
        e_month, e_day = entry["end"]

        # Handle Hemant which wraps across the year boundary (Nov–Jan)
        if s_month > e_month:
            in_range = (month > s_month or (month == s_month and day >= s_day)) or \
                       (month < e_month or (month == e_month and day <= e_day))
        else:
            in_range = (
                (month > s_month or (month == s_month and day >= s_day))
                and (month < e_month or (month == e_month and day <= e_day))
            )

        if in_range:
            return {
                "ritu": entry["ritu"],
                "sanskrit_name": entry["sanskrit_name"],
                "english_name": entry["english_name"],
                "months": entry["months"],
                "aggravates": entry["aggravates"],
                "pacifies": entry["pacifies"],
            }

    # Fallback — should never be reached with correct boundaries
    return {
        "ritu": "hemant",
        "sanskrit_name": "Hemant Ritu",
        "english_name": "Early Winter",
        "months": "November – January",
        "aggravates": None,
        "pacifies": "vata",
    }
