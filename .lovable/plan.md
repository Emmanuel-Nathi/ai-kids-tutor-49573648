

# Plan: Fix Google Login + Paywall with Payfast

## 1. Fix Google Login

The Google OAuth code in `Auth.tsx` already uses `lovable.auth.signInWithOAuth("google", ...)` correctly. The issue is the `redirect_uri` is set to `window.location.origin` (i.e., `/`), which lands on the Landing page instead of `/auth` where the `useEffect` redirect to `/parent` lives.

**Fix:** Change `redirect_uri` to `window.location.origin + '/auth'` so after OAuth, the user lands on the Auth page, the session is detected, and they're redirected to `/parent`.

## 2. Add `subscription_status` Column to Profiles

**Database migration:** Add `subscription_status` text column (default `'trial'`) to the `profiles` table. Values: `trial`, `active`, `cancelled`.

## 3. Create Paywall Page

**New file: `src/pages/Paywall.tsx`**
- Card with "Your 30-day free trial has ended" message
- Pricing display: R199.99/month
- Feature list (unlimited activities, dashboard, rewards store)
- "Subscribe with Payfast" button that dynamically creates an HTML form with sandbox credentials and submits to `https://sandbox.payfast.co.za/eng/process`
- Props derived from auth context (parent ID, email)
- Payfast fields: `merchant_id`, `merchant_key`, `return_url` → `/parent?payment=success`, `cancel_url` → `/paywall`, `notify_url` → edge function URL, `amount: "199.99"`, `subscription_type: "1"`, `frequency: "3"`, `cycles: "0"`

## 4. Create SubscriptionGuard Component

**New file: `src/components/SubscriptionGuard.tsx`**
- Wraps protected parent routes
- Checks profile `created_at` — if > 30 days old AND `subscription_status !== 'active'`, redirect to `/paywall`
- Shows loading state while checking

## 5. Create Payfast Webhook Edge Function

**New file: `supabase/functions/payfast-webhook/index.ts`**
- Receives ITN (Instant Transaction Notification) POST from Payfast
- Validates the payment data
- Updates `profiles.subscription_status = 'active'` for the parent identified by `m_payment_id`
- Returns 200 OK

## 6. Update Routes

**File: `src/App.tsx`**
- Add `/paywall` route
- Wrap `/parent` and `/parent/child/:childId` routes with `SubscriptionGuard`

## Files to Change/Create

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Fix redirect_uri to include `/auth` path |
| `src/pages/Paywall.tsx` | New — paywall UI with Payfast form submission |
| `src/components/SubscriptionGuard.tsx` | New — trial expiry check + redirect |
| `supabase/functions/payfast-webhook/index.ts` | New — ITN webhook to activate subscription |
| `src/App.tsx` | Add paywall route, wrap parent routes with guard |
| Database migration | Add `subscription_status` column to profiles |
| `supabase/config.toml` | Add payfast-webhook function config |

## Build Order
1. Fix Google login redirect_uri
2. Database migration for subscription_status
3. Create Paywall page
4. Create SubscriptionGuard
5. Create payfast-webhook edge function
6. Update App.tsx routes

