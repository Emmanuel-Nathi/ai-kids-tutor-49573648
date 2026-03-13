

# Phase 1 Production Audit — Implementation Plan

## 1. Onboarding Flow Fixes

### "Get Started" button routing
Currently the Landing page "Get Started" button navigates to `/auth` (line 57). After auth, the user is redirected to `/parent`. The flow to `ChildSetupWizard` is via the "Add Child" button on ParentDashboard. This is correct — no change needed.

### ChildSetupWizard saves to `children` table (not `profiles`)
The wizard correctly inserts into the `children` table (line 55). No fix needed.

### Loading states on buttons
Add loading/disabled states with spinner to:
- `ChildSetupWizard` "Complete Setup" button — already has `saving` state, good
- `ParentDashboard` — add child, add reward, co-parent invite buttons need `disabled` during submission
- `Auth.tsx` — already has `loading` state, good
- `ChildRewards.tsx` — `claimReward` button needs a loading state per-reward

## 2. AI & Voice Reliability

### AIHomeworkHelper error handling
- Improve the catch block (line 171-175) to show the friendly message: "My brain is taking a quick nap! 💤 Please try again in a moment."
- Add 429/402 handling like ChildChat already has

### SpeechRecognition permission denied
- In `toggleListening()`, the `onerror` handler (line 74) silently sets `isListening(false)`. Add a toast: `toast.error("Microphone access denied. Please allow microphone in your browser settings.")` when `event.error === 'not-allowed'`

## 3. Paywall & Trial Logic

### SubscriptionGuard
- Currently checks `daysSinceCreation > 30` — correct
- Uses `.single()` correctly
- No issues found

### Payment success tracking
- Already implemented with GA4 purchase event, PostHog capture, toast, and URL cleanup. Verified correct.

## 4. Mobile & PWA

### PIN login pad mobile
- ChildLogin uses `max-w-xs` and `h-16` buttons — reasonable on iPhone SE (320px wide)
- No major issue but add `safe-area-inset` padding to chat input to avoid keyboard overlap

### Chat input keyboard overlap
- `ChildChat.tsx` uses `h-screen` flex layout with `shrink-0` on the input bar — this should work with mobile viewport. Add `pb-safe` (env safe-area-inset-bottom) to the input container for notched phones.

### PWA manifest
- Already configured in `vite.config.ts` via `VitePWA` plugin with icons, display standalone, etc. No `<link rel="manifest">` needed — VitePWA injects it automatically. Verified correct.

## 5. Security & Admin Guard

### AdminDashboard access
- Uses `has_role` RPC with security definer function — correct
- Shows 403 for non-admins — correct
- Edge function `admin-dashboard` should also verify admin role server-side (need to check)

### Supabase query safety
- Most queries use `.single()` appropriately
- `ChildHome.tsx` line 49 uses `.single()` — correct
- No obvious `.select("*")` without filters that could leak data

## 6. Empty States

### ChildRewards — no rewards
- Already has an empty state (lines 161-168): "No rewards available yet. Ask your parent to set some up!" — but should say "Coming Soon" per requirements. Will update message.

### ChildRewards — zero XP
- The OwlMascot message handles this (line 131): `totalPoints > 0 ? "Great work!" : "Keep learning to earn more points! ⭐"` — update to "Earn your first stars to unlock rewards! 🌟"

## 7. Bundle Optimization

### Console.logs
- Search for `console.log` and `console.error` in source files, remove non-essential ones
- Keep `console.error` in catch blocks for edge functions (these run server-side)

### Lazy loading images
- Add `loading="lazy"` to images on Landing page and elsewhere

---

## Files to Edit

| File | Changes |
|------|---------|
| `src/components/AIHomeworkHelper.tsx` | Friendly error msg, 429/402 handling, speech permission toast |
| `src/pages/ChildRewards.tsx` | Updated empty states, loading state on claim buttons |
| `src/pages/ChildChat.tsx` | Add `pb-safe` to input container |
| `src/pages/ChildLogin.tsx` | Add `pb-safe` for notched phones |
| `src/pages/ParentDashboard.tsx` | Loading states on add-child/reward/invite actions |
| `src/pages/Landing.tsx` | Lazy load images |
| `src/index.css` | Add `pb-safe` utility if needed |

**No database changes required.**

