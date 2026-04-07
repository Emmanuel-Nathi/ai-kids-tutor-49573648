

# Landing Page: Compact Hero + Sticky Floating Owl

## Overview

Three changes to the landing page: tighten the hero spacing, make the owl float to the side when scrolled past, and ensure the header stays sticky.

## 1. Reduce Hero Whitespace

**File:** `src/pages/Landing.tsx`

- Shrink the owl container from `max-w-[260px]/max-w-[320px]` with `containerHeight={280}` down to `max-w-[180px]/max-w-[220px]` with `containerHeight={180}`
- Remove `mb-4` from the owl wrapper
- Remove the separate "Let's make homework fun!" `<p>` tag — fold it into the hero card as a subtitle or remove entirely (it adds vertical space without value)
- Change hero section padding from `py-10 md:py-0` to `py-4 md:py-8` to reduce top/bottom gaps
- Reduce trust badges `mt-4 sm:mt-6` to `mt-2 sm:mt-3`
- Reduce hero card `mt-6 sm:mt-8` to `mt-4 sm:mt-5`

## 2. Floating Owl on Scroll

**File:** `src/pages/Landing.tsx`

- Use an `IntersectionObserver` on the owl's original container (similar to the existing `heroRef` pattern)
- Track `owlOutOfView` state — when the owl's container scrolls out of the viewport, set it to `true`
- Render a **fixed miniature owl** in the bottom-left corner (e.g., `fixed bottom-20 left-4 z-40 w-16 h-16`) that appears only when `owlOutOfView` is true
- Use `framer-motion` `AnimatePresence` for a smooth slide-in/out transition (slide up from below + fade)
- The floating owl uses the lightweight `<OwlMascot size="sm" />` (2D) to avoid a second WebGL context
- On mobile, position it `bottom-24` to stay above the sticky CTA bar

## 3. Header Already Sticky (Verify)

The header is already `sticky top-0 z-50` (line 119). No changes needed — it persists on scroll. The `glass` class provides the backdrop-blur effect.

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Landing.tsx` | Tighten hero spacing, add floating owl with IntersectionObserver |

