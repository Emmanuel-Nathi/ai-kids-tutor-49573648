

# Plan: Payment Toast + Email Infrastructure Setup

## 1. Payment Success Toast (`src/pages/ParentDashboard.tsx`)
Add a success toast notification inside the existing `payment=success` useEffect (line 70-85), right before the URL cleanup:
```
toast.success("Payment successful! 🎉 Your subscription is now active.");
```

## 2. Email Infrastructure
The domain `www.aikidstutor.co.za` is currently pending DNS verification (status: `active_provisioning`). While DNS verifies, we can:

1. **Set up email infrastructure** — run `setup_email_infra` to create the database tables, email queue, and cron job
2. **Scaffold auth email templates** — create branded auth email templates (signup confirmation, password reset, etc.) using the `aikidstutor.co.za` domain
3. **Deploy the auth-email-hook** edge function
4. **Update `send-welcome-email` and `send-trial-warning`** edge functions to use the new email queue/infrastructure instead of raw fetch calls

Once DNS verification completes (up to 72 hours), emails will start sending automatically.

## Files

| File | Action |
|------|--------|
| `src/pages/ParentDashboard.tsx` | Edit line ~82 — add `toast.success()` |
| `supabase/functions/auth-email-hook/*` | Create — scaffolded auth email templates |
| `supabase/functions/_shared/email-templates/*.tsx` | Create — 6 branded email templates |
| `supabase/functions/send-welcome-email/index.ts` | Update — use email queue infrastructure |
| `supabase/functions/send-trial-warning/index.ts` | Update — use email queue infrastructure |

