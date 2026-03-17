

# Code Splitting — Already Done, Enhance Loading Fallback

Code splitting with `React.lazy` and `Suspense` is **already fully implemented** in `App.tsx`. All pages (Auth, Paywall, ParentDashboard, AdminDashboard, ChildHome, etc.) are lazy-loaded. Landing is the only eagerly-loaded page, which is correct since it's the entry point.

The one improvement to make is enhancing the `LoadingFallback` component to be more visually appealing and kid-friendly.

## Changes

**`src/App.tsx`** — Also lazy-load `Landing` and upgrade `LoadingFallback`:
- Make Landing lazy too (minor gain, but consistent)
- Add animated bouncing dots, a subtle pulsing glow behind the owl, and a rotating set of fun loading messages like "Getting your owl ready...", "Sharpening pencils...", "Opening textbooks..."
- Use Framer Motion for smooth entrance animation

**No other files need changes** — the routing and lazy imports are already correct.

## LoadingFallback design

```text
┌──────────────────────────┐
│                          │
│      ╭───────────╮       │
│      │  🦉 Owl   │  ← pulsing glow ring
│      │  (large)  │
│      ╰───────────╯       │
│                          │
│   "Sharpening pencils…"  │  ← rotating message
│       ● ● ●              │  ← animated bouncing dots
│                          │
└──────────────────────────┘
```

