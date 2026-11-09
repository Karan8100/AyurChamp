// Resolves a Prakriti question option's `image_key` to a local asset URL.
//
// Images are sourced separately (see frontend/src/assets/prakriti/IMAGE_GUIDE.md)
// and dropped into frontend/src/assets/prakriti/ later. This uses Vite's
// import.meta.glob to pick up whatever files already exist in that folder —
// so once someone adds e.g. `body_frame_vata.svg`, it resolves automatically
// with zero code changes. Until then, `getPrakritiImage` simply returns
// `undefined` and callers should fall back to a text-only rendering.
const imageModules = import.meta.glob<{ default: string }>(
  '../assets/prakriti/*.{png,jpg,jpeg,svg,webp}',
  { eager: true },
)

const keyToUrl: Record<string, string> = {}

for (const path in imageModules) {
  const fileName = path.split('/').pop() ?? ''
  const key = fileName.replace(/\.[a-zA-Z0-9]+$/, '')
  keyToUrl[key] = imageModules[path].default
}

export function getPrakritiImage(imageKey?: string | null): string | undefined {
  if (!imageKey) return undefined
  return keyToUrl[imageKey]
}
