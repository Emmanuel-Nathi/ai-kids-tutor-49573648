

# Production-Ready Optimization + Phase 2 Growth Features

This is a large scope covering 4 optimization pillars and 3 growth features across ~20 files. Here's the full implementation plan.

---

## Part A: Production-Ready Optimization

### 1. Bug Fixes & UI Resilience

**Mobile Chat Fix** (`AIHomeworkHelper.tsx`)
- Use `window.visualViewport` API to detect keyboard open/close
- Dynamically adjust the chat container height so the input bar stays visible above the soft keyboard
- Add a `useEffect` that listens to `visualViewport.resize` events

**LoadingButton Component** (`src/components/ui/loading-button.tsx`)
- Create a reusable wrapper around shadcn Button that accepts `isLoading` prop
- Shows a `Loader2` spinner and disables the button when loading
- Apply it to: Auth form submit, ChildSetupWizard steps, Chat send button

**3D Optimization** (`OwlScene.tsx`)
- Install `react-intersection-observer`
- Wrap the `Canvas` render in an `useInView` check — only mount the WebGL context when the component is scrolled into view
- Show the 2D `OwlMascot` fallback when out of view

### 2. Backend & Security Hardening

**RLS Verification**
- `profiles` table: Already has user-scoped SELECT/UPDATE. No changes needed — policies correctly use `auth.uid() = user_id`.
- `rewards` table: Already has `auth.uid() = parent_id` on all CRUD. No changes needed.
- No `activity_logs` table exists — the equivalent is `child_activity_progress`, which already has parent_id checks via JOIN to `children`. No changes needed.

**Edge Function Message Trimming** (`ai-tutor/index.ts`)
- Before sending to the AI gateway, check if `messages.length > 10`
- If so, take the first 2 messages (system context) and last 8, then prepend a summary instruction asking the model to treat earlier context as already discussed
- This reduces token usage and keeps the AI focused on recent conversation

### 3. Conversion & Analytics Tracking

**Payment Success Logic** (`ParentDashboard.tsx`)
- Already implemented — the code fires GA4 `purchase` event, PostHog `Subscription Started`, and cleans the URL with `replaceState`. No changes needed.
- Will add a dedicated PostHog `Conversion` event name alongside the existing one for clarity.

**PWA Readiness** (`vite.config.ts`, `index.html`)
- PWA config exists with `theme_color: "#3b82f6"` (blue). The brand primary is actually sage green `hsl(145 30% 42%)` ≈ `#4a8c5c`.
- Update `theme_color` to `#4a8c5c` to match brand identity
- Add `<meta name="theme-color" content="#4a8c5c">` to `index.html`

### 4. Visual & Layout Neatness

**Glassmorphism Refinement** (`MissionMap.tsx`, `AchievementRoom.tsx`)
- Add `backdrop-blur-md` and `border border-white/20` to mission node labels and achievement cards
- Ensure consistent glass styling across both views

**Typography** (`index.css`)
- Headings already use Lexend via `font-display`. Verify all `<h1>`–`<h6>` use it.
- Add `line-height: 1.6` for body text on mobile via a base style rule

---

## Part B: Phase 2 Growth Features

### Part 1: Photo-to-Help in Chat

**UI Update** (`AIHomeworkHelper.tsx`)
- Add a camera icon button next to the chat input
- On file select: compress image client-side, convert to base64, show thumbnail preview above the input
- Send the base64 along with the message to the edge function

**Edge Function** (`ai-tutor/index.ts`)
- Accept an optional `image_base64` field in the request body
- If present, construct a multimodal message with `image_url` content type (like `homework-parse` already does)
- Prepend instruction: "Read the worksheet. Do not solve. Ask the first Socratic guiding question."

### Part 2: Weekly Digest Email

**Edge Function** (`supabase/functions/send-weekly-summary/index.ts`)
- This function already exists. Update it to:
  - Query `points` table for XP earned in last 7 days per child
  - Query `sessions` for most-practiced subject
  - Format a branded HTML email with the Fredoka/Lexend styling matching existing templates
  - Send via the project's email infrastructure (already configured)

**Cron Schedule**
- The weekly summary cron likely already exists. Verify and update the schedule to Sunday 5 PM SAST (15:00 UTC) if needed.

### Part 3: Referral Loop

**Database Changes**
- Add `referral_code` (unique text, auto-generated) and `referred_by` (uuid, nullable) columns to `profiles` table via migration
- Create a trigger to auto-generate a referral code on profile creation using `substr(md5(random()::text), 1, 8)`

**Parent Dashboard UI** (`ParentDashboard.tsx`)
- Add an "Invite & Earn" card in the Account tab
- Display the referral link: `aikidstutor.co.za/signup?ref=CODE`
- "Copy Link" button with clipboard API
- Show count of successful referrals (query profiles where `referred_by` = current user id)

**Auth Flow Update** (`Auth.tsx`)
- Capture `ref` URL parameter on the signup page
- Store it in localStorage temporarily
- After successful signup, update the new profile's `referred_by` with the referrer's user_id (looked up by referral_code)

**Payment Discount Logic** (`Paywall.tsx`)
- Check if the current user has any successful referrals
- If yes, apply 50% discount by changing the amount to `99.99` in the PayFast payload
- Display a "Referral discount applied!" badge

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/ui/loading-button.tsx` | Create |
| `src/components/AIHomeworkHelper.tsx` | Modify (visualViewport, photo upload, LoadingButton) |
| `src/components/OwlScene.tsx` | Modify (useInView) |
| `src/pages/Auth.tsx` | Modify (LoadingButton, ref param capture) |
| `src/pages/Landing.tsx` | Modify (minor) |
| `src/pages/ParentDashboard.tsx` | Modify (Invite & Earn card, Conversion event) |
| `src/pages/Paywall.tsx` | Modify (referral discount) |
| `src/pages/AchievementRoom.tsx` | Modify (glassmorphism) |
| `src/components/MissionMap.tsx` | Modify (glassmorphism) |
| `src/index.css` | Modify (line-height) |
| `vite.config.ts` | Modify (theme_color) |
| `index.html` | Modify (meta theme-color) |
| `supabase/functions/ai-tutor/index.ts` | Modify (message trimming, multimodal) |
| `supabase/functions/send-weekly-summary/index.ts` | Modify (XP digest logic) |
| `src/components/wizard/*.tsx` | Modify (LoadingButton) |
| Migration | Add referral_code, referred_by to profiles |

## Technical Notes

- `react-intersection-observer` needs to be installed as a dependency
- The referral code generation trigger runs server-side so codes are always unique
- Image compression on client will use canvas resize to keep base64 under 1MB before sending to the AI tutor
- Message trimming keeps the last 8 user/assistant messages plus system prompt to stay within token limits
- The weekly digest reuses the existing email infrastructure and templates

