

# Plan: Admin Dashboard + Analytics + Security Hardening

## 1. Admin Role Setup (Database Migration)

Add an `admin` value to the existing `app_role` enum type, then use the existing `has_role()` security definer function to gate admin access. No changes to `profiles` table needed — admin status lives in `user_roles` table per project conventions.

```sql
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
```

## 2. Admin Dashboard Page

### Create: `src/pages/AdminDashboard.tsx`

- Uses `has_role(auth.uid(), 'admin')` via an RPC call to check access
- If not admin, shows a 403 Access Denied message
- Dashboard sections:
  - **Top stat cards**: Total Users, Active Subscriptions, Total XP Earned (queried from `profiles`, `points` tables)
  - **Subscribers table** (shadcn Table): parent display names, subscription status, trial end date (calculated from `created_at + 30 days`)
  - **Action column**: dropdown menu to manually Cancel or Activate subscription (updates `profiles.subscription_status`)
- All admin queries will use a new edge function `admin-dashboard` that verifies the caller has the admin role via `has_role()` before returning data, since RLS on profiles only allows users to see their own data

### Create: `supabase/functions/admin-dashboard/index.ts`

- Verifies JWT and checks `has_role(user_id, 'admin')` 
- Supports actions: `get-stats`, `list-subscribers`, `update-subscription`
- Returns aggregated data from profiles, points tables using service role key

### Edit: `src/App.tsx`

- Add route `/admin` pointing to `AdminDashboard`

## 3. Subtle Admin Footer Link

### Edit: `src/pages/Landing.tsx`

- Add a small, plain text link "Admin" in the footer that navigates to `/admin`

## 4. Analytics Integration (PostHog & Google Analytics)

Since PostHog and Google Analytics require API keys from the user, I'll scaffold the integration points but need the user to provide:
- PostHog project API key
- Google Analytics measurement ID (G-XXXXXXXXXX)

These are **public/publishable keys** so they can be stored directly in the codebase.

### Edit: `index.html`
- Add PostHog and GA4 script tags with placeholder keys

### Edit: `src/components/ChildSetupWizard.tsx`
- Add PostHog `capture` calls on step transitions for onboarding funnel tracking

## 5. RLS Security Review

The existing RLS policies are already well-structured — parents can only access their own data. The tables mentioned (rewards, profiles) already have correct owner-based RLS. No additional RLS changes needed based on the current schema review.

---

## Files Summary

| File | Action |
|------|--------|
| Database migration | Add `admin` to `app_role` enum |
| `supabase/functions/admin-dashboard/index.ts` | Create — admin API with role verification |
| `src/pages/AdminDashboard.tsx` | Create — admin dashboard UI |
| `src/App.tsx` | Edit — add `/admin` route |
| `src/pages/Landing.tsx` | Edit — add subtle admin link in footer |
| `index.html` | Edit — add analytics scripts (after user provides keys) |
| `src/components/ChildSetupWizard.tsx` | Edit — add PostHog tracking events |

