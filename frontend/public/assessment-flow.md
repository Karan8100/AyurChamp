# Ayushya — Assessment Flow Build Spec

## Context

The app shell and dashboard (empty + populated states) already exist. The
question bank (with `id`, `domain`, `text`, `image`, `options[]` each tagged
with a dosha) and the scoring/branching logic already exist too — **do not
recreate these**, wire the UI to them. If the backend doesn't yet expose
endpoints for the assessment itself, scaffold them following the same
JWT-authenticated pattern already used for `/auth` routes:

- `POST /assessment/start` — creates a session, returns the first question
- `POST /assessment/answer` — submits one answer, returns either the next
  question or a signal that the assessment is complete
- `GET /assessment/result` — returns the final dosha percentages + label

**Images are not ready yet.** Every question/option image is a placeholder
for now — reserve the exact layout space so nothing shifts when real images
are added later (details below). Don't skip the space just because the
image file doesn't exist.

**"New window" clarification:** this means a full-screen takeover route
within the app (no sidebar, no topbar) — not a literal new browser
window/tab. The user should never leave the app or lose their session.

---

## 1. Entry point — Dashboard empty state

Already spec'd in `design.md` — updated copy:

- Heading: **"Know Your Prakruti"**
- Subtext: *"Every person is unique. Take a short assessment to uncover your mind-body constitution and get wellness guidance made just for you."*
- Button (small, not oversized): **"Start Your Assessment"** → navigates to `/assessment`

---

## 2. `/assessment` route — full-screen takeover

No `AppShell`, no sidebar, no topbar. Own minimal header:
- Small Ayushya logo mark, top-left
- A close (X) icon, top-right, that returns to `/dashboard` (progress can be
  discarded for now — resuming a saved session is a future enhancement, not
  required this phase)

### 2a. Intro screen (first thing shown, before question 1)

- Heading: **"Let's find your Prakruti"**
- Subtext: *"This takes about 3–5 minutes. Answer honestly and go with your first instinct — there are no right or wrong answers, just what feels most like you."*
- Small reassurance line: *"You can go back and change any answer before you finish."*
- Button: **"Begin"**

### 2b. One question per screen

Layout, centered, generous whitespace:

