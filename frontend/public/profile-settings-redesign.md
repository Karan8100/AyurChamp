# Profile & Settings — Redesign

## Context

Current page only displays account info with no editing, no photo, and no
privacy controls. This redesign adds editable demographic fields, a
photo/avatar picker, and a Privacy & Data section — the last one isn't
optional polish, it's the DPDP Act data-principal rights (download/delete)
established as a requirement from the start of this project and never
actually built yet.

Don't touch the topbar/language pill — those work fine as-is.

---

## 1. New fields

- **Date of Birth** (not a raw "age" number — stays accurate over time,
  compute age from it wherever needed)
- **Gender** — free-choice options: Male / Female / Other / Prefer not to
  say. Not a forced binary.

Both are **optional**, filled in via this page, never blocking anything.
Do not retrofit these as mandatory on signup — that would break the
existing signed-up users' flow. If either is unfilled, show a small,
dismissible inline nudge: *"Add your age & gender for more personalized
insights."* No modal, no hard block.

Why gender matters here (so it doesn't look like arbitrary data
collection): the Dinacharya module already flags a pregnancy caution for
vigorous breathing techniques — this is the field that context would come
from later. Frame it that way if the UI needs a reason shown to the user,
not just "for our records."

---

## 2. Photo / Avatar picker

Clicking the avatar circle opens a picker with two tabs:

**Upload Photo** — standard file picker, basic client-side crop-to-square
before upload. This needs a real backend upload endpoint + storage (S3,
Cloudinary, or local disk — whichever fits current infra); flag this as an
actual decision to make, not something to stub out silently.

**Choose Avatar** — no new illustrated assets needed. Build 8 options by
combining existing `lucide-react` icons with the existing theme color
palette (brand green/gold, vata/pitta/kapha colors): e.g. Leaf, Flower,
Sun, Moon, Flame, Droplet, Mountain, Wind — each on a different theme-color
circle background.

If neither is chosen, keep the current letter-initial fallback — don't
force a selection.

---

## 3. Redesigned layout

Reorganize the single flat card into sections:

- **Profile header**: clickable avatar (opens the picker above), name,
  email, one **"Edit Profile"** button that toggles the whole card into an
  editable form (simpler to build than per-field inline editing — don't
  over-engineer this)
- **Personal Information**: Name, Date of Birth, Gender, Email (read-only
  — email is tied to auth, don't make it editable here)
- **Preferences**: Interface language (already exists, keep as-is), plus a
  new notification toggle for the weekly Vikriti check-in reminder
- **Account**: Account Role (read-only), Log out
- **Privacy & Data**: "Download my data" and "Delete my account"

---

## 3B. Visual design (matches the shared mockup)

A mockup of this redesign was reviewed and approved — match it, not just
the structure above. Reuse the existing theme tokens where they already
exist (`tailwind-v4` skill's `@theme` block, e.g. brand/dosha colors); if
any value below conflicts with a token already defined there, the existing
token wins — add these as new tokens in that same place rather than
hardcoding hex values inside components.

- **Section labels**: small header inside each card ("Personal
  information", "Preferences", etc.) — muted gray-green (`#7A7A6E`),
  11-12px, uppercase, slight letter-spacing. Not a page-level heading.
- **Cards**: white background, 12px radius, ~18px padding, stacked
  vertically with ~14px gaps between them, no visible border on most cards
- **Empty optional field** (DOB/Gender not yet filled): show `+ Add for
  better insights` in a warm gold tone (`#B8926A`) in place of a value —
  not a placeholder box, not grayed out. Should read as an inviting nudge,
  not a warning.
- **Avatar**: circular, defaults to brand green (`#2A4638`) background with
  a gold (`#C9A876`) leaf icon. A small white circular badge with a camera
  icon overlaps the bottom-right corner to signal it's editable.
- **Icon-avatar options** (extend this pattern to the full set of 8 from
  section 2): leaf icon on brand green `#2A4638`, wind icon on vata blue
  `#6B8FB5`, flame icon on pitta amber `#D89A4C`, droplet icon on kapha
  green `#6B9E6B` — plus a dashed-outline "upload" circle as the last
  option in the row.
- **Language switcher**: pill-shaped buttons side by side; active language
  filled brand green with cream text, inactive language outlined
  (`0.5px solid #D8D4C4`) with dark text.
- **Notification toggle**: standard rounded switch, brand green when on,
  light gray track when off.
- **Privacy & Data card**: same white card style as the others, but with a
  subtle warm-red outline (`0.5px solid #EAD9D5`) to set it apart as a more
  serious section — distinct, not alarming.
- **Delete account / Log out actions**: outlined buttons (not filled),
  text and border in a muted terracotta tone (`#A34A3D` text, `#E0C4BE`
  border) — reads as caution without looking like a harsh system error.

---

## 4. Privacy & Data section (required, not optional)

- **Download my data**: export the user's own rows — profile, Prakriti
  result, Vikriti check-in history — as a JSON file. No need for anything
  fancy, just a real export, not a stub button.
- **Delete my account**: soft-delete (`is_active = False`) is fine for now,
  but this must have a real confirmation step (type "delete" to confirm,
  or a two-step dialog) — never a single click with no confirmation. After
  confirming, log the user out immediately.

---

## 5. Technical notes

- Extend the `User` model: nullable `date_of_birth`, `gender` (small enum
  including "prefer not to say"), `avatar_type` (`photo` | `icon` | `none`),
  `avatar_value` (URL for photo, or an icon+color key for the icon option)
- These are additive columns — existing rows just get `NULL`/defaults,
  nothing breaks for existing users

---

## 6. Before calling this done

1. Confirm an existing user with no age/gender/avatar set sees the page
   render normally, with just the dismissible nudge — no blocking modal
2. Confirm avatar selection (both photo and icon paths) persists after a
   refresh
3. Confirm "Download my data" returns real data pulled from the DB, not a
   placeholder file
4. Confirm "Delete my account" requires explicit confirmation and actually
   logs the user out afterward
