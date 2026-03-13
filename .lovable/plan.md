

# Plan: Analytics Tracking, PostHog Identify, GA4 Events & Transactional Emails

## 1. Detailed Analytics Tracking

Add PostHog `capture` and GA4 `gtag` event calls to key user actions across existing components.

### Files to edit:

**`src/pages/ChildHomework.tsx`** — After successful homework upload (~line 108):
- `posthog.capture('homework_uploaded', { child_id, subject })`
- `gtag('event', 'homework_upload', { child_id })`

**`src/pages/ChildChat.tsx`** — On chat session start (first message sent):
- `posthog.capture('chat_session_started', { child_id, subject })`
- `gtag('event', 'chat_session_start', { subject })`

**`src/pages/ChildRewards.tsx`** — After successful reward claim (~line 97):
- `posthog.capture('reward_claimed', { child_id, reward_name, point_cost })`
- `gtag('event', 'reward_claim', { reward_name, point_cost })`

**`src/pages/Auth.tsx`** — After successful sign-up (~line 31):
- `posthog.capture('user_signed_up', { email })`
- `gtag('event', 'sign_up', { method: 'email' })`

## 2. PostHog Identify on Login

**`src/pages/Auth.tsx`** — After successful sign-in (~line 34), fetch profile and call:
```
posthog.identify(user.id, { email, plan: profile.subscription_status })
```

**`src/hooks/useAuth.tsx`** — In `onAuthStateChange`, when session exists, call `posthog.identify` with the user ID and email. This covers returning sessions too.

## 3. GA4 `begin_checkout` on Trial CTA

**`src/pages/Landing.tsx`** — Replace the "Start your 30-Day Free Trial" button's `onClick` to fire `gtag('event', 'begin_checkout', { items: [{ item_name: 'AI Kids Tutor Subscription', price: 199.99, currency: 'ZAR' }] })` before navigating to `/auth`.

## 4. TypeScript Declarations

**Create `src/types/analytics.d.ts`** — Add global type declarations for `window.posthog` and `window.gtag` to avoid TS errors.

## 5. Transactional Welcome & Trial Expiration Emails

The email domain `notify.www.soulfulsound.co.za` is verified and ready.

### Database migration:
- Add a `welcome_email_sent` boolean column to `profiles` (default false)
- Create a database trigger `on_profile_created` that calls an edge function to send the welcome email

### Edge functions to create:
- **`supabase/functions/send-welcome-email/index.ts`** — Sends a branded welcome email when a new profile is created. Uses Lovable email infrastructure.
- **`supabase/functions/send-trial-warning/index.ts`** — Sends a trial expiration warning email. Calculates days remaining from `profiles.created_at + 30 days`.

### Cron job (via migration):
- Schedule `send-trial-warning` to run daily, querying profiles where `subscription_status = 'trial'` AND `created_at + 25 days <= now()` (5-day warning before trial ends).

### Email templates:
- Welcome email: "Welcome to AI Kids Tutor! 🦉" — brief intro, getting started tips
- Trial warning: "Your trial ends in X days" — upgrade CTA with pricing

## Files Summary

| File | Action |
|------|--------|
| `src/types/analytics.d.ts` | Create — global type declarations |
| `src/pages/ChildHomework.tsx` | Edit — add tracking events |
| `src/pages/ChildChat.tsx` | Edit — add tracking events |
| `src/pages/ChildRewards.tsx` | Edit — add tracking events |
| `src/pages/Auth.tsx` | Edit — add sign-up tracking + PostHog identify |
| `src/pages/Landing.tsx` | Edit — add begin_checkout event |
| `src/hooks/useAuth.tsx` | Edit — add PostHog identify on session |
| `supabase/functions/send-welcome-email/index.ts` | Create |
| `supabase/functions/send-trial-warning/index.ts` | Create |
| Database migration | Add `welcome_email_sent` column, trigger, cron job |

