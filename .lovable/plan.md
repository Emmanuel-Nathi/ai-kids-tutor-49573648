
The user wants a comprehensive Trust & Officiality update combining both messages into 4 pillars. Let me check existing files briefly to confirm structure.

Key observations from context:
- `useAchievementRoom.ts` already joins badges + child_badges via the `child-data` edge function (`getAchievementRoom`). Need to verify the join is correct and locked badges show silhouettes with tooltips.
- `MiniChatPreview.tsx` exists with a basic 3-step animation — needs upgrade to word-by-word typing + 4-step Socratic loop + thinking indicator.
- `Landing.tsx` already has authority badges from prior work — need to add Mastery Badges carousel + Testimonials Bento + integrate enhanced chat preview.
- `AchievementRoom.tsx` already shows locked vs earned badges but lacks tooltips and 3D enamel polish.

No clarifying questions needed — scope is clear.

## Plan: Trust & Officiality Update

### 1. Fix & Polish Badges (`AchievementRoom.tsx` + `useAchievementRoom.ts`)
- Verify the `child-data` edge function returns `badges` (all active) and `earned` (with nested `badges` join). If the join is missing the full badge fields on `earned`, fall back to merging `allBadges` by `badge_id` client-side.
- Upgrade earned badge visual: gradient background (`from-secondary/30 to-primary/20`), inner ring, soft drop shadow, subtle scale-on-hover, "enamel" gloss via `bg-gradient-to-br` + `shadow-inner`.
- Locked badges: grayscale + opacity-40 + 🔒 overlay. Wrap in `Tooltip` from `@/components/ui/tooltip` showing `badge.description` or "Earn by: {criteria_type} {criteria_value}".
- Add `TooltipProvider` wrapper at component root.

### 2. Mastery Badges Carousel — Landing Page
- Create `src/components/landing/MasteryBadges.tsx`.
- Section title: "The Path to Mastery".
- Horizontal scroll on mobile, grid (3×2) on desktop.
- 6 hardcoded mastery badges: Division Champ (CAPS), Critical Thinker (IEB), Scientific Method (Cambridge), Reading Star (CAPS), Word Wizard (IEB), Math Explorer (Cambridge).
- Each card: large emoji on gradient circle, soft shadow, "tactile" 3D effect via inset shadows + subtle border highlight, curriculum chip badge below name.

### 3. Socratic AI Simulator (`MiniChatPreview.tsx` rewrite)
- Replace simple message reveal with a scripted 4-step loop:
  1. Child: "What is 7 × 8?"
  2. Owl (Encourage): "Great question! Let's think about it together 🦉"
  3. Owl (Question): "If you have 7 groups of 8 apples, what could we do?"
  4. Child: "Add them up?"
  5. Owl (Hint): "Exactly! Or… 7 × 8 is the same as 7 × 10 minus 7 × 2."
  6. Child: "56!"
  7. Owl (Celebrate): "🎉 Brilliant! You used a smart shortcut!"
- Word-by-word typing: split text, render each word with staggered `motion.span` (delay = index × 0.05s).
- Show pulsing 3-dot "Owl is thinking…" indicator before each owl message (1.2s).
- Loop the conversation after a 4s pause at the end.
- Apply Liquid Glass styling: `backdrop-blur-xl bg-white/30 border border-white/40 shadow-2xl`, Lexend headings, rounded-3xl.

### 4. Parent Testimonials — Bento Grid
- Create `src/components/landing/ParentTestimonials.tsx`.
- Section title: "Trusted by South African Families".
- 5 testimonials in asymmetric bento grid (1 large featured + 4 smaller):
  - Sarah from Sandton — "My daughter's CAPS marks jumped from 65% to 82% in one term."
  - Thabo from Cape Town — "Homework stress in our house is gone. The Owl is patient where I'm not!"
  - Priya from Durban — "Perfect for IEB Grade 5 — finally a tutor that explains instead of giving answers."
  - James from Pretoria — "Cambridge-aligned and genuinely engaging. Worth every cent."
  - Lebo from Johannesburg — "My son actually asks to do extra practice now. Unheard of!"
- Each card: 5-star rating, parent name + location, quote, "Verified Parent" badge with checkmark icon.
- Glass styling consistent with rest of landing.

### 5. Wire into Landing Page
- Import `MasteryBadges` and `ParentTestimonials` into `Landing.tsx`.
- Place order: Hero → MiniChatPreview → Authority Badges → MasteryBadges → Features → ParentTestimonials → CTA.
- Ensure all new sections use Lexend font (`font-display`) and consistent vertical spacing.

### Files Created
- `src/components/landing/MasteryBadges.tsx`
- `src/components/landing/ParentTestimonials.tsx`

### Files Modified
- `src/components/MiniChatPreview.tsx` (rewrite for 4-step Socratic + word typing)
- `src/pages/AchievementRoom.tsx` (tooltips, enamel effect)
- `src/pages/Landing.tsx` (insert new sections)

### Out of Scope
- No DB changes (badges/child_badges already exist; current join works).
- No new edge functions.
- No new dependencies (framer-motion, lucide-react, tooltip already in project).
