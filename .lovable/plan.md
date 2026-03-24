

# Daily Login Streak, Admin Enhancements, and PIN Fix

## Overview
Three changes: (1) daily login streak with bonus XP, (2) enhanced admin dashboard, (3) PIN creation audit.

---

## 1. Daily Login Streak System

### Database
- Create a `daily_logins` table to track child logins per day:
  - `id` (uuid, PK), `child_id` (uuid, NOT NULL), `login_date` (date, NOT NULL), `created_at` (timestamptz)
  - Unique constraint on `(child_id, login_date)`
- RLS: allow insert/select where child's `parent_id = auth.uid()` (same pattern as other child tables)

### Backend Logic
- On child home page load, upsert a row into `daily_logins` for today (using `ON CONFLICT DO NOTHING` via the edge function or client-side insert)
- Since child login is PIN-based (no auth user), use the existing `child-login` edge function: after successful PIN verification, also insert today's login row using service role
- Calculate streak from `daily_logins` instead of sessions — more accurate

### Bonus XP
- Award bonus XP on streak milestones: 3-day = +10 XP, 7-day = +25 XP, 14-day = +50 XP, 30-day = +100 XP
- Insert into `points` table with reason `"streak_bonus_3"` etc. via the `child-login` edge function
- Prevent duplicate awards by checking if a points row with that reason already exists for that streak period

### Frontend (ChildHome.tsx)
- Already shows streak with fire emoji — update `useChildData` to calculate streak from `daily_logins` table instead of sessions
- Add a streak milestone banner when a bonus is earned (e.g., "🔥 7-day streak! +25 XP bonus!")

---

## 2. Enhanced Admin Dashboard

### Edge Function (`admin-dashboard/index.ts`)
Add new actions to the existing function:
- `get-detailed-stats`: Return total users, active/trial/cancelled counts, total children, total sessions (last 7 days), total XP
- `list-recent-activity`: Return last 20 sessions with child name, subject, duration

### Frontend (`AdminDashboard.tsx`)
- Add stat cards: Total Children, Sessions (7d), Trial Users
- Add an "Active Users" section showing users who had sessions in the last 7 days
- Add a "Recent Activity" table showing recent sessions

---

## 3. PIN Creation Fix

### Current State Audit
The PIN step and insert logic look correct:
- `PinStep` component properly limits to 4 digits
- `ChildSetupWizard` inserts with `access_pin: pin`
- `children` table has `access_pin` as nullable text column
- The insert uses `as any` cast — this works but bypasses type safety

### Fix
- Remove the `as any` cast from the insert in `ChildSetupWizard.tsx` — the types already support `access_pin` in the Insert type
- Add validation feedback: show "PIN must be exactly 4 digits" message if user tries to complete with partial PIN
- Ensure the `child-login` edge function handles edge cases (empty name, whitespace PIN)

---

## Technical Details

### Files to Create
- `supabase/migrations/XXXX_daily_logins.sql` — new table + RLS

### Files to Modify
- `supabase/functions/child-login/index.ts` — record daily login + award streak bonuses
- `src/hooks/useChildData.ts` — fetch streak from `daily_logins` instead of sessions
- `src/pages/ChildHome.tsx` — add streak milestone toast
- `src/pages/AdminDashboard.tsx` — add detailed stats and activity sections
- `supabase/functions/admin-dashboard/index.ts` — add new actions
- `src/components/ChildSetupWizard.tsx` — remove `as any` cast, add PIN validation message

