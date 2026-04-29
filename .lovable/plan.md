## Replace Landing header with optimized `StickyNavbar`

### 1. Create `src/components/StickyNavbar.tsx`
- Uses `useScroll` + `useMotionValueEvent` (threshold 50px) to toggle scrolled state off the React render path.
- `fixed top-0 z-50`, transparent at top, glass (`bg-background/80 backdrop-blur-md border-b border-border shadow-lg`) when scrolled.
- Logo: `TransparentLogo` with `@/assets/logo.png` (per Logo Rendering memory) + brand wordmark, click → `/`.
- Secondary action (desktop only): "I'm a Kid 🎒" → `/child-login`.
- Primary CTA: "Start Free Trial" → fires `gtag` + `posthog` `begin_checkout` then `navigate("/auth")`. Uses `bg-gradient-to-r from-primary to-primary/80` (Sage Green token), not hardcoded colors.

### 2. Edit `src/pages/Landing.tsx`
- Import and mount `<StickyNavbar />` at top of root wrapper.
- Remove the existing `<header ref={headerRef}>` block, the `headerRef`, `headerScrolled` state, and its scroll `useEffect`.
- Add `pt-20` to root container so hero clears the now-`fixed` nav (old header was `sticky` and reserved space).
- Leave `InteractiveOwl`, blobs, hero, sections, sticky mobile CTA, back-to-top untouched.

### Notes
- Z-stack: blobs `-z-10` < owls (default) < navbar `z-50`. No conflicts.
- No route, auth, or owl changes.
