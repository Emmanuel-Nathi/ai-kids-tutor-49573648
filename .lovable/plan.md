

# Landing Page "Playful Prestige" Visual Overhaul

## What We Are Building
A complete visual redesign of the landing page applying 2026 design trends: glassmorphism, warm earthy palette, bento grid layout, interactive mascot, trust badges, mini-chat preview, scroll animations, and a sticky mobile CTA.

---

## Changes

### 1. Color Palette Update (`src/index.css`)
Replace the current orange/blue palette with a warm "Nature Distilled" scheme:
- Primary: Warm Sage Green (hsl ~145 30% 42%)
- Secondary: Ochre Gold (hsl ~38 65% 55%)
- Accent: Cloud Dancer warm white
- Background: Soft warm cream with subtle organic gradient
- Keep dark mode updated to match

### 2. Typography (`src/index.css`, `tailwind.config.ts`)
- Add Google Font "Lexend" as the display heading font (rounded, high-readability)
- Keep Inter for body text
- Remove Fredoka import, replace with Lexend

### 3. Glassmorphic Header (`Landing.tsx`)
Replace the current sticky header with a floating island nav:
- `backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl mx-4 mt-4 shadow-lg`
- Pill-shaped CTA buttons with soft gradients

### 4. Hero Section Overhaul (`Landing.tsx`)
- Wrap headline + CTA in a "Liquid Glass" card: `backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl shadow-2xl`
- Subtle organic SVG background pattern (soft blobs in sage/ochre)
- Trust badges (CAPS, IEB, Cambridge) immediately below the headline as gold-accented badge pills
- First-person CTA: "Start my 30-day free trial"
- Add a mini-chat preview window showing a 3-step Socratic interaction

### 5. Interactive Owl Mascot (`OwlMascot.tsx`)
- Add mouse-tracking: owl subtly rotates toward cursor position using `useMotionValue` + `useTransform` from Framer Motion
- Add periodic "glasses push" animation (scale pulse every 10s via `useEffect` timer)
- Add glassmorphic speech bubble with frosted effect

### 6. Bento Grid Features Section (`Landing.tsx`)
Replace the 3-column card grid with a bento layout:
- 2x2 asymmetric grid (one large card spanning 2 rows, three smaller)
- Each card: frosted glass (`backdrop-blur-sm bg-white/40 border border-white/20`)
- 3D-style icon containers with shadows and gradient backgrounds
- Hover "lift" effect: `hover:-translate-y-1 hover:shadow-xl transition-all`
- Add a 4th feature card: "Homework Photo Scanning"

### 7. Trust Section Upgrade (`Landing.tsx`)
- Replace checkmark list with visual authority badges in gold/sage containers
- Add shield/seal icons next to each point
- Glassmorphic card wrapper

### 8. Pricing Card (`Landing.tsx`)
- Glassmorphic card with gradient border
- First-person CTA: "Yes! Give me my free trial"
- Subtle glow/shimmer effect on the price

### 9. Scroll Reveal Animations (`Landing.tsx`)
- Each section uses Framer Motion `whileInView` with staggered slide-up + fade
- Already partially implemented; enhance with scale and blur transitions

### 10. Sticky Mobile CTA
- Add a fixed-bottom bar (visible only on mobile, only after scrolling past hero) with "Start my free trial" button
- Use `useEffect` + `IntersectionObserver` on the hero section to toggle visibility

### 11. Mini-Chat Preview Component (`src/components/MiniChatPreview.tsx`)
New component showing a scripted 3-step Socratic conversation:
- Kid: "What is 7x8?"
- Owl: "If you have 7 groups of 8... how many is that?"
- Kid: "56!"
- Styled as a small chat window with message bubbles, auto-animates on view

---

## Files to Create
- `src/components/MiniChatPreview.tsx` -- scripted chat demo

## Files to Modify
- `src/index.css` -- new color palette (sage, ochre, cloud dancer)
- `tailwind.config.ts` -- add Lexend font, update custom colors
- `src/pages/Landing.tsx` -- full restructure (glassmorphic header, hero glass card, trust badges, bento grid, mini-chat, sticky mobile CTA, first-person CTAs)
- `src/components/OwlMascot.tsx` -- mouse-tracking rotation, periodic glasses-push animation

## Notes
- We are using CSS/Tailwind glassmorphism (backdrop-blur + semi-transparent backgrounds) rather than external libraries
- The owl mascot remains a 2D PNG with enhanced Framer Motion animations (true 3D rendering or Lottie would require external asset files the user would need to provide separately)
- All scroll animations use Framer Motion's `whileInView` -- no additional libraries needed

