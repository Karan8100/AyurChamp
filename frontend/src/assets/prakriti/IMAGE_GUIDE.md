# Prakriti Assessment — Image Sourcing Guide

This is a working checklist for collecting/creating the images used in the
Prakriti assessment question bank (`backend/app/data/prakriti_questions.py`).

**Important:** the UI must never show the words "Vata / Pitta / Kapha" next
to an option. Each option has a `display_label` (short, neutral caption) —
use that as the caption under the image, not the dosha name.

## General rules

- For each trait, source all options (2 or 3) from the **same icon/illustration
  set** — same style, same color palette, same pose/background. Mixing styles
  makes one option look "nicer" than another, which biases the user's pick.
- Prefer **illustrated/silhouette icons** over real photos of people. Real
  photos categorized by body/skin/hair type can feel judgmental — flat
  illustrations keep it neutral and inclusive.
- Format: **SVG preferred** (scalable, small file size). If SVG isn't
  available, use PNG at minimum 512x512 with a transparent background.
- Free sources to check first: [unDraw](https://undraw.co) (no attribution
  needed), [Storyset](https://storyset.com) (Freepik, attribution on free
  plan), [Flaticon](https://www.flaticon.com) (check each icon's license).
- Save every file into `frontend/src/assets/prakriti/` using the **exact
  filename** in the "Save as" column below (matches the `image_key` in the
  question bank — do not rename).

## Checklist — 22 images across 9 traits

### 1. Body frame (`P1_1`)
| Dosha | display_label | What to look for | Save as |
|---|---|---|---|
| vata | Slender & Lean | Thin/narrow silhouette, prominent joints, narrow shoulders | `body_frame_vata.svg` |
| pitta | Medium & Athletic | Moderate, proportionate, toned build | `body_frame_pitta.svg` |
| kapha | Broad & Solid | Wider frame, broad shoulders/hips, sturdy build | `body_frame_kapha.svg` |

Search terms: "body silhouette illustration flat", "body type icon set slim athletic heavy", "human body shape icons"

### 2. Skin texture (`P1_2`)
| Dosha | display_label | What to look for | Save as |
|---|---|---|---|
| vata | Dry & Cool | Dry/rough skin texture icon | `skin_texture_vata.svg` |
| pitta | Warm & Sensitive | Flushed/sensitive skin icon | `skin_texture_pitta.svg` |
| kapha | Smooth & Oily | Smooth, oily/glossy skin icon | `skin_texture_kapha.svg` |

Search terms: "skin type icon set dry oily sensitive flat"

### 3. Hair type (`P1_3`)
| Dosha | display_label | What to look for | Save as |
|---|---|---|---|
| vata | Dry & Frizzy | Dry, thin, frizzy hair icon | `hair_type_vata.svg` |
| pitta | Fine & Soft | Fine, straight, soft hair icon | `hair_type_pitta.svg` |
| kapha | Thick & Wavy | Thick, wavy/curly, lustrous hair icon | `hair_type_kapha.svg` |

Search terms: "hair type icon set straight wavy curly frizzy"

### 4. Eye appearance (`P1_4`)
| Dosha | display_label | What to look for | Save as |
|---|---|---|---|
| vata | Small & Active | Small eye shape icon | `eye_appearance_vata.svg` |
| pitta | Sharp & Bright | Almond/sharp, bright eye icon | `eye_appearance_pitta.svg` |
| kapha | Large & Calm | Large, round, calm eye icon | `eye_appearance_kapha.svg` |

Search terms: "eye shape icon set flat illustration"

### 5. Vein visibility (`VP_2`, 2 options only)
| Dosha | display_label | What to look for | Save as |
|---|---|---|---|
| vata | Highly Visible | Visible veins/tendons on hand or arm icon | `vein_visibility_vata.svg` |
| pitta | Moderately Visible | Smooth hand/arm icon, veins not prominent | `vein_visibility_pitta.svg` |

Search terms: "vein hand icon", "circulatory system hand icon"

### 6. Muscle tone (`PK_1`, 2 options only)
| Dosha | display_label | What to look for | Save as |
|---|---|---|---|
| pitta | Toned & Defined | Toned, defined muscle body icon | `muscle_tone_pitta.svg` |
| kapha | Solid & Dense | Bulky, solid, dense muscle body icon | `muscle_tone_kapha.svg` |

Search terms: "muscle body type icon toned bulky"

### 7. Complexion tone (`PK_3`, 2 options only)
| Dosha | display_label | What to look for | Save as |
|---|---|---|---|
| pitta | Warm / Reddish Tone | Warm, reddish/coppery skin tone icon or swatch | `complexion_tone_pitta.svg` |
| kapha | Cool & Fair Tone | Cool, pale/fair, clear skin tone icon or swatch | `complexion_tone_kapha.svg` |

Search terms: "skin tone swatch icon warm cool"

### 8. Nail texture (`VK_1`, 2 options only)
| Dosha | display_label | What to look for | Save as |
|---|---|---|---|
| vata | Brittle & Ridged | Brittle, thin, ridged nail icon | `nail_texture_vata.svg` |
| kapha | Strong & Smooth | Strong, thick, smooth nail icon | `nail_texture_kapha.svg` |

Search terms: "nail type icon set ridged smooth"

### 9. Teeth alignment (`VK_3`, 2 options only)
| Dosha | display_label | What to look for | Save as |
|---|---|---|---|
| vata | Small & Uneven | Small, uneven, spaced-out teeth icon | `teeth_alignment_vata.svg` |
| kapha | Large & Even | Large, even, aligned teeth icon | `teeth_alignment_kapha.svg` |

Search terms: "teeth icon set aligned uneven"

## Not included (intentionally no images)

The remaining 31 questions (appetite, sleep, memory, speech, spending,
decision-making, dreams, friendship style, etc.) are text-only — they
describe behaviours/feelings that don't map to a clean visual, so forcing
an image would feel arbitrary. Leave `image_key` unset for those.

## Once images are ready

Drop all files into `frontend/src/assets/prakriti/` with the exact filenames
above. Ping so the frontend `image_key -> asset` resolver can be wired up.
