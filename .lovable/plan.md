

# Fix Child Access Flow — PIN-Based (No Parent Auth Required)

## Problem
Currently, child pages (ChildHome, ChildChat, etc.) check for a Supabase auth session and redirect to `/auth` if none exists. But children log in via PIN — they never have an auth session. Additionally, all child data queries go through RLS policies that require `auth.uid()`, which fails for unauthenticated child sessions.

## Solution
Store the child's identity in localStorage after PIN login. Remove the auth redirect from child pages. Add RLS policies allowing anonymous access to child data by child ID, or better — use an edge function approach to keep data secure.

---

## Changes

### 1. Store child session in localStorage (`src/pages/ChildLogin.tsx`)
After successful PIN login, store `{ child_id, name }` in `localStorage` so child pages can identify the logged-in child without Supabase auth.

### 2. Create a child session context (`src/hooks/useChildSession.tsx`)
New context/hook that:
- Reads `child_id` and `name` from localStorage
- Validates the URL param `childId` matches the stored session
- Redirects to `/child-login` if no valid child session exists
- Provides a `logout` function that clears localStorage and navigates to `/child-login`

### 3. Remove auth requirement from child pages
- **`ChildHome.tsx`**: Remove `useAuth` import and the `useEffect` that redirects to `/auth`. Use `useChildSession` instead to validate access.
- **`AppLayout.tsx`**: Check if it enforces auth — if so, make it optional for child routes.

### 4. Add anonymous-friendly RLS policies for child data
Add SELECT policies on `children`, `points`, `sessions`, `daily_logins`, `reward_claims`, `rewards`, `messages` tables that allow the `anon` role to read data by `child_id` directly. This is acceptable because child IDs are UUIDs (unguessable) and children don't have sensitive data.

Migration will add policies like:
```sql
CREATE POLICY "Anon can view child by id" ON children
FOR SELECT TO anon USING (true);
-- Scoped by the query's .eq("id", childId)
```

Actually, a more secure approach: add policies scoped to anon that only allow SELECT (read-only) — children can view but not modify data via the client.

For INSERT operations (sessions, messages, points, reward_claims), add anon INSERT policies so children can create sessions and earn points.

### 5. Update `useChildData.ts`
No code changes needed — it already queries by `childId`. Once RLS allows anon access, it will work.

### 6. Update child page components
- **`ChildHome.tsx`**: Replace auth check with child session check
- **`ChildChat.tsx`**, **`ChildHomework.tsx`**, **`ChildRewards.tsx`**, **`ChildActivities.tsx`**, **`ChildProfile.tsx`**: Same — remove any auth dependency, use child session validation

### 7. Landing page CTA
Update the landing page's main CTA buttons to direct children to `/child-login` and parents to `/auth`.

---

## Files to Create
- `src/hooks/useChildSession.tsx` — child session context from localStorage

## Files to Modify
- `src/pages/ChildLogin.tsx` — save child session to localStorage on success
- `src/pages/ChildHome.tsx` — remove auth redirect, use child session
- `src/pages/ChildChat.tsx` — remove auth dependency
- `src/pages/ChildHomework.tsx` — remove auth dependency  
- `src/pages/ChildRewards.tsx` — remove auth dependency
- `src/pages/ChildActivities.tsx` — remove auth dependency
- `src/pages/ChildProfile.tsx` — remove auth dependency
- `src/components/AppLayout.tsx` — ensure no auth gate for child routes

## Database Migration
- Add anon SELECT policies on: `children`, `points`, `sessions`, `daily_logins`, `reward_claims`, `rewards`, `messages`
- Add anon INSERT policies on: `sessions`, `messages` (so children can start sessions and chat)

## Security Notes
- Child IDs are UUIDs — effectively unguessable
- Anon policies are read-only for most tables, insert-only for sessions/messages
- Parent data remains fully protected behind auth
- No sensitive data is exposed through child access

