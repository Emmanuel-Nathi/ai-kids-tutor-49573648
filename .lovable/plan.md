

# Plan: Auth Page Google Sign-In, Daily Streak, and IEB Enhancements

The user's request bundles three features. Here's what's needed and what's already done.

## 1. Auth Page: Google Sign-In + "Get Started" Button

**What:** Add a "Sign in with Google" button and a "Get Started" outline button to `Auth.tsx`.

**Important:** Per Lovable Cloud docs, Google OAuth must use `lovable.auth.signInWithOAuth("google", ...)` — NOT `supabase.auth.signInWithOAuth`. I'll need to run the **Configure Social Login** tool first to generate the Lovable module, then import it.

**Changes to `src/pages/Auth.tsx`:**
- Add Google sign-in button below the email/password form (with a divider "or")
- Use `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` 
- Add "Get Started" outline button that calls `navigate("/")`
- Keep existing email/password form intact

## 2. Daily Streak with Fire Emoji

**What:** Add a streak counter with a Flame icon to the child's home page.

**Approach:** Track streaks by checking the most recent session dates. Display a `Flame` icon (lucide-react) with streak count in the `ChildHome.tsx` header alongside the existing XP display.

**No database migration needed** — we can calculate streaks from existing `sessions` table by counting consecutive days with at least one session.

**Changes:**
- `src/pages/ChildHome.tsx`: Add streak calculation from sessions data, display `Flame` icon with count in header
- `src/pages/ChildProfile.tsx`: Show streak on profile page too

## 3. IEB Curriculum Activities

**Already done.** `ChildActivities.tsx` already has IEB-specific entries including "Critical Thinking Puzzle" and "Analytical Writing." No changes needed here.

## Files to Change

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Add Google sign-in button + "Get Started" outline button |
| `src/pages/ChildHome.tsx` | Add daily streak display with Flame icon |
| `src/pages/ChildProfile.tsx` | Add streak display |

## Build Order
1. Configure Social Login tool (generates Lovable module for Google OAuth)
2. Update Auth.tsx with Google button + Get Started button
3. Add streak logic + Flame icon to ChildHome and ChildProfile

