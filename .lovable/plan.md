## Goal

On mobile only (≤640px), move the two `InteractiveOwl` instances so they don't overlap any text or interactive element. Tablet/desktop placement stays exactly as it is today.

## Current mobile problems (390×844 viewport)

- **Hero owl** (`top-20 right-4 w-16`): sits at ~80px from the top, right edge — collides with the fixed `StickyNavbar` (h ~64px) and crowds the "CAPS / IEB / Cambridge" trust badges + hero card heading.
- **Content owl** (`bottom-10 left-4 w-16`): sits at ~40px from the bottom — overlaps the sticky mobile CTA bar (`fixed bottom-0` + `p-3`, ~76px tall) and the footer text.

## Fix (mobile-only Tailwind tweaks in `src/components/InteractiveOwl.tsx`)

Adjust only the mobile (default, no-prefix) classes inside `placementClasses`. All `md:` and `lg:` classes remain unchanged.

- **Hero variant**
  - From: `top-20 right-4 w-16`
  - To: `top-2 right-2 w-12` — tucks the owl into the top-right corner above the badges, smaller (48px) so it sits beside the navbar logo area without covering CTA buttons or the H1.
  - Add `pointer-events-none` wrapper note: keep `pointer-events-auto` so tap-to-wiggle still works; the smaller size + corner position means it no longer sits on top of any tappable element.

- **Content variant**
  - From: `bottom-10 left-4 w-16`
  - To: `bottom-24 left-2 w-12` — lifts it above the 76px sticky mobile CTA and shrinks to 48px so it floats over the side margin of the pricing/trust sections rather than over body copy.

Resulting `placementClasses`:

```ts
const placementClasses =
  variant === "hero"
    ? "top-2 right-2 w-12 md:top-24 md:right-10 md:w-28 lg:top-32 lg:right-24 lg:w-36"
    : "bottom-24 left-2 w-12 md:bottom-20 md:left-10 md:w-24 lg:bottom-32 lg:left-24 lg:w-32";
```

## Out of scope

- No changes to `StickyNavbar`, `Landing.tsx`, animations, or desktop/tablet layout.
- No new assets or props.

## Files touched

- **Edit**: `src/components/InteractiveOwl.tsx` (one-line className change)

Approve and I'll apply.