- Top: progress bar + "Question {n} of {total}" (total is dynamic — it grows
  if the adaptive branching kicks in, so don't hardcode it)
- **Image slot**: a fixed-aspect container (suggest 4:3, rounded-2xl,
  cream/gray-100 background) directly above the question text. Render the
  actual `<img>` inside it only if `question.image` is set; if a question has
  no image field at all, hide the slot completely rather than showing an
  empty box. This reserves the exact space needed once images are added,
  without leaving visible empty placeholders on questions that were never
  meant to have one.
- Question text, large, centered
- 3 options, rendered as large tappable cards (not tiny radio buttons) —
  full width on mobile, roughly equal width in a row on desktop. Selected
  state: brand-green border + light fill, with a short Motion transition
  (per our animation conventions — under 250ms, no springs)
- (Optional, nice touch) a soft domain label above the question, e.g. "About
  your body" / "About your mind" for physical/psychological questions —
  makes the assessment feel structured rather than a generic quiz
- Bottom: **Back** (disabled on question 1) and **Next** buttons. Next stays
  disabled until an option is selected. Keep it explicit — don't
  auto-advance on selection, since users need to be able to change their
  mind before committing.
- Going Back must restore the previously selected option, not reset it

### 2c. Adaptive branching (silent to the user)

When the core questions are done, the flow calls the scoring service to
check the gap between the top two doshas. If ambiguous, it keeps pulling
2–3 questions at a time from the relevant tie-breaker bank and rechecking,
exactly per the existing scoring logic — the user should just experience
this as the question count growing slightly, not as a visible "phase 2"
label or anything clinical-sounding.

### 2d. Completion screen (after the last question, before the dashboard)

Don't jump straight to the dashboard — show this first:

- Heading: **"You're all done! 🌿"**
- Subtext: *"We've got everything we need to understand your unique constitution."*
- Button: **"Check Your Result"** → calls `GET /assessment/result`, then
  navigates to `/dashboard`

---

## 3. Dashboard, after completion

`useAssessmentStatus()` (already defined) now resolves to `"completed"` and
the populated dashboard state renders with real data. **Do not change the
diet recommendations card or the Ritucharya preview card** — leave those
exactly as already built.

### Fix the Prakruti chart: oval → true circle

The chart currently renders as an oval instead of a circle. This is almost
always an aspect-ratio issue — fix it and use your judgment to polish it
further:

- Wrap the chart in a container with an explicit `aspect-square` (Tailwind
  v4 utility) or equal fixed width/height — don't let it inherit a
  non-square parent size
- If using Recharts: give `PieChart`/`ResponsiveContainer` equal width and
  height, or set `aspect={1}` on `ResponsiveContainer`, so the pie renders
  as a true circle, not stretched

Suggested polish (optional, use your judgment):
- Animate the segments filling in on mount (short, calm — matches our
  animation conventions, not flashy)
- Rounded end-caps on each segment for a softer look, consistent with the
  app's rounded-corner design language
- A hover/tap tooltip on each segment showing the exact percentage and a
  one-line trait (reuses the same text already shown beside the chart)
- Center label stays dynamic: "Balanced Prakruti" if the doshas are close,
  or "{Dominant Dosha} Dominant" otherwise — this logic likely already
  exists from the earlier dashboard build, just confirm it's driven by the
  real result now instead of mock data

---

## 4. "Know more" — dosha education (new)

On the populated dashboard, each of the three dosha rows (Vata/Pitta/Kapha,
beside the donut chart) becomes clickable/tappable. Tapping one opens a
modal (or slide-over panel — agent's choice, whichever fits the existing
component patterns better) with **general educational content about that
dosha** — not the user's personal score. This is "what does Vata mean",
not "why is your Vata 35%".

This is static, vetted content — hardcode it in a small data file (e.g.
`doshaInfo.json` or a TS/JS constant), don't generate it live with an LLM:

**Vata** — Element: Air + Space. Qualities: dry, light, cold, mobile,
subtle. Governs: movement, breathing, circulation, nervous system,
elimination. Balanced: creative, energetic, quick-thinking, adaptable.
Imbalanced: anxious, restless, scattered, prone to dryness and irregularity.

**Pitta** — Element: Fire + Water. Qualities: hot, sharp, light, oily,
intense. Governs: digestion, metabolism, body temperature, intellect.
Balanced: focused, intelligent, goal-oriented, natural leader. Imbalanced:
irritable, impatient, prone to inflammation and acidity.

**Kapha** — Element: Earth + Water. Qualities: heavy, slow, cool, soft,
stable. Governs: structure, lubrication, immunity, stamina. Balanced: calm,
supportive, steady, loyal. Imbalanced: sluggish, resistant to change, prone
to weight gain and congestion.

Modal structure per dosha: dosha name + icon (reuse the same icon already
used on the dashboard row) → element tag → three short sections (Qualities,
Governs, When balanced / when imbalanced) → close button. Keep it short and
scannable — this is a quick lookup, not an article.

---

## 5. Data persistence — verify, don't assume

The assessment session, every individual answer, and the final computed
scores must actually be written to the database, not just held in frontend
state. Before considering this phase done, confirm:

- A new `AssessmentSession` row is created when `/assessment/start` is
  called, linked to the logged-in user
- Each answer is persisted as it's submitted (`QuestionResponse` rows or
  equivalent) — a page refresh mid-assessment shouldn't silently lose
  progress (resuming isn't required this phase, but silent data loss is a
  bug, not a missing feature)
- The final Vata/Pitta/Kapha percentages and dominant-dosha label are saved
  on the `AssessmentSession` row when the assessment completes — not
  recomputed from scratch on every dashboard load
- `useAssessmentStatus()` reads this saved result from the backend, it
  doesn't infer completion client-side from "did the user answer the last
  question"

---

## 6. Before calling this done

The scoring/branching logic already exists in the codebase — **read it
carefully rather than assuming its shape from this doc.** If anything here
(field names, response shape, how the tie-breaker banks are structured)
doesn't match the actual implementation, follow the existing code and flag
the mismatch rather than silently reworking the logic.

Once wired up, walk the full path end to end and confirm each piece
actually works, not just compiles:

1. Sign up as a fresh user → see the empty dashboard ("Know Your Prakruti")
2. Start the assessment → answer through to completion (try to trigger the
   tie-breaker branch at least once, if you can force an ambiguous result)
3. Reach "Check Your Result" → land on the dashboard with real percentages
   and the correct dominant-dosha label
4. Click each of the three dosha rows → confirm the education modal opens
   with the right content
5. Refresh the page → confirm the completed state persists (it should not
   reset back to "no assessment taken")
