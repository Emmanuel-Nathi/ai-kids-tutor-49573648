## Goal

Stop the owls from disappearing/jumping while scrolling by removing the 3D `OwlScene` Canvas instances from the Landing page and replacing them with a simple, reliable `InteractiveOwl` image component anchored absolutely to the page.

## Why this fixes it for good

The current owls use a WebGL `<Canvas>` (R3F) embedded inside flex/bento containers. WebGL canvases are sensitive to parent layout/resize/visibility — that's why they "disappear or change position" on scroll across devices. A plain `<img>` inside a Framer Motion `motion.div` with `position: absolute` has zero layout/resize fragility.

## Changes

### 1. New file: `src/components/InteractiveOwl.tsx`

- Props: `variant: "hero" | "content"`.
- Uses `framer-motion` (`motion.div` + `useAnimation`).
- Image source: `@/assets/owl-mascot.png` (already in project — do NOT use `/owl-mascot.png` from the user's snippet, that file doesn't exist in `public/`).
- `onTap` + `whileHover` triggers a "Socratic Wiggle" (rotate + scale keyframes).
- Responsive Tailwind placement classes:
  - `hero` → `top-20 right-4 w-16 md:top-24 md:right-10 md:w-28 lg:top-32 lg:right-24 lg:w-36`
  - `content` → `bottom-10 left-4 w-16 md:bottom-20 md:left-10 md:w-24 lg:bottom-32 lg:left-24 lg:w-32`
- `absolute z-40 cursor-pointer pointer-events-auto`, `drop-shadow-2xl` on the image.
- `alt="Socratic Owl"`, `loading="lazy"`, `draggable={false}`.

### 2. Edit `src/pages/Landing.tsx`

- Remove the `lazy` import of `OwlScene` and both `<Suspense><OwlScene .../></Suspense>` blocks (the one in the hero, and the one inside the large bento card).
- Remove the now-unused `OwlMascot` import (it was only used as the Suspense fallback).
- Drop the wrapper `<div style={{ height: 180 }}>` in the hero and the `style={{ height: 200 }}` wrapper in the bento card — those existed only to reserve space for the Canvas. Replace the hero slot with a small spacer (or nothing, letting the badges sit higher) and let the bento's large card stand on its own with just icon + text.
- The Landing root already has `relative overflow-x-hidden` — confirm and add `overflow-hidden` on the root wrapper too (currently `overflow-x-hidden`, which is enough for absolute children that don't extend vertically beyond the page; we'll keep `overflow-x-hidden` to avoid clipping the sticky CTA / back-to-top).
- Mount the two owls as direct children of the root div, after the header:
  ```tsx
  <InteractiveOwl variant="hero" />
  <InteractiveOwl variant="content" />
  ```
  Anchored to the page (root is `relative`), they stay locked in viewport-relative spots while the user scrolls within their section of the document — exactly the requested behavior.

### 3. Leave `OwlScene.tsx` in place

It's still used in `AchievementRoom` and child pages. Only the Landing page references are removed.

## Acceptance

- Scroll up/down rapidly on mobile (390px), tablet, and desktop — both owls stay visible and pinned to their corners, never blanking out.
- Tapping/clicking either owl triggers the wiggle.
- No WebGL context on the Landing page (check DevTools → no `<canvas>`).
- No console errors; lazy-loaded `OwlScene` chunk is no longer fetched on `/`.
