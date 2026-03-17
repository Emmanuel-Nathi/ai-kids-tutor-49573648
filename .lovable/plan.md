

# useSessionHistory — Already Exists, Consolidate Remaining Duplicates

The `useSessionHistory` hook already exists at `src/hooks/useSessionHistory.ts` and is used by `ParentChildDetail.tsx`. The main improvement is eliminating the **duplicated session fetch** in `ParentAnalytics.tsx`, which queries sessions independently instead of reusing data from the hook.

## Changes

### 1. Refactor `src/components/ParentAnalytics.tsx`
- Remove its internal `useEffect` that fetches sessions from the database
- Accept `sessions` as a prop (already available from the parent via `useSessionHistory`)
- Compute `SubjectStat[]` from the passed-in sessions using `useMemo` instead of local state + fetch
- Props change: `{ childId }` → `{ sessions: SessionWithMessages[] }`

### 2. Update `src/pages/ParentChildDetail.tsx`
- Pass `sessions` to `<ParentAnalytics>` instead of `childId`:
  ```tsx
  <ParentAnalytics sessions={sessions} />
  ```

### 3. Optimize `useSessionHistory` — batch message fetching
- Currently fetches messages **one session at a time** (N+1 problem)
- Replace the sequential loop with a single query using `.in("session_id", sessionIds)` and group client-side
- This significantly reduces database round trips

No new files needed. No database changes.

