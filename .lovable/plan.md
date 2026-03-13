

# Plan: Payment Success Tracking & PostHog Key Update

## Changes

### 1. ParentDashboard.tsx — Add payment success tracking
Add `useSearchParams` hook. In a `useEffect`, check for `payment=success` param. If found:
- Fire GA4 `purchase` event (value: 199.99, currency: ZAR, transaction_id: `PF_<random>`)
- Fire PostHog `Subscription Started` event (amount: 199.99, currency: ZAR, plan: Monthly)
- Clean URL via `window.history.replaceState({}, document.title, "/parent")` to prevent double-firing on refresh

### 2. index.html — Update PostHog project key
Replace current PostHog init key `phc_85IDA0KgURTFV76O3gPlPvAGPLYhrlwbhfe6isvVHx` with new key `phc_CfjCPuQ7ioIArPqPWfcN0rPuYWcYL3eL5AvCoIZvAvg`.

### 3. No changes to Paywall.tsx
The return URL is already correctly set to `/parent?payment=success` (line 22). No update needed.

### 4. No changes to payfast-webhook
The edge function remains the source of truth for unlocking features (updating `subscription_status` to `active`). The frontend tracking is purely for analytics reporting.

## Files

| File | Action |
|------|--------|
| `src/pages/ParentDashboard.tsx` | Edit — add payment success tracking useEffect |
| `index.html` | Edit — swap PostHog project key |

