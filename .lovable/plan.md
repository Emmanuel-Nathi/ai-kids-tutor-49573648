

# Plan: Add Subscription Manager + Parent Analytics

## What Already Exists (No Changes Needed)
- **Paywall page** (`src/pages/Paywall.tsx`) — fully implemented with Payfast sandbox form submission
- **Payfast webhook** (`supabase/functions/payfast-webhook/index.ts`) — processes ITN and updates `subscription_status`
- **SubscriptionGuard** (`src/components/SubscriptionGuard.tsx`) — checks trial expiry + subscription status
- **Google login** (`src/pages/Auth.tsx`) — already fixed with `/auth` redirect
- **Privilege Store** (`src/pages/ChildRewards.tsx`) — already deducts XP via `calculate-points` edge function
- **`subscription_status`** column on `profiles` — already exists

## What's New

### 1. SubscriptionManager Component
**New file: `src/components/SubscriptionManager.tsx`**
- Fetch `subscription_status` and `created_at` from profiles
- Display status with Badge (green=Active, yellow=Trial, red=Cancelled)
- Calculate and show trial end date (created_at + 30 days)
- "Cancel Subscription" destructive button that updates `subscription_status` to `'cancelled'`
- Show success toast on cancellation

### 2. Add SubscriptionManager to Parent Dashboard
**Edit: `src/pages/ParentDashboard.tsx`**
- Add a third tab "Account" to the existing Tabs component
- Render SubscriptionManager inside it

### 3. ParentAnalytics Component
**New file: `src/components/ParentAnalytics.tsx`**
- Use recharts `BarChart` showing average accuracy per subject (Math, English, Science)
- Derive data from `sessions` table (using `interaction_summary` or session counts per subject)
- Card highlighting the "Struggling Subject" with `AlertTriangle` icon
- Accept `childId` as prop

### 4. Add Analytics to ParentChildDetail
**Edit: `src/pages/ParentChildDetail.tsx`**
- Render ParentAnalytics component for the selected child

## Files to Create/Edit

| File | Action |
|------|--------|
| `src/components/SubscriptionManager.tsx` | Create — subscription status card with cancel button |
| `src/components/ParentAnalytics.tsx` | Create — recharts bar chart + struggling subject card |
| `src/pages/ParentDashboard.tsx` | Add "Account" tab with SubscriptionManager |
| `src/pages/ParentChildDetail.tsx` | Add ParentAnalytics section |

No database migration needed.

