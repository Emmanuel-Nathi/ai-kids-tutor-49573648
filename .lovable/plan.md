

# Plan: Activities Expansion, Parent Notifications, Kid Keypad Login, and Co-Parent Invite

## What Already Exists
- Child Login page with name + OTP PIN input (`ChildLogin.tsx`) + edge function
- Add Child button in Parent Dashboard
- Activity filtering by curriculum
- CAPS has 10 activities, IEB has 4, Cambridge has 4, General has 4

## Changes

### 1. Add More IEB and Cambridge Activities (match CAPS count of 10)

**File: `src/pages/ChildActivities.tsx`**
- Add 6 more IEB activities: Debate Prep (55 XP), Data Analysis (50 XP), Literature Review (40 XP), Ethical Reasoning (45 XP), Scientific Method (50 XP), IEB Essay Writing (55 XP)
- Add 6 more Cambridge activities: IGCSE Problem Solving (50 XP), Cambridge Essay (45 XP), Historical Source Analysis (40 XP), Environmental Science (45 XP), Mathematical Reasoning (50 XP), Cambridge Literature (40 XP)

### 2. Parent Notification Toast on Activity XP

**File: `src/pages/ChildActivities.tsx`**
- After `startActivity` creates a session and awards XP via the calculate-points edge function, the parent sees a toast on their dashboard. Since parent and child are different sessions, use a `points` table realtime subscription on `ParentDashboard.tsx` to trigger a toast when new points are inserted for any of the parent's children.

**File: `src/pages/ParentDashboard.tsx`**
- Add a realtime subscription to the `points` table filtered by child IDs. On INSERT, show `toast.info("${childName} earned ${amount} XP for ${reason}!")`.

### 3. Kid-Friendly Numeric Keypad Login

**File: `src/pages/ChildLogin.tsx`**
- Replace the current name input + OTP with a large numeric keypad (0-9, Clear, Go buttons)
- PIN-only login (no name required) — update the `child-login` edge function to look up by PIN alone
- Large colorful buttons sized for small fingers, star display for entered digits

**File: `supabase/functions/child-login/index.ts`**
- Support PIN-only mode: if only `pin` is provided (no `name`), query children by `access_pin` alone

### 4. Invite Co-Parent Section

**File: `src/pages/ParentDashboard.tsx`**
- Add an "Invite Co-Parent" card/button in the Children tab
- Opens a dialog with an email input
- Calls `supabase.auth.admin.inviteUserByEmail()` — but since this requires service role, create an edge function `invite-coparent` that sends the invite and links the co-parent to the same children

**File: `supabase/functions/invite-coparent/index.ts`** (new)
- Accepts `email` + `parent_id`, uses service role to call `supabase.auth.admin.inviteUserByEmail()`, stores a pending co-parent relationship

**Database migration needed:**
- Create `co_parents` table: `id`, `primary_parent_id`, `invited_email`, `invited_user_id` (nullable), `status` (pending/accepted), `created_at`
- RLS: parents can view/insert their own co-parent records

## Files to Change/Create

| File | Change |
|------|--------|
| `src/pages/ChildActivities.tsx` | Add 6 IEB + 6 Cambridge activities |
| `src/pages/ParentDashboard.tsx` | Add realtime points subscription for toasts + co-parent invite UI |
| `src/pages/ChildLogin.tsx` | Replace with large numeric keypad UI |
| `supabase/functions/child-login/index.ts` | Support PIN-only lookup |
| `supabase/functions/invite-coparent/index.ts` | New edge function for co-parent invite |
| Database migration | Create `co_parents` table with RLS |

## Build Order
1. Add IEB + Cambridge activities
2. Add realtime parent notification toast
3. Redesign child login with numeric keypad + update edge function
4. Create co-parents table migration
5. Create invite-coparent edge function
6. Add invite co-parent UI to parent dashboard

