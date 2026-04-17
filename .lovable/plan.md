
Three small additions to `src/pages/Landing.tsx`:

### 1. Back-to-top button
- New floating button, bottom-right, appears after scrolling past hero (reuse existing `showStickyCTA` IntersectionObserver state — same trigger).
- Circular glass button, `ArrowUp` icon from lucide-react, `onClick` scrolls to top smoothly.
- Positioned `bottom-20 right-4` on mobile (above sticky CTA), `bottom-6 right-6` on desktop.
- Framer Motion fade/slide-in.

### 2. Sticky header with CTA (already sticky)
- Header is already `sticky top-0 z-50` — confirmed in current code.
- No structural change needed; just verify the "Get Started" CTA stays visible (it does — it's inside the sticky header).
- Minor polish: ensure header has solid-enough glass backdrop when scrolled so CTA stays legible over varied content. Add subtle `shadow-sm` on scroll via a small scroll listener that toggles a class.

### 3. Confirm Owls don't shift on scroll
- Hero owl: lives inside `<section ref={heroRef}>` — static flow, no transform on scroll. ✓
- Bento card owl: lives inside the bento grid card — static flow. ✓
- Background blobs use `motion` parallax `y` transforms — these are decorative blobs, NOT owls, so they're fine to keep.
- No code change needed for owls; will confirm via session inspection after implementation.

### Files modified
- `src/pages/Landing.tsx` only (add `ArrowUp` import, back-to-top button, optional header scroll-shadow class).

### Out of scope
- No new components, no dependency changes.